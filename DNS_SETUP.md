# DNS Setup Guide for sixscripts-ai.com

This guide will help you configure your custom domain `sixscripts-ai.com` to work with GitHub Pages.

## 📋 Prerequisites

- Access to your domain registrar's DNS management panel
- GitHub repository with Pages enabled
- CNAME file already created in your repository

## 🌐 DNS Configuration Steps

### Step 1: Access Your Domain Registrar

Log into your domain registrar where you purchased `sixscripts-ai.com` (e.g., GoDaddy, Namecheap, Cloudflare, etc.).

### Step 2: Navigate to DNS Management

Look for one of these sections in your control panel:
- DNS Management
- DNS Settings
- Name Servers
- DNS Records

### Step 3: Configure DNS Records

You need to create the following DNS records:

#### Option A: CNAME Record (For www subdomain only)
```
Type: CNAME
Name: www
Value: sixscripts-ai.github.io
TTL: 3600 (or Auto)
```

**Important Note:** 
- The CNAME record should only be used for the www subdomain
- For the apex domain (sixscripts-ai.com), you MUST use A records (Option B)
- GitHub Pages will automatically serve your site from the repository path

#### Option B: A Records (For apex domain)
```
Type: A
Name: @ (or leave blank)
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Value: 185.199.111.153
TTL: 3600
```

#### AAAA Records (IPv6 - Optional but recommended)
```
Type: AAAA
Name: @ (or leave blank)
Value: 2606:50c0:8000::153
TTL: 3600

Type: AAAA
Name: @ (or leave blank)
Value: 2606:50c0:8001::153
TTL: 3600

Type: AAAA
Name: @ (or leave blank)
Value: 2606:50c0:8002::153
TTL: 3600

Type: AAAA
Name: @ (or leave blank)
Value: 2606:50c0:8003::153
TTL: 3600
```

### Step 4: Configure GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under "Custom domain", enter: `sixscripts-ai.com`
4. Check "Enforce HTTPS" (recommended)
5. Click **Save**

## 🔧 Domain Registrar Specific Instructions

### GoDaddy
1. Login to GoDaddy account
2. Go to "My Products" → "DNS"
3. Click "Manage" next to your domain
4. Add the DNS records as specified above

### Namecheap
1. Login to Namecheap account
2. Go to "Domain List" → "Manage"
3. Click "Advanced DNS"
4. Add the DNS records as specified above

### Cloudflare
1. Login to Cloudflare dashboard
2. Select your domain
3. Go to "DNS" → "Records"
4. Add the DNS records as specified above
5. Ensure proxy status is "DNS only" (gray cloud)

## ⏱️ Propagation Time

DNS changes can take anywhere from a few minutes to 48 hours to propagate worldwide. Typically:
- **A Records**: 1-4 hours
- **CNAME Records**: 15 minutes - 2 hours

## 🧪 Testing Your Setup

### Check DNS Propagation
Use these tools to verify your DNS records:
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)

### Verify SSL Certificate
Once DNS propagates, GitHub will automatically provision an SSL certificate. This may take up to 24 hours.

### Test Your Website
Try accessing your site at:
- `https://sixscripts-ai.com`
- `https://www.sixscripts-ai.com`

## 🚨 Troubleshooting

### Common Issues

#### "Domain's DNS record could not be retrieved"
- **Cause**: DNS records not properly configured
- **Solution**: Double-check your A records match GitHub's IP addresses exactly

#### "Domain does not resolve to the GitHub Pages server"
- **Cause**: Incorrect CNAME or A record values
- **Solution**: 
  - For apex domain: Use A records pointing to GitHub's IPs
  - For www subdomain: Use CNAME pointing to `sixscripts-ai.github.io` (NOT the full repository path)

#### "Certificate provisioning failed"
- **Cause**: DNS not fully propagated or CAA records blocking
- **Solution**: Wait 24 hours, then try removing and re-adding the custom domain

#### "Page not found" or 404 errors
- **Cause**: CNAME file missing or incorrect
- **Solution**: Ensure CNAME file contains only `sixscripts-ai.com`

#### "GitHub cannot verify your domain"
- **Cause**: Incorrect DNS configuration or propagation issues
- **Solution**: 
  1. Remove any CNAME records for the apex domain (@)
  2. Ensure A records point to all 4 GitHub IP addresses
  3. Wait for DNS propagation (up to 24 hours)
  4. Try removing and re-adding the custom domain in GitHub Pages settings

### Advanced Troubleshooting

#### Check DNS Resolution
```bash
# Check A records
dig sixscripts-ai.com A

# Check CNAME records
dig www.sixscripts-ai.com CNAME

# Check from specific DNS server
dig @8.8.8.8 sixscripts-ai.com A
```

#### Verify GitHub Pages Status
```bash
# Check if GitHub can reach your domain
curl -I https://sixscripts-ai.com
```

## 📞 Support Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Custom Domain Guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- Your domain registrar's support documentation

## ✅ Final Checklist

- [ ] DNS records configured correctly
- [ ] CNAME file exists in repository root
- [ ] GitHub Pages enabled with custom domain
- [ ] HTTPS enforcement enabled
- [ ] DNS propagation completed (test with online tools)
- [ ] Website accessible at sixscripts-ai.com
- [ ] SSL certificate active (green lock in browser)

---

**Need Help?** If you encounter issues, check the GitHub Pages documentation or contact your domain registrar's support team.