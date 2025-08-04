#!/bin/bash
# Update base development tools to latest versions

echo "=== Updating Base Development Tools ==="

# Install Node Version Manager (nvm) to get latest Node.js
echo "Installing NVM and latest Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
nvm alias default node

# Verify Node and npm versions
echo "Node.js version:"
node --version
echo "npm version:"
npm --version

# Update npm to latest
echo "Updating npm to latest..."
npm install -g npm@latest

# Install Python version management with pyenv
echo "Installing pyenv for Python version management..."
curl https://pyenv.run | bash

# Add pyenv to PATH
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# Install Python build dependencies
sudo apt-get update
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev \
libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev python3-openssl git

# Install latest Python 3.12
echo "Installing Python 3.12..."
pyenv install 3.12.0
pyenv global 3.12.0

# Verify Python version
echo "Python version:"
python --version
echo "pip version:"
pip --version

# Install uv - the fast Python package installer
echo "Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Update pip
echo "Updating pip..."
python -m pip install --upgrade pip

# Add all paths to bashrc
cat >> ~/.bashrc << 'EOF'

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# uv
export PATH="$HOME/.cargo/bin:$PATH"

EOF

# Source bashrc
source ~/.bashrc

echo "=== Base Tools Updated ==="
echo ""
echo "Installed versions:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Python: $(python --version)"
echo "pip: $(pip --version)"
echo "uv: $(uv --version)"
echo ""
echo "Run 'source ~/.bashrc' to ensure all paths are loaded"