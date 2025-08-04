#!/bin/bash
# Setup desktop environment for computer use

echo "Setting up computer use environment for Ron AI..."

# Install required packages
sudo apt update
sudo apt install -y xvfb xdotool imagemagick x11-utils openbox gnome-terminal

# Start virtual display
export DISPLAY=:1
echo "Starting Xvfb on display :1..."
Xvfb :1 -screen 0 1024x768x24 -ac &
sleep 2

# Start window manager
echo "Starting openbox window manager..."
DISPLAY=:1 openbox &
sleep 2

# Create screenshots directory
mkdir -p /tmp/claude_screenshots
chmod 755 /tmp/claude_screenshots

# Test screenshot capability
echo "Testing screenshot capability..."
DISPLAY=:1 xwd -root | convert xwd:- png:/tmp/claude_screenshots/test.png

if [ -f "/tmp/claude_screenshots/test.png" ]; then
    echo "✓ Screenshot test successful"
    rm /tmp/claude_screenshots/test.png
else
    echo "✗ Screenshot test failed"
fi

# Test xdotool
echo "Testing xdotool..."
DISPLAY=:1 xdotool getdisplaygeometry
if [ $? -eq 0 ]; then
    echo "✓ xdotool test successful"
else
    echo "✗ xdotool test failed"
fi

echo "Computer use environment setup complete!"
echo "Display: $DISPLAY"
echo "Screenshot directory: /tmp/claude_screenshots/"