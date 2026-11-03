# Troubleshooting

Organized by symptom. Diagnose first — never disable security
controls, TLS verification, antivirus, endpoint protection, or
firewalls to make a problem go away. If a corporate policy blocks a
tool, document the error and contact IT (see the escalation list at
the bottom).

## `node` is not found

**Symptom:** `'node' is not recognized` (Windows) or
`command not found: node` (macOS).

1. Open a **new** terminal window — PATH changes do not apply to
   sessions that were already open.
2. Confirm Node.js is actually installed:
   - Windows: Start Menu → search "Node.js", or check
     `C:\Program Files\nodejs`.
   - macOS: check `/usr/local/bin/node` or `/opt/homebrew/bin/node`.
3. If it is not installed, install **Node.js LTS** from
   `https://nodejs.org`.
4. If it is installed but not on PATH:
   - Windows: verify the Node.js directory is listed in the `Path`
     environment variable (see
     [windows-setup.md](windows-setup.md)).
   - macOS: check `echo $PATH` includes the directory containing
     `node`.

## `npm` is not found

npm is installed together with Node.js. If `node` works but `npm`
does not, the Node.js installation may be incomplete — reinstall
Node.js LTS. On Windows, `npm` is `npm.cmd`; if PowerShell cannot find
it but Command Prompt can, reopen PowerShell.

## `git` is not found

1. Open a new terminal window.
2. If still missing:
   - Windows: install from `https://git-scm.com/download/win`
     (default options are fine).
   - macOS: running `git` may prompt you to install the Xcode Command
     Line Tools — accept it. Alternatively install Git from
     `https://git-scm.com/download/mac`.

## Git identity missing

`git config --global user.name` or `user.email` prints nothing.

Configure once (use your real details):

``` bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## `npm install` / download failures

Typical errors: `ETIMEDOUT`, `ECONNRESET`, `EAI_AGAIN`, `407 Proxy
Authentication Required`, certificate/SSL errors.

- Verify basic connectivity: open `https://registry.npmjs.org` in a
  browser.
- If you are on a corporate network: a **proxy**, **VPN**,
  **firewall**, or **SSL/certificate inspection** may be intercepting
  npm traffic.
- Some organizations restrict the npm registry to an internal mirror.
  Ask IT which registry you should use.
- **Never** disable TLS verification (`strict-ssl false`,
  `NODE_TLS_REJECT_UNAUTHORIZED=0`) — it weakens security for all npm
  traffic. If certificates are being intercepted, that is an IT
  policy matter to escalate, not work around.
- If this happens during Lab 0 and cannot be fixed quickly, the
  ready-to-run project in [../starter/README.md](../starter/README.md)
  keeps you moving — note that it also requires npm registry access,
  so a blocked network still needs a different network or IT
  escalation.

## Playwright browser download failures

`npx playwright install` fails or hangs while downloading browsers.

- Playwright downloads browser binaries from CDN endpoints — these
  can be blocked by corporate proxies or endpoint protection even
  when npm works.
- Retry on a different network (for example, home or a hotspot) to
  isolate whether the corporate network is the cause.
- Check available disk space (browsers need several hundred MB).
- If blocked on a corporate device, escalate: the requirement is
  "allow downloads of Playwright browser binaries" (see the IT list
  below).
- During Lab 0, the [../starter/README.md](../starter/README.md)
  recovery project bypasses scaffolding issues but still needs to
  download the same browser binaries — switch networks or escalate if
  the downloads themselves are blocked.

## GitHub inaccessible

- Confirm `https://github.com` loads in a browser.
- If it loads in the browser but `git` operations fail, the network
  path for Git may differ (proxy applies to the browser but not the
  CLI, or vice versa).
- If the site itself is unreachable, try another network. If it only
  fails on the corporate network, escalate to IT.

## Git push authentication failures

**Symptom:** `git push` asks for credentials and fails, or returns
`Authentication failed` / `Permission denied`.

GitHub no longer accepts account passwords over HTTPS for Git
operations. Supported approaches:

- **Browser / credential manager (recommended):** GitHub CLI
  (`gh auth login`) or Git Credential Manager handle sign-in via the
  browser and store credentials in the OS credential store. Many Git
  installers include a credential manager by default.
- **SSH:** generate an SSH key pair and add the public key to your
  GitHub account, then use the SSH remote URL.
- **Personal access token:** possible, but treat tokens like
  passwords — never paste them into course materials, issues, or
  files that get committed.

If authentication works locally but fails only on a corporate
network, the proxy may be blocking the auth endpoints — escalate.

## PowerShell script blocked

**Symptom:** running `verify-environment.ps1` fails with an
execution-policy error.

1. Diagnose first — check the current policy:

   ``` powershell
   Get-ExecutionPolicy -List
   ```

2. You do not need the script to complete Lab 0 — the manual
   verification commands in
   [windows-setup.md](windows-setup.md) cover the same checks.
3. On a **personal** device, if you want to run local scripts you may
   allow them for your user account only:

   ``` powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

   `RemoteSigned` runs unsigned scripts created on your machine while
   still requiring a signature for scripts marked as downloaded from
   the Internet. It applies only to your user account and is
   reversible (`Set-ExecutionPolicy -Scope CurrentUser Undefined`
   restores the inherited default). Understand the setting before
   applying it.
4. On a **managed/corporate** device, do not change execution
   policy — it may be enforced by your organization. Ask IT or your
   instructor instead.

## Corporate laptop escalation

If security policy prevents any course tool from working, send your
IT department a concise request:

> For a software testing course, please verify/allow:
>
> - Install rights for: Node.js LTS, Git, Windsurf, Chrome/Edge
> - HTTPS access to: `github.com`, `registry.npmjs.org`,
>   `playwright.dev`, and the Playwright browser-download hosts
>   (`cdn.playwright.dev`, `playwright.azureedge.net`)
> - npm package installation (`npm install`, `npx`)
> - Git operations: clone, commit, push over HTTPS or SSH
> - Playwright browser binary downloads to the user profile
> - Localhost access for running local test tooling
>
> Current error observed: *(paste the exact error message)*

Include the exact error text and, if relevant, the output of the
environment validation script.
