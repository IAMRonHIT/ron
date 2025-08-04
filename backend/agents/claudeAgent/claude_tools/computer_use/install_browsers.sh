#!/bin/bash
# Install browsers properly

echo "=== Installing Web Browsers ==="

# Install Firefox ESR (Extended Support Release) from apt
echo "Installing Firefox ESR..."
sudo apt-get update
sudo apt-get install -y firefox-esr

# Create Firefox desktop shortcut
cat > ~/Desktop/firefox.desktop << 'EOF'
[Desktop Entry]
Name=Firefox ESR
Comment=Web Browser
Exec=/usr/bin/firefox-esr %u
Icon=firefox-esr
Type=Application
Categories=Network;WebBrowser;
EOF

chmod +x ~/Desktop/firefox.desktop

# Check if Chromium is properly installed
if ! command -v chromium-browser &> /dev/null; then
    echo "Installing Chromium..."
    sudo apt-get install -y chromium-browser
fi

# Test browsers
echo ""
echo "=== Browser Installation Complete ==="
echo ""
echo "Firefox ESR: $(firefox-esr --version 2>&1 | head -1)"
echo "Chromium: $(chromium-browser --version 2>&1 | head -1)"
echo ""
echo "You can now access:"
echo "- Firefox ESR from the desktop"
echo "- Chromium from the desktop"
echo ""
echo "To test browsers:"
echo "  DISPLAY=:1 firefox-esr"
echo "  DISPLAY=:1 chromium-browser"