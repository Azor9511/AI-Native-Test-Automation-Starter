# macOS Setup — Environment Verification

Steps to verify your Mac is ready for Lab 0. All commands run in
**Terminal** (or the Windsurf integrated terminal).

Open Terminal: `Cmd + Space` → type `Terminal` → Enter.

## 1. Verify Windsurf

Launch Windsurf from Applications. If it does not launch, reinstall it
or check with IT (managed devices may block new applications).

## 2. Verify Node.js and npm

``` bash
node -v
npm -v
```

Expected: each prints a version number, for example `v22.x.x` and
`11.x.x`.

If you see `command not found: node`:

1. Open a **new** Terminal window first (PATH changes only apply to
   new sessions).
2. If it still fails, install Node.js LTS from `https://nodejs.org`
   (the macOS `.pkg` installer is the simplest option).
3. Homebrew (`brew install node`) is an optional alternative — only
   use it if you already have Homebrew installed. This guide does not
   install Homebrew for you.

## 3. Verify Git

``` bash
git --version
```

Expected: a version such as `git version 2.x.x`. On macOS, running
`git` for the first time may prompt you to install the Xcode Command
Line Tools — accepting that prompt is normal and installs Git.

## 4. Verify Git identity

``` bash
git config --global user.name
git config --global user.email
```

If either prints nothing, configure it (use your own details — the
values below are placeholders):

``` bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## 5. Verify a browser

Confirm Chrome or Edge launches. Playwright can also download its own
browser builds.

## 6. Verify GitHub access

Open `https://github.com` in your browser and confirm you can sign in.

You can also run the automated validator, which checks all of the
above plus connectivity:

``` bash
./scripts/verify-environment.sh
```

If macOS says the file is not executable, run `chmod +x
scripts/verify-environment.sh` once, or invoke it with
`bash scripts/verify-environment.sh`.

## Common macOS issues

### `command not found`

The tool is not installed or its directory is not on your `PATH`.
Install the tool first, then open a new Terminal window. Check your
PATH with `echo $PATH`.

### Permission errors

- Do not prefix course commands with `sudo` — npm and Playwright are
  designed to work without it. `sudo` installs usually indicate a
  wrong installation approach and create permission problems later.
- If macOS shows a security dialog when opening an app ("cannot be
  opened because the developer cannot be verified" or similar), open
  System Settings → Privacy & Security and review the blocked app —
  do not disable Gatekeeper.

### Endpoint security / managed devices

Company security tooling may inspect or block downloads. Symptoms:
`npm install` hangs or fails with certificate errors, browser
downloads are quarantined. Do not disable security tooling — collect
the error and escalate (see
[troubleshooting.md](troubleshooting.md)).

### Proxy / VPN

If you are behind a corporate proxy or VPN and npm/Git fail with
timeouts or certificate errors, see the network section of
[troubleshooting.md](troubleshooting.md). Never disable TLS
verification to work around certificate errors.
