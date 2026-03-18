#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Uso: $0 <input_video> <output_dir>" >&2
  exit 1
fi

INPUT_VIDEO="$1"
OUTPUT_DIR="$2"

mkdir -p "$OUTPUT_DIR"

FILTER_COMPLEX="\
[0:v]split=3[v1][v2][v3]; \
[v1]scale=w=426:h=240:force_original_aspect_ratio=decrease,pad=426:240:(ow-iw)/2:(oh-ih)/2[v240]; \
[v2]scale=w=640:h=360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2[v360]; \
[v3]scale=w=854:h=480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2[v480]"

COMMON_ARGS=(
  -y
  -i "$INPUT_VIDEO"
  -filter_complex "$FILTER_COMPLEX"
  -c:v libx264
  -preset veryfast
  -profile:v main
  -g 48
  -keyint_min 48
  -sc_threshold 0
  -b:v:0 400k -maxrate:v:0 428k -bufsize:v:0 600k
  -b:v:1 900k -maxrate:v:1 963k -bufsize:v:1 1200k
  -b:v:2 1600k -maxrate:v:2 1712k -bufsize:v:2 2400k
  -use_timeline 1
  -use_template 1
  -init_seg_name "init-\$RepresentationID\$.m4s"
  -media_seg_name "chunk-\$RepresentationID\$-\$Number%05d\$.m4s"
  -f dash "$OUTPUT_DIR/manifest.mpd"
)

if ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$INPUT_VIDEO" | grep -q audio; then
  ffmpeg "${COMMON_ARGS[@]}" \
    -map "[v240]" -map 0:a:0 \
    -map "[v360]" -map 0:a:0 \
    -map "[v480]" -map 0:a:0 \
    -c:a aac \
    -b:a:0 96k -b:a:1 128k -b:a:2 128k \
    -adaptation_sets "id=0,streams=v id=1,streams=a"
else
  ffmpeg "${COMMON_ARGS[@]}" \
    -map "[v240]" \
    -map "[v360]" \
    -map "[v480]" \
    -adaptation_sets "id=0,streams=v"
fi
