# DNS Configuration for frontjs.dev

Your website is deployed and ready! Now configure DNS at your domain registrar.

## Quick Setup

At your domain registrar (where you purchased frontjs.dev), add these DNS records:

### For Apex Domain (frontjs.dev)

Add **4 A records** pointing to GitHub Pages IPs:

```
Type: A
Name: @ (or leave blank for root domain)
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

### For WWW Subdomain (www.frontjs.dev)

Add a **CNAME record**:

```
Type: CNAME
Name: www
Value: watthem.github.io
```

## Verification

After DNS propagates (usually 5-60 minutes):

1. Visit https://frontjs.dev - should load your site
2. Visit https://www.frontjs.dev - should redirect to frontjs.dev
3. Check HTTPS is working (🔒 in browser)

## Troubleshooting

### DNS Not Propagating?

Check propagation status:
```bash
nslookup frontjs.dev
dig frontjs.dev
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

### HTTPS Certificate Pending?

GitHub Pages automatically provisions SSL certificates. This can take:
- **5-10 minutes** after DNS is configured
- Up to **24 hours** in rare cases

You can check certificate status:
```bash
gh api repos/watthem/front-js/pages
```

Look for `https_certificate.state` - should be `approved`.

### Site Not Loading?

1. Verify DNS records are correct
2. Check GitHub Pages status: https://www.githubstatus.com
3. Verify CNAME file exists in website directory
4. Check workflow ran successfully: `gh run list`

## Current Status

✅ Repository: Public
✅ GitHub Pages: Enabled
✅ Custom Domain: frontjs.dev configured
✅ CNAME File: Added to website/
✅ Deployment: Automated via GitHub Actions
⏳ DNS: Waiting for configuration at registrar
⏳ HTTPS: Will auto-enable after DNS propagates

## Next Steps

1. Configure DNS records at your registrar (see above)
2. Wait for DNS propagation (5-60 minutes)
3. Verify site loads at https://frontjs.dev
4. Test all pages (main, examples, KB)

## Useful Commands

Check deployment status:
```bash
gh run list --limit 5
```

View latest deployment logs:
```bash
gh run view --log
```

Check Pages configuration:
```bash
gh api repos/watthem/front-js/pages
```

Manually trigger deployment:
```bash
gh workflow run deploy-pages.yml
```
