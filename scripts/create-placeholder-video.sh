#!/bin/bash

# Create a simple black placeholder video using FFmpeg
# This requires FFmpeg to be installed

if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "  macOS: brew install ffmpeg"
    exit 1
fi

mkdir -p ../assets/videos

echo "Creating placeholder video..."
ffmpeg -f lavfi -i color=c=black:s=1080x1920:r=30 -f lavfi -i anullsrc=r=44100:cl=stereo -t 10 -pix_fmt yuv420p ../assets/videos/default.mp4

echo "Placeholder video created at assets/videos/default.mp4"
echo "You can replace this with a proper background video from:"
echo "  - https://www.pexels.com/videos/"
echo "  - https://pixabay.com/videos/"
echo "  - https://coverr.co/"
