#!/bin/bash
# Fix browser installation

echo "=== Installing Web Browsers (Fixed) ==="

# Add Mozilla PPA for Firefox
echo "Adding Mozilla PPA for Firefox..."
sudo add-apt-repository -y ppa:mozillateam/ppa

# Configure Firefox PPA priority
echo '
Package: *
Pin: release o=LP-PPA-mozillateam
Pin-Priority: 1001
' | sudo tee /etc/apt/preferences.d/mozilla-firefox

# Install Firefox
echo "Installing Firefox..."
sudo apt-get update
sudo apt-get install -y firefox

# Verify Chromium installation
echo "Verifying Chromium..."
if ! command -v chromium-browser &> /dev/null; then
    # Try alternative package names
    sudo apt-get install -y chromium chromium-browser || true
fi

# Create proper desktop shortcuts
mkdir -p ~/Desktop

# Firefox shortcut
cat > ~/Desktop/firefox.desktop << 'EOF'
[Desktop Entry]
Name=Firefox
Comment=Web Browser
Exec=/usr/bin/firefox %u
Icon=firefox
Type=Application
Categories=Network;WebBrowser;
EOF

chmod +x ~/Desktop/firefox.desktop

# Chromium shortcut
cat > ~/Desktop/chromium.desktop << 'EOF'
[Desktop Entry]
Name=Chromium
Comment=Web Browser
Exec=/usr/bin/chromium-browser --no-sandbox %u
Icon=chromium-browser
Type=Application
Categories=Network;WebBrowser;
EOF

chmod +x ~/Desktop/chromium.desktop

# Test installations
echo ""
echo "=== Browser Status ==="
echo ""
if command -v firefox &> /dev/null; then
    echo "Firefox: $(firefox --version 2>&1)"
else
    echo "Firefox: Not installed"
fi

if command -v chromium-browser &> /dev/null; then
    echo "Chromium: $(chromium-browser --version 2>&1)"
elif command -v chromium &> /dev/null; then
    echo "Chromium: $(chromium --version 2>&1)"
else
    echo "Chromium: Not installed"
fi

echo ""
echo "Browser shortcuts created on desktop."
echo ""
echo "Note: When running browsers in the container, use:"
echo "  DISPLAY=:1 firefox"
echo "  DISPLAY=:1 chromium-browser --no-sandbox"