# ICT AI Knowledge System

> **Advanced Trading Intelligence Platform** - Transform your trading with institutional-grade AI analysis and proven ICT methodologies.

[![Deploy to GitHub Pages](https://github.com/sixscripts-ai/brain-ai/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/sixscripts-ai/brain-ai/actions)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-sixscripts--ai.com-blue)](https://sixscripts-ai.com)

## 🚀 Live Website

**Production**: [https://sixscripts-ai.com](https://sixscripts-ai.com)  
**GitHub Pages**: [https://sixscripts-ai.github.io/brain-ai](https://sixscripts-ai.github.io/brain-ai)

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [Custom Domain Setup](#-custom-domain-setup)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 **Smart Market Analysis**
- Advanced pattern recognition algorithms
- Multi-timeframe analysis
- Institutional-grade precision
- Real-time market data processing

### ⚡ **Real-Time Signal Generation**
- Instant entry/exit notifications
- ICT concepts integration (Order Blocks, FVG, Liquidity Zones)
- High-probability trade identification
- Smart risk management

### 📈 **Risk Management Suite**
- Automated position sizing
- Stop-loss optimization
- Portfolio management tools
- Capital protection algorithms

### 🔄 **Backtesting Engine**
- High-fidelity historical testing
- Strategy validation
- Performance analytics
- Risk assessment tools

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ict-ai-knowledge-system.git
   cd ict-ai-knowledge-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run serve
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🌐 Deployment

### Automated Deployment (Recommended)

The project includes automated GitHub Actions deployment:

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Deploy updates"
   git push origin main
   ```

2. **GitHub Actions will automatically**:
   - Build the project
   - Deploy to GitHub Pages
   - Update your live website

### Manual Deployment

Use the included deployment script:

```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Deploy to GitHub Pages
./deploy.sh
```

Or use npm script:
```bash
npm run deploy
```

## 🌍 Custom Domain Setup

### Step 1: Configure DNS Records

Add these DNS records to your domain registrar:

**A Records** (for apex domain):
```
Type: A, Name: @, Value: 185.199.108.153
Type: A, Name: @, Value: 185.199.109.153
Type: A, Name: @, Value: 185.199.110.153
Type: A, Name: @, Value: 185.199.111.153
```

**CNAME Record** (for www subdomain):
```
Type: CNAME, Name: www, Value: YOUR_USERNAME.github.io
```

### Step 2: Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Set source to "Deploy from a branch"
3. Select "main" branch
4. Enter custom domain: `sixscripts-ai.com`
5. Enable "Enforce HTTPS"

### Step 3: Verify Setup

- DNS propagation: Use [DNS Checker](https://dnschecker.org/)
- SSL certificate: Check for green lock in browser
- Website access: Test both `sixscripts-ai.com` and `www.sixscripts-ai.com`

📖 **Detailed DNS Setup Guide**: See [DNS_SETUP.md](./DNS_SETUP.md)

## 💻 Development

### Project Scripts

```bash
# Development
npm run dev          # Start TypeScript development server
npm run serve        # Serve static files locally

# Building
npm run build        # Build TypeScript and copy assets
npm run copy-assets  # Copy public assets to dist

# Deployment
npm run deploy       # Run deployment script
./deploy.sh         # Direct script execution

# Code Quality
npm run lint         # Run ESLint
npm run test         # Run Jest tests

# AI/Knowledge System
npm run generate-embeddings    # Generate AI embeddings
npm run export-training-data   # Export training data
npm run validate-knowledge     # Validate knowledge base
```

### Local Development Server

```bash
# Option 1: Python (recommended)
cd public && python3 -m http.server 8000

# Option 2: Node.js (if you have http-server)
npx http-server public -p 8000

# Option 3: Use npm script
npm run serve
```

## 📁 Project Structure

```
ict-ai-knowledge-system/
├── 📁 public/                 # Static website files
│   ├── 📄 advanced-ui.html    # Main website page
│   ├── 📁 css/
│   │   └── 📄 advanced-styles.css
│   └── 📁 js/
│       └── 📄 advanced-animations.js
├── 📁 src/                    # TypeScript source code
│   ├── 📁 api/               # API endpoints
│   ├── 📁 services/          # Core services
│   ├── 📁 types/             # Type definitions
│   └── 📄 index.ts           # Main entry point
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 deploy.yml     # GitHub Actions workflow
├── 📁 supabase/              # Database migrations
├── 📄 CNAME                  # Custom domain configuration
├── 📄 deploy.sh              # Deployment script
├── 📄 DNS_SETUP.md           # DNS configuration guide
├── 📄 package.json           # Dependencies and scripts
└── 📄 README.md              # This file
```

## 🔧 Configuration Files

### GitHub Pages Configuration
- `CNAME` - Custom domain configuration
- `.github/workflows/deploy.yml` - Automated deployment
- `index.html` - Root redirect to main page

### Development Configuration
- `package.json` - Dependencies and build scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore rules

## 🚨 Troubleshooting

### Common Issues

**Website not loading**
- Check DNS propagation with [DNS Checker](https://dnschecker.org/)
- Verify GitHub Pages is enabled in repository settings
- Ensure CNAME file contains correct domain

**SSL Certificate issues**
- Wait 24 hours for automatic provisioning
- Check domain verification in GitHub Pages settings
- Verify DNS records are correct

**Build failures**
- Check GitHub Actions logs in repository
- Verify all dependencies are installed
- Ensure TypeScript compiles without errors

**Custom domain not working**
- Verify DNS records match GitHub's requirements
- Check domain registrar configuration
- Test with `dig` command: `dig sixscripts-ai.com A`

### Getting Help

1. Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
2. Review [DNS_SETUP.md](./DNS_SETUP.md) for domain configuration
3. Check GitHub Actions logs for deployment issues
4. Contact domain registrar for DNS support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **ICT Trading Concepts** - Inner Circle Trader methodologies
- **GitHub Pages** - Free hosting platform
- **Modern Web Technologies** - HTML5, CSS3, JavaScript ES6+

---

## 📞 Support & Contact

- **Website**: [https://sixscripts-ai.com](https://sixscripts-ai.com)
- **Documentation**: [GitHub Repository](https://github.com/YOUR_USERNAME/ict-ai-knowledge-system)
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/ict-ai-knowledge-system/issues)

---

**Made with ❤️ for the trading community**