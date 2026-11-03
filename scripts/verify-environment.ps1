<#
.SYNOPSIS
    verify-environment.ps1 — Environment validation for Lab 0
    AI-Native Test Automation Engineering — Starter Kit v1

.DESCRIPTION
    READ-ONLY validator. It does not install software, modify Git
    config, change PATH or execution policy, request credentials, or
    alter any security settings. It only checks and reports.

.EXAMPLE
    .\scripts\verify-environment.ps1

.OUTPUTS
    Process exit code 0 = READY, 1 = ACTION REQUIRED (usable by
    CI/automation). The exit code is set via [Environment]::ExitCode so
    an interactive PowerShell session is not closed by the script.
#>

$script:PassCount = 0
$script:WarnCount = 0
$script:FailCount = 0
$TimeoutSeconds   = 10

function Write-Pass { param([string]$Msg) Write-Host "[PASS] $Msg"; $script:PassCount++ }
function Write-Warn { param([string]$Msg) Write-Host "[WARN] $Msg"; $script:WarnCount++ }
function Write-Fail { param([string]$Msg) Write-Host "[FAIL] $Msg"; $script:FailCount++ }

function Get-CommandPath([string]$Name) {
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($null -ne $cmd) { return $cmd.Source }
    return $null
}

function Test-Url([string]$Url, [string]$Name, [bool]$Required) {
    # HEAD first, then GET — some endpoints reject HEAD requests.
    # Hard timeout on every attempt; read-only, no downloads kept.
    $reachable = $false
    foreach ($method in @('Head', 'Get')) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method $method `
                -TimeoutSec $TimeoutSeconds -UseBasicParsing `
                -ErrorAction Stop
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
                $reachable = $true
                break
            }
        } catch {
            # Try the next HTTP method before declaring the host unreachable.
        }
    }
    if ($reachable) {
        Write-Pass "$Name reachable"
    } elseif ($Required) {
        Write-Fail "$Name NOT reachable — check Internet, proxy, VPN, or firewall. See docs/troubleshooting.md"
    } else {
        Write-Warn "$Name NOT reachable — needed later in the course. See docs/troubleshooting.md"
    }
}

Write-Host "========================================"
Write-Host "ENVIRONMENT VALIDATION — Lab 0"
Write-Host "========================================"
Write-Host "Timestamp : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "OS        : $($PSVersionTable.OS)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "========================================"
Write-Host ""

# --- Node.js -------------------------------------------------------------
if (Get-CommandPath "node") {
    $nodeVersion = (& node -v 2>$null)
    Write-Pass "Node.js detected: $nodeVersion"
    if ($nodeVersion -match '^v(\d+)' -and [int]$Matches[1] -lt 18) {
        Write-Warn "Node.js $nodeVersion is older than the recommended LTS (v18 or newer)"
    }
} else {
    Write-Fail "Node.js not found — install Node.js LTS. See docs/windows-setup.md"
}

# --- npm -----------------------------------------------------------------
if ((Get-CommandPath "npm") -or (Get-CommandPath "npm.cmd")) {
    $npmVersion = (& npm -v 2>$null)
    Write-Pass "npm detected: $npmVersion"
} else {
    Write-Fail "npm not found — it is included with Node.js. See docs/troubleshooting.md"
}

# --- Git -----------------------------------------------------------------
$gitFound = [bool](Get-CommandPath "git")
if ($gitFound) {
    $gitVersion = (& git --version 2>$null)
    Write-Pass "Git detected: $gitVersion"
} else {
    Write-Fail "Git not found — install Git. See docs/troubleshooting.md"
}

# --- Git identity ----------------------------------------------------------
if ($gitFound) {
    $gitName  = (& git config --global user.name 2>$null)
    $gitEmail = (& git config --global user.email 2>$null)
    if ($gitName) {
        Write-Pass "Git user.name configured"
    } else {
        Write-Warn "Git user.name not configured — run: git config --global user.name `"Your Name`""
    }
    if ($gitEmail) {
        Write-Pass "Git user.email configured"
    } else {
        Write-Warn "Git user.email not configured — run: git config --global user.email `"you@example.com`""
    }
}

# --- Connectivity ----------------------------------------------------------
Write-Host ""
Test-Url "https://github.com"         "GitHub"                   $true
Test-Url "https://registry.npmjs.org" "npm registry"             $true
Test-Url "https://www.saucedemo.com"  "SauceDemo (practice app)" $false
Test-Url "https://dummyjson.com"      "DummyJSON (practice app)" $false
Test-Url "https://reqres.in"          "ReqRes (practice app)"    $false

# --- Summary ---------------------------------------------------------------
Write-Host ""
Write-Host "========================================"
Write-Host "ENVIRONMENT VALIDATION"
Write-Host "========================================"
Write-Host "Passed:   $script:PassCount"
Write-Host "Warnings: $script:WarnCount"
Write-Host "Failed:   $script:FailCount"
Write-Host ""
$exitCode = 0
if ($script:FailCount -eq 0) {
    Write-Host "STATUS: READY"
} else {
    Write-Host "STATUS: ACTION REQUIRED"
    Write-Host "See docs/troubleshooting.md for resolution steps."
    $exitCode = 1
}

# Exit code handling: `exit` inside a script would close an
# interactive PowerShell window, so it is only used in CI /
# non-interactive contexts. In interactive sessions the process exit
# code is set for when the host eventually closes, and the summary
# above is what the student reads. Without this, pwsh would propagate
# the exit code of the last external command (e.g. `git config`
# returning 1 for an unset value) instead of the validation result.
if ($env:CI -eq 'true' -or -not [Environment]::UserInteractive) {
    exit $exitCode
}
[Environment]::ExitCode = $exitCode
