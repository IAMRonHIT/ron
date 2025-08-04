#!/bin/bash
# Setup script for development environment in Claude computer use container

echo "=== Setting up Development Environment for Claude Computer Use ==="

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install VS Code
echo "Installing Visual Studio Code..."
if ! command -v code &> /dev/null; then
    # Download and install VS Code
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
    sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
    sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
    sudo apt-get update
    sudo apt-get install -y code
else
    echo "VS Code already installed"
fi

# Install global npm packages
echo "Installing global npm packages..."
sudo npm install -g @anthropic-ai/claude-code
sudo npm install -g typescript
sudo npm install -g nodemon
sudo npm install -g pm2
sudo npm install -g concurrently
sudo npm install -g create-react-app
sudo npm install -g @angular/cli
sudo npm install -g vue@latest
sudo npm install -g next
sudo npm install -g vercel
sudo npm install -g yarn
sudo npm install -g pnpm

# Install Python development tools
echo "Installing Python development tools..."
sudo apt-get install -y python3-pip python3-venv python3-dev
pip3 install --user pipenv
pip3 install --user poetry
pip3 install --user black
pip3 install --user pylint
pip3 install --user pytest
pip3 install --user jupyter
pip3 install --user pandas numpy matplotlib seaborn
pip3 install --user anthropic openai
pip3 install --user fastapi uvicorn
pip3 install --user django flask

# Install additional development tools
echo "Installing additional development tools..."
sudo apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    vim \
    nano \
    htop \
    tree \
    jq \
    postgresql-client \
    mysql-client \
    redis-tools \
    docker.io \
    docker-compose

# Install MongoDB tools
echo "Installing MongoDB tools..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-mongosh

# Set up Git configuration
echo "Setting up Git..."
git config --global user.name "Claude Computer Use"
git config --global user.email "claude@anthropic.com"

# Create development directories
echo "Creating development directories..."
mkdir -p ~/projects
mkdir -p ~/claude-tools
mkdir -p ~/.config

# Install browser extensions for development
echo "Setting up browser for development..."
# Create Firefox profile with development extensions
firefox -CreateProfile "claude-dev"

# Set environment variables
echo "Setting up environment variables..."
cat >> ~/.bashrc << 'EOF'

# Development environment variables
export NODE_ENV=development
export PATH=$PATH:~/.local/bin
export EDITOR=code

# Aliases for development
alias ll='ls -la'
alias dev='cd ~/projects'
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias npm-check='npm list -g --depth=0'

# Function to create new project
new-project() {
    mkdir -p ~/projects/$1
    cd ~/projects/$1
    git init
    npm init -y
    echo "# $1" > README.md
    echo "node_modules/" > .gitignore
    echo "Project $1 created in ~/projects/$1"
}

EOF

# Install Chrome extensions via command line (for development)
echo "Configuring browsers for development..."
mkdir -p ~/.config/chromium/Default/Extensions

# Create desktop shortcuts
echo "Creating desktop shortcuts..."
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

# Create shortcuts for browsers
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

# Create a terminal shortcut
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

echo "=== Development Environment Setup Complete! ==="
echo ""
echo "Installed tools:"
echo "- VS Code"
echo "- Claude Code CLI (@anthropic-ai/claude-code)"
echo "- Node.js with npm, yarn, pnpm"
echo "- Python 3 with pip, pipenv, poetry"
echo "- Git, Docker, Docker Compose"
echo "- MongoDB tools (mongosh)"
echo "- Web browsers: Firefox, Chromium"
echo ""
echo "Global npm packages:"
echo "- TypeScript, Nodemon, PM2, Concurrently"
echo "- Create React App, Angular CLI, Vue CLI, Next.js"
echo "- Vercel CLI"
echo ""
echo "Python packages:"
echo "- Black, Pylint, Pytest, Jupyter"
echo "- Pandas, NumPy, Matplotlib, Seaborn"
echo "- Anthropic, OpenAI SDKs"
echo "- FastAPI, Django, Flask"
echo ""
echo "Desktop shortcuts created for:"
echo "- VS Code"
echo "- Firefox"
echo "- Chromium"
echo "- Terminal"
echo ""
echo "Run 'source ~/.bashrc' to load new environment variables and aliases"