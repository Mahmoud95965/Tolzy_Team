$targetDir = "../tolzy-auth-system"

if (Test-Path $targetDir) {
    Set-Location $targetDir
    Write-Host "Navigated to $targetDir"
    
    git init
    git branch -M main
    
    # Check if remote exists to avoid error
    if ((git remote) -contains 'origin') {
        git remote set-url origin https://github.com/Mahmoud95965/System-Sign-in-Tolzy.git
    } else {
        git remote add origin https://github.com/Mahmoud95965/System-Sign-in-Tolzy.git
    }
    
    git add .
    git commit -m "Initial commit: Separated Auth System"
    git push -u origin main
    
    Write-Host "Done!"
} else {
    Write-Error "Target directory $targetDir not found."
}
