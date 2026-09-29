# PowerShell 1-Click Installer for ManakAI MCP Server on Claude Desktop
# Automatically updates %APPDATA%\Claude\claude_desktop_config.json without overwriting existing servers

$ErrorActionPreference = "Stop"

$ClaudeDir = [System.IO.Path]::Combine($env:APPDATA, "Claude")
$ConfigFile = [System.IO.Path]::Combine($ClaudeDir, "claude_desktop_config.json")

$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$PythonExe = Join-Path $WorkspaceRoot ".venv\Scripts\python.exe"
$BridgeScript = Join-Path $WorkspaceRoot "application\mcp_server\claude_desktop_bridge.py"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "ManakAI Model Context Protocol (MCP) — Claude Desktop Installer" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

if (-not (Test-Path $PythonExe)) {
    Write-Host "[WARNING] Virtualenv Python not found at: $PythonExe" -ForegroundColor Yellow
    Write-Host "Using default system 'python' command instead." -ForegroundColor Yellow
    $PythonExe = "python"
}

if (-not (Test-Path $ClaudeDir)) {
    Write-Host "Creating Claude configuration directory: $ClaudeDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
}

$ConfigData = @{ "mcpServers" = @{} }

if (Test-Path $ConfigFile) {
    Write-Host "Found existing Claude configuration at: $ConfigFile" -ForegroundColor Green
    try {
        $RawContent = Get-Content -Path $ConfigFile -Raw -Encoding UTF8
        if ($RawContent.Trim()) {
            $ExistingJson = $RawContent | ConvertFrom-Json
            if ($ExistingJson.mcpServers) {
                # Preserve existing servers
                foreach ($prop in $ExistingJson.mcpServers.PSObject.Properties) {
                    $ConfigData["mcpServers"][$prop.Name] = $prop.Value
                }
            }
        }
    } catch {
        Write-Host "[WARNING] Could not parse existing config JSON ($_.Exception.Message). Backing it up to claude_desktop_config.json.bak" -ForegroundColor Yellow
        Copy-Item -Path $ConfigFile -Destination "$ConfigFile.bak" -Force
    }
}

# Add or update ManakAI standards server
$ConfigData["mcpServers"]["manakai-standards"] = @{
    "command" = $PythonExe
    "args" = @($BridgeScript)
    "env" = @{
        "MANAKAI_BASE_URL" = "http://127.0.0.1:8000"
    }
}

$FinalJson = $ConfigData | ConvertTo-Json -Depth 10
Set-Content -Path $ConfigFile -Value $FinalJson -Encoding UTF8

Write-Host ""
Write-Host "[SUCCESS] ManakAI MCP Server successfully configured in Claude Desktop!" -ForegroundColor Green
Write-Host "Configuration written to: $ConfigFile" -ForegroundColor White
Write-Host ""
Write-Host "Registered Tools:" -ForegroundColor Cyan
Write-Host "  1. manakai_search_standards" -ForegroundColor White
Write-Host "  2. manakai_get_standard_details" -ForegroundColor White
Write-Host "  3. manakai_check_supersession_history" -ForegroundColor White
Write-Host "  4. manakai_get_normative_relations" -ForegroundColor White
Write-Host "  5. manakai_check_qco_compliance" -ForegroundColor White
Write-Host "  6. manakai_generate_nit_clause" -ForegroundColor White
Write-Host ""
Write-Host "To use with Render Cloud:" -ForegroundColor Yellow
Write-Host "Simply change 'MANAKAI_BASE_URL' in $ConfigFile" -ForegroundColor White
Write-Host "from 'http://127.0.0.1:8000' to 'https://your-app.onrender.com'" -ForegroundColor White
Write-Host ""
Write-Host "Restart Claude Desktop now to start using the tools!" -ForegroundColor Cyan
