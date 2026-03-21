// Import module to execute SO commands
const child_process = require('child_process');
const path = require('path');

// Encode an input user icon with ??? format to an output icon with png format
module.exports.normalize = (inputIconPath, outputIconPath) => {
// user with id=x -> inputIconPath = /uploads/user-x.???
// user with id=x -> outputIconPath = /users/user-x.png
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -y -i ${inputIconPath} ${outputIconPath}`;

    // Transcode the input user icon
    child_process.exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`Transcoding error. ${stderr}`));
      }
      resolve(outputIconPath);
    });
  });
}

// Encode an input video with ??? format to an output video with mp4 format
exports.encodeMp4 = (inputVideoPath, outputVideoPath) => {
// video with id=x -> inputVideoPath = /uploads/video-x.???
// video with id=x -> outputVideoPath = /videos/video-x.mp4
    return new Promise((resolve, reject) => {
        // ffmpeg command to convert the video to mp4 format with stardard codec
        const command = `ffmpeg -y -i "${inputVideoPath}" -c:v libx264 -c:a aac "${outputVideoPath}"`;

        // Encode
        child_process.exec(command, (err, stdout, stderr) => {
        if (err) {
            return reject(new Error(`Encoding error. ${stderr}`));
        }
        resolve(outputVideoPath);
        });
    });
}

// Extract a representative frame (thumbnail) at the beginning of an input video
exports.getThumbnail = (inputVideoPath, outputThumbnailPath) => {
// video with id=x -> inputVideoPath = /videos/video-x.mp4
// video with id=x -> outputThumbnailPath = /videos/video-x.png
    return new Promise((resolve, reject) => {
      // ffmpeg command to extract the frame at the beginning of video 
      const command = `ffmpeg -y -i "${inputVideoPath}" -ss 00:00:01 -vframes 1 "${outputThumbnailPath}"`;

      // Encode
      child_process.exec(command, (err, stdout, stderr) => {
        if (err) {
          return reject(new Error(`Encoding error. ${stderr}`));
        }
        resolve(outputThumbnailPath);
      });
    });
}

// Generate dash content from an input video
exports.encodeDash = (inputVideoPath, outputDashContentPath) => {
    return new Promise((resolve, reject) => {

        const filterComplex = [
            "[0:v]setsar=1,split=3[v1][v2][v3];",
            "[v1]scale=426:240:force_original_aspect_ratio=decrease,pad=426:240:(ow-iw)/2:(oh-ih)/2,setsar=1[v240];",
            "[v2]scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1[v360];",
            "[v3]scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2,setsar=1[v480]"
        ].join(" ");

        const outputManifest = `"${outputDashContentPath}/manifest.mpd"`;

        const command = [
            `ffmpeg -y -i "${inputVideoPath}"`,
            `-filter_complex "${filterComplex}"`,
            `-map "[v240]" -map "[v360]" -map "[v480]" -map 0:a:0`,
            `-c:v libx264 -preset veryfast -profile:v baseline`,
            `-g 48 -keyint_min 48 -sc_threshold 0`,
            `-b:v:0 400k -maxrate:v:0 428k -bufsize:v:0 600k`,
            `-b:v:1 900k -maxrate:v:1 963k -bufsize:v:1 1200k`,
            `-b:v:2 1600k -maxrate:v:2 1712k -bufsize:v:2 2400k`,
            `-c:a aac -b:a:0 128k`,
            `-use_timeline 1 -use_template 1`,
            `-init_seg_name "init-$RepresentationID$.m4s"`,
            `-media_seg_name "chunk-$RepresentationID$-$Number%05d$.m4s"`,
            `-adaptation_sets "id=0,streams=0 id=1,streams=1 id=2,streams=2 id=3,streams=3"`,
            `-f dash ${outputManifest}`
        ].join(" ");

        const fs = require('fs');
        if (!fs.existsSync(outputDashContentPath)) {
            fs.mkdirSync(outputDashContentPath, { recursive: true });
        }

        child_process.exec(command, (err, stdout, stderr) => {
            if (err) {
                return reject(new Error(`Encoding error. ${stderr}`));
            }
            resolve(outputDashContentPath);
        });
    });
}