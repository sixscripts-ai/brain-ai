#!/bin/bash

# ICT AI Knowledge System - GitHub Pages Deployment Script
# This script prepares and deploys the website to GitHub Pages

set -e  # Exit on any error

echo "🚀 Starting ICT AI Knowledge System deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_warning "Git repository not initialized. Initializing..."
    git init
    git branch -M main
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Build the project
print_status "Building project..."
if npm run build > /dev/null 2>&1; then
    print_success "Build completed successfully"
else
    print_warning "Build script not found, skipping build step"
fi

# Ensure public directory exists and has content
if [ ! -d "public" ]; then
    print_error "Public directory not found!"
    exit 1
fi

# Check for required files
required_files=("public/advanced-ui.html" "public/css/advanced-styles.css" "public/js/advanced-animations.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found!"
        exit 1
    fi
done

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    print_status "Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/
EOF
fi

# Add all files to git
print_status "Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    # Commit changes
    print_status "Committing changes..."
    git commit -m "Deploy ICT AI Knowledge System to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote origin found. Please add your GitHub repository:"
    echo "git remote add origin https://github.com/sixscripts-ai/brain-ai.git"
    echo "Then run: git push -u origin main"
else
    # Push to GitHub
    print_status "Pushing to GitHub..."
    git push origin main
    print_success "Deployment completed!"
    echo ""
    echo "🌐 Your website will be available at:"
    echo "   • GitHub Pages: https://sixscripts-ai.github.io/brain-ai"
    echo "   • Custom Domain: https://sixscripts-ai.com (after DNS setup)"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Go to your GitHub repository settings"
    echo "   2. Navigate to Pages section"
    echo "   3. Enable GitHub Pages from 'main' branch"
    echo "   4. Configure your custom domain (sixscripts-ai.com)"
    echo "   5. Set up DNS records as described in DNS_SETUP.md"
fi

print_success "Deployment script completed!"