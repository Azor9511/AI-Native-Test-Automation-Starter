# Pre-Course Checklist

Complete this checklist **before** the course starts. Every unchecked
item is a potential blocker during Lab 0.

## Hardware

- [ ] Personal or corporate laptop (Windows or macOS)
- [ ] 8 GB RAM minimum
- [ ] 16 GB RAM recommended
- [ ] 20 GB free disk space minimum
- [ ] Stable Internet connection

## Software

- [ ] Windsurf installed and launches correctly
- [ ] Node.js LTS installed
- [ ] npm installed (included with Node.js)
- [ ] Git installed
- [ ] Chrome or Edge installed

Verify the command-line tools:

``` bash
node -v
npm -v
git --version
```

Each command should print a version number without errors. If any
command fails, see [troubleshooting.md](troubleshooting.md) or the
setup guide for your platform
([windows-setup.md](windows-setup.md) /
[macos-setup.md](macos-setup.md)).

## Accounts

- [ ] Windsurf account (required)
- [ ] GitHub account (required)
- [ ] ChatGPT account (optional)
- [ ] Claude account (optional)

Free accounts should be sufficient for the core course objectives,
unless a provider changes its terms. The Starter Kit does not require
paid AI subscriptions. No specific trial period or pricing is
guaranteed.

## Connectivity

Validate that you can open each of these in a browser:

- [ ] GitHub — `https://github.com`
- [ ] npm registry — `https://registry.npmjs.org`
- [ ] SauceDemo — `https://www.saucedemo.com`
- [ ] DummyJSON — `https://dummyjson.com`
- [ ] ReqRes — `https://reqres.in`

The practice applications (SauceDemo, DummyJSON, ReqRes) are used
throughout the course for UI and API exercises.

## Corporate Laptops

If you are using a company-managed device, verify the following with
your IT department:

- [ ] Permission to install software (Node.js, Git, browsers, Windsurf)
- [ ] Proxy configuration does not block npm or GitHub
- [ ] VPN does not break npm downloads or Git operations
- [ ] Firewall allows HTTPS access to `github.com` and
      `registry.npmjs.org`
- [ ] Endpoint protection does not block Node.js, Git, or Playwright
- [ ] npm package downloads are allowed
- [ ] Git operations (clone, commit, push) are allowed
- [ ] GitHub access (HTTPS and/or SSH) is allowed
- [ ] Playwright browser downloads are allowed (browsers are downloaded
      to a user directory)

If any item is blocked, collect the details and send them to your IT
team — see the "Corporate escalation" section of
[troubleshooting.md](troubleshooting.md) for a ready-to-send list.
