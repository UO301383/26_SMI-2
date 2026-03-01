// Import module to execute SO commands
const child_process = require('child_process');

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
// video with id=x -> inputVideoPath = /videos/video-x.mp4
// video with id=x -> outputDashContentPath = /videos/video-x
    return new Promise((resolve, reject) => {
      // command to run a bash script for dash encoding 
      const command = `script_encoding.sh "${inputVideoPath}"`;
      // const command = `./script_encoding.sh ${inputVideoPath}`; for final deployment in a linux server 
  
      // Encode (representations and manifest files are moved to outputDashContentPath)
      child_process.exec(command, (err, stdout, stderr) => {
        if (err) {
          return reject(new Error(`Encoding error. ${stderr}`));
        }
        resolve(outputDashContentPath);
      });
    });
}