# Windows Setup — Environment Verification

Beginner-friendly steps to verify your Windows machine is ready for
Lab 0. All commands run in **PowerShell**.

Open PowerShell: press `Win`, type `PowerShell`, press Enter.

## 1. Verify Windsurf

Launch Windsurf from the Start Menu. If it does not launch, reinstall
it or check with IT (corporate devices may block new applications).

## 2. Verify Node.js and npm

``` powershell
node -v
npm -v
```

Expected: each prints a version number, for example `v22.x.x` and
`11.x.x`.

If you see `'node' is not recognized` or `The term 'node' is not
recognized`:

1. Close **all** PowerShell windows and open a new one (PATH changes
   only apply to new windows).
2. If it still fails, check whether Node.js is installed:
   `Win` → search for "Node.js". If it is missing, install the LTS
   version from `https://nodejs.org`.
3. If it is installed but not recognized, see the PATH section below.

## 3. Verify Git

``` powershell
git --version
```

Expected: a version such as `git version 2.4x.x`.

If Git is missing, install it from `https://git-scm.com/download/win`
(default options are fine).

## 4. Verify Git identity

``` powershell
git config --global user.name
git config --global user.email
```

If either prints nothing, configure it (use your own details — the
values below are placeholders):

``` powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## 5. Verify a browser

Confirm Chrome or Edge launches. Playwright can also download its own
browser builds, but a system browser is required for course tooling.

## 6. Verify GitHub access

Open `https://github.com` in your browser and confirm you can sign in.

You can also run the automated validator, which checks all of the
above plus connectivity:

``` powershell
.\scripts\verify-environment.ps1
```

If PowerShell refuses to run the script, see "PowerShell script
restrictions" below — and
[troubleshooting.md](troubleshooting.md).

## Common Windows issues

### PATH not updated after installing

Newly installed tools are not visible to PowerShell windows that were
already open. Close every terminal/IDE window and reopen. If the tool
is still not found, confirm the installation directory exists (for
Node.js, typically `C:\Program Files\nodejs`) and check the `Path`
environment variable: `Win` → "Edit the system environment variables"
→ "Environment Variables" → `Path`.

### PowerShell script restrictions

If `verify-environment.ps1` is blocked by execution policy, do **not**
change system settings silently. First diagnose:

``` powershell
Get-ExecutionPolicy -List
```

If the policy prevents running the script, you can either run the
manual commands in this document instead, or ask your instructor.
Never run commands that weaken machine security without understanding
them. See [troubleshooting.md](troubleshooting.md) for details.

### Proxy / VPN / corporate restrictions

If commands fail with network errors (`ETIMEDOUT`, `ECONNRESET`, 407
proxy errors, certificate errors):

- Check whether you are behind a corporate proxy or VPN.
- Do not disable TLS verification or security tooling.
- Collect the exact error text and escalate using the checklist in
  [troubleshooting.md](troubleshooting.md).

### Permissions

If installers are blocked or require administrator approval you do not
have, contact your IT department with the requirements list in
[troubleshooting.md](troubleshooting.md). Diagnose first — never
modify machine configuration silently.
