# Install external Agent Skills for vue-doctor development
# Run from vue-doctor repo root: ./scripts/install-external-skills.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SkillsDir = Join-Path $ProjectRoot ".cursor\skills"

Write-Host "Installing external skills to $SkillsDir ..." -ForegroundColor Cyan

# Ensure skills directory exists
New-Item -ItemType Directory -Force -Path $SkillsDir | Out-Null

$skills = @(
    @{ Repo = "antfu/skills"; Skill = "vue" },
    @{ Repo = "antfu/skills"; Skill = "vue-best-practices" },
    @{ Repo = "antfu/skills"; Skill = "pinia" },
    @{ Repo = "antfu/skills"; Skill = "vite" }
)

foreach ($item in $skills) {
    Write-Host "  -> $($item.Skill) from $($item.Repo)" -ForegroundColor Yellow
    try {
        npx --yes skills add $item.Repo --skill=$($item.Skill) --agent cursor 2>&1 | Out-Null
        Write-Host "     OK" -ForegroundColor Green
    }
    catch {
        Write-Host "     FAILED: $_" -ForegroundColor Red
        Write-Host "     Manual: npx skills add $($item.Repo) --skill=$($item.Skill) --agent cursor"
    }
}

# Symlink project skills to .cursor/skills for Cursor discovery
$AgentsSkills = Join-Path $ProjectRoot ".agents\skills"
$ProjectSkills = @(
    "vue-doctor-dev",
    "vue-sfc-ast-analysis",
    "vue-doctor-rule-writing",
    "product-thinking",
    "vue-doctor-ship"
)

Write-Host "`nLinking project skills..." -ForegroundColor Cyan
foreach ($skill in $ProjectSkills) {
    $source = Join-Path $AgentsSkills $skill
    $target = Join-Path $SkillsDir $skill
    if (Test-Path $source) {
        if (Test-Path $target) { Remove-Item $target -Recurse -Force -ErrorAction SilentlyContinue }
        cmd /c mklink /J "$target" "$source" 2>$null
        if (-not (Test-Path $target)) {
            Copy-Item -Path $source -Destination $target -Recurse -Force
        }
        Write-Host "  -> $skill linked" -ForegroundColor Green
    }
}

Write-Host "`nDone. Restart Cursor or reload window to pick up skills." -ForegroundColor Cyan
Write-Host "Project skills are in .agents/skills/ (source of truth)" -ForegroundColor Gray
Write-Host "See docs/03-ai-dev-setup.md for usage guide" -ForegroundColor Gray
