$replacements = @(
    @{search="DashRx"; replace="PharmaDash"},
    @{search="dashrx"; replace="pharmadash"},
    @{search="gstin"; replace="odsCode"},
    @{search="GSTIN"; replace="ODS Code"},
    @{search="GST Slab"; replace="VAT Slab"},
    @{search="GST"; replace="FP34"},
    @{search="GSTR-2B"; replace="NHSBSA"},
    @{search="₹"; replace="£"},
    @{search="Drug License No"; replace="NHS Contract No"},
    @{search="Drug License"; replace="NHS Contract"},
    @{search="Stockist Recon"; replace="Statement Recon"},
    @{search="Stockist"; replace="Supplier"},
    @{search="stockist"; replace="supplier"},
    @{search="Pin-code Demand"; replace="Dispensing Data"},
    @{search="Pin-code"; replace="National"},
    @{search="Pincode"; replace="National"},
    @{search="Peer Benchmark"; replace="Pharmacy Comparison"},
    @{search="DPDP"; replace="GDPR"},
    @{search="India"; replace="UK"},
    @{search="Indian"; replace="UK"},
    @{search="27AAAAA1111A1Z1"; replace="FLF77"},
    @{search="DL-2026/MH-MUM"; replace="NHS-2026-UK"},
    @{search="Krishna Medicos, Mumbai"; replace="Smiths Pharmacy, London"},
    @{search="Keimed Mumbai"; replace="Alliance Healthcare"},
    @{search="PharmEasy B2B Portal"; replace="AAH Pharmaceuticals"},
    @{search="Ascent Wellness"; replace="Phoenix Medical"},
    @{search="Apollo B2B Portal"; replace="Sigma Pharmaceuticals"},
    @{search="Rupee"; replace="Pound"},
    @{search="Mumbai"; replace="London"},
    @{search="Delhi"; replace="Manchester"},
    @{search="Hyderabad"; replace="Birmingham"},
    @{search="Pune"; replace="Leeds"}
)

function Process-Directory {
    param (
        [string]$Path
    )

    $files = Get-ChildItem -Path $Path -File
    foreach ($file in $files) {
        if ($file.Name -eq "Home.jsx" -or $file.Name -eq "convert.js" -or $file.Name -eq "convert.ps1") { continue }
        if ($file.Extension -eq ".jsx" -or $file.Extension -eq ".md" -or $file.Extension -eq ".cjs") {
            $content = Get-Content -Path $file.FullName -Raw
            $originalContent = $content
            foreach ($rule in $replacements) {
                # Case sensitive replacement using -creplace for specific ones if needed, but -replace is case insensitive.
                # We need case sensitive for 'gstin' vs 'GSTIN'
                if ($rule.search -cmatch '^[A-Z]+$') {
                    $content = $content -creplace $rule.search, $rule.replace
                } elseif ($rule.search -cmatch '^[a-z]+$') {
                    $content = $content -creplace $rule.search, $rule.replace
                } else {
                    $content = $content -replace $rule.search, $rule.replace
                }
            }
            if ($content -cne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                Write-Host "Updated $($file.Name)"
            }
        }
    }
    
    $dirs = Get-ChildItem -Path $Path -Directory
    foreach ($dir in $dirs) {
        if ($dir.Name -eq "node_modules" -or $dir.Name -eq ".git" -or $dir.Name -eq "dist") { continue }
        Process-Directory -Path $dir.FullName
    }
}

Process-Directory -Path "c:\Users\HP\DashRx"
Write-Host "Conversion complete."
