# Yumna Database Backup Script
# Requires Docker running

$ContainerName = "yumna-postgres"
$DatabaseName = "yumna_db"
$User = "yumna"
$BackupFolder = ".\backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$OutputFile = "$BackupFolder\yumna_backup_$Timestamp.sql"

# Create backup folder if not exists
if (!(Test-Path $BackupFolder)) {
    New-Item -ItemType Directory -Path $BackupFolder
}

Write-Host "Starting backup for $DatabaseName..." -ForegroundColor Cyan

# Execute pg_dump inside container
docker exec $ContainerName pg_dump -U $User $DatabaseName > $OutputFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup successful: $OutputFile" -ForegroundColor Green
} else {
    Write-Host "Backup failed!" -ForegroundColor Red
}
