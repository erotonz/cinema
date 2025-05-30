Write-Host "=========================================="
Write-Host "      Initialisation MongoDB Cinema      "
Write-Host "=========================================="

# Fonction pour exécuter un script MongoDB
function Invoke-MongoScript {
    param (
        [string]$ScriptPath
    )
    
    if (-not (Test-Path $ScriptPath)) {
        Write-Host "Erreur: Le script $ScriptPath n'existe pas."
        return $false
    }
    
    try {
        # Vérifier si mongosh est disponible
        $mongoshExists = Get-Command mongosh -ErrorAction SilentlyContinue
        
        if ($mongoshExists) {
            Write-Host "Exécution du script avec mongosh: $ScriptPath"
            mongosh --file $ScriptPath
            return $true
        }
        
        # Vérifier si mongo est disponible (version plus ancienne)
        $mongoExists = Get-Command mongo -ErrorAction SilentlyContinue
        
        if ($mongoExists) {
            Write-Host "Exécution du script avec mongo: $ScriptPath"
            mongo $ScriptPath
            return $true
        }
        
        Write-Host "Erreur: Ni mongosh ni mongo n'ont été trouvés dans le PATH."
        Write-Host "Veuillez installer MongoDB et vous assurer que les outils en ligne de commande sont dans le PATH."
        return $false
        
    } catch {
        Write-Host "Erreur lors de l'exécution du script MongoDB: $_"
        return $false
    }
}

# Vérifier si MongoDB est en cours d'exécution
try {
    $mongoService = Get-Service MongoDB* -ErrorAction SilentlyContinue
    if ($mongoService -eq $null -or $mongoService.Status -ne "Running") {
        Write-Host "ATTENTION: Le service MongoDB ne semble pas être en cours d'exécution."
        Write-Host "Veuillez démarrer MongoDB avant de continuer."
        $continue = Read-Host "Voulez-vous continuer quand même? (O/N)"
        if ($continue -ne "O") {
            exit
        }
    } else {
        Write-Host "MongoDB est en cours d'exécution."
    }
} catch {
    Write-Host "Impossible de vérifier le statut de MongoDB."
    Write-Host "Veuillez vous assurer que MongoDB est bien installé et en cours d'exécution."
    $continue = Read-Host "Voulez-vous continuer quand même? (O/N)"
    if ($continue -ne "O") {
        exit
    }
}

# Exécuter le script de nettoyage et migration si nécessaire
$migrationScript = "$PSScriptRoot\data-migration.js"
if (Test-Path $migrationScript) {
    Write-Host "`nExécution du script de migration des données..."
    $success = Invoke-MongoScript -ScriptPath $migrationScript
    
    if (-not $success) {
        Write-Host "La migration des données a échoué. Voulez-vous continuer avec l'insertion des données d'exemple? (O/N)"
        $continue = Read-Host
        if ($continue -ne "O") {
            exit
        }
    }
} else {
    Write-Host "Le script de migration des données n'a pas été trouvé."
}

# Exécuter le script d'insertion des données d'exemple
$sampleDataScript = "$PSScriptRoot\insert-sample-data.js"
if (Test-Path $sampleDataScript) {
    Write-Host "`nInsertion des données d'exemple..."
    $success = Invoke-MongoScript -ScriptPath $sampleDataScript
    
    if ($success) {
        Write-Host "`nLes données d'exemple ont été insérées avec succès!"
    } else {
        Write-Host "`nL'insertion des données d'exemple a échoué."
        Write-Host "Veuillez vérifier les logs d'erreur ci-dessus."
    }
} else {
    Write-Host "Le script d'insertion des données d'exemple n'a pas été trouvé."
}

Write-Host "`n==========================================" 