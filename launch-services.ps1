Write-Host "=========================================="
Write-Host "      Cinema Microservices - Launcher      "
Write-Host "=========================================="

# Vérifier que MongoDB est installé et en cours d'exécution
try {
    $mongoService = Get-Service MongoDB* -ErrorAction SilentlyContinue
    if ($mongoService -eq $null -or $mongoService.Status -ne "Running") {
        Write-Host "ATTENTION: Le service MongoDB ne semble pas être en cours d'exécution."
        Write-Host "Veuillez démarrer MongoDB avant de continuer."
        Write-Host "Si MongoDB n'est pas installé, veuillez l'installer d'abord."
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

# Arrêter tous les processus Java existants pour les services
Write-Host "`nArrêt des services existants..."
Stop-Process -Name "java" -ErrorAction SilentlyContinue

# Fonction pour vérifier si un port est en cours d'utilisation
function Test-Port {
    param(
        [int]$Port
    )
    
    $listener = $null
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        return $false  # Port is free
    } catch {
        return $true   # Port is in use
    } finally {
        if ($listener -ne $null) {
            $listener.Stop()
        }
    }
}

# Fonction pour démarrer un service
function Start-MicroService {
    param(
        [string]$ServiceName,
        [string]$JarPath,
        [int]$Port
    )
    
    Write-Host "`nDémarrage de $ServiceName..."
    
    # Vérifier si le port est déjà utilisé
    if (Test-Port -Port $Port) {
        Write-Host "ATTENTION: Le port $Port est déjà utilisé."
        Write-Host "Cela pourrait empêcher le service de démarrer correctement."
    }
    
    # Démarrer le service
    Start-Process -FilePath "java" -ArgumentList "-jar", $JarPath -WindowStyle Normal
}

# 1. Démarrer le Discovery Service (Eureka)
$discoveryServiceJar = "$PSScriptRoot\discovery-service\target\discovery-service-0.0.1-SNAPSHOT.jar"
Start-MicroService -ServiceName "Discovery Service (Eureka)" -JarPath $discoveryServiceJar -Port 8761

# Attendre que le service Discovery soit prêt
Write-Host "Attente du démarrage du Discovery Service (15 secondes)..."
Start-Sleep -Seconds 15

# 2. Démarrer l'API Gateway
$apiGatewayJar = "$PSScriptRoot\api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar"
Start-MicroService -ServiceName "API Gateway" -JarPath $apiGatewayJar -Port 8080

# Attendre que l'API Gateway soit prêt
Write-Host "Attente du démarrage de l'API Gateway (5 secondes)..."
Start-Sleep -Seconds 5

# 3. Démarrer le User Service
$userServiceJar = "$PSScriptRoot\user-service\target\user-service-0.0.1-SNAPSHOT.jar"
Start-MicroService -ServiceName "User Service" -JarPath $userServiceJar -Port 8081

# 4. Démarrer le Movie Service
$movieServiceJar = "$PSScriptRoot\movie-service\target\movie-service-0.0.1-SNAPSHOT.jar"
Start-MicroService -ServiceName "Movie Service" -JarPath $movieServiceJar -Port 8082

# 5. Démarrer le Booking Service
$bookingServiceJar = "$PSScriptRoot\booking-service\target\booking-service-0.0.1-SNAPSHOT.jar"
Start-MicroService -ServiceName "Booking Service" -JarPath $bookingServiceJar -Port 8083

Write-Host "`n=========================================="
Write-Host "      Tous les services sont démarrés      "
Write-Host "=========================================="
Write-Host "`nAccès aux services :"
Write-Host "- Discovery Service (Eureka): http://localhost:8761"
Write-Host "- API Gateway: http://localhost:8080"
Write-Host "- User Service: http://localhost:8081"
Write-Host "- Movie Service: http://localhost:8082"
Write-Host "- Booking Service: http://localhost:8083"
Write-Host "`nPour arrêter tous les services, exécutez stop-all.bat ou fermez les fenêtres." 