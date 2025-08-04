#!/bin/bash
# Install VS Code and development tools

echo "=== Installing VS Code and Development Tools ==="

# Source the updated environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

export PATH="$HOME/.local/bin:$PATH"

# Install VS Code
echo "Installing Visual Studio Code..."
if ! command -v code &> /dev/null; then
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
    sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
    sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
    sudo apt-get update
    sudo apt-get install -y code
else
    echo "VS Code already installed"
fi

# Install global npm packages with updated Node.js
echo "Installing global npm packages..."
npm install -g @anthropic-ai/claude-code
npm install -g typescript
npm install -g nodemon
npm install -g pm2
npm install -g concurrently
npm install -g create-react-app
npm install -g @angular/cli
npm install -g vue@latest
npm install -g next
npm install -g vercel
npm install -g yarn
npm install -g pnpm

# Install Python packages with uv
echo "Installing Python packages with uv..."
uv pip install --system anthropic
uv pip install --system openai
uv pip install --system fastapi
uv pip install --system uvicorn
uv pip install --system django
uv pip install --system flask
uv pip install --system pandas
uv pip install --system numpy
uv pip install --system matplotlib
uv pip install --system seaborn
uv pip install --system jupyter
uv pip install --system black
uv pip install --system pylint
uv pip install --system pytest
uv pip install --system python-dotenv
uv pip install --system pymongo
uv pip install --system redis
uv pip install --system celery

# Create desktop shortcuts
echo "Creating desktop shortcuts..."
mkdir -p ~/Desktop

cat > ~/Desktop/vscode.desktop << 'EOF'
[Desktop Entry]
Name=Visual Studio Code
Comment=Code Editing. Redefined.
GenericName=Text Editor
Exec=/usr/bin/code --no-sandbox --unity-launch %F
Icon=code
Type=Application
StartupNotify=false
StartupWMClass=Code
Categories=Utility;TextEditor;Development;IDE;
MimeType=text/plain;
Actions=new-empty-window;
Keywords=vscode;

[Desktop Action new-empty-window]
Name=New Empty Window
Exec=/usr/bin/code --no-sandbox --new-window %F
Icon=code
EOF

chmod +x ~/Desktop/vscode.desktop

# Terminal shortcut
cat > ~/Desktop/terminal.desktop << 'EOF'
[Desktop Entry]
Name=Terminal
Comment=Terminal Emulator
Exec=xfce4-terminal
Icon=utilities-terminal
Type=Application
Categories=System;TerminalEmulator;
EOF

chmod +x ~/Desktop/terminal.desktop

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
Exec=/usr/bin/chromium-browser %u
Icon=chromium-browser
Type=Application
Categories=Network;WebBrowser;
EOF

chmod +x ~/Desktop/chromium.desktop

# Create projects directory
mkdir -p ~/projects

# Test installations
echo ""
echo "=== Installation Complete ==="
echo ""
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Python: $(python --version)"
echo "pip: $(pip --version)"
echo "uv: $(uv --version)"
echo ""
echo "VS Code: $(code --version | head -1)"
echo ""
echo "Desktop shortcuts created for:"
echo "- VS Code"
echo "- Terminal"
echo "- Firefox"
echo "- Chromium"
echo ""
echo "Global tools installed. Run 'npm list -g --depth=0' to see npm packages."