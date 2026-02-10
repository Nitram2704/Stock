# IoT Scan Simulation Script
# This script sends a mock POST request to the local backend to simulate a barcode/QR scan.

$apiUrl = "http://localhost:3001/api/v1/inventory/scan"
$sku = Read-Host "Enter SKU to scan (e.g., SKU-123)"
$type = Read-Host "Enter Type (IN/OUT)"

$body = @{
    sku_qr = $sku
    type = $type
    quantity = 1
} | ConvertTo-Json

Write-Host "Simulating scan for SKU: $sku, Type: $type..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success! Response: $($response.message)" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

pause
