# Script per testare l'API del carrello
# Assicurati che l'applicazione sia in esecuzione su https://localhost:5001

$baseUrl = "https://localhost:5001/api/cart"
$cartId = "test-user-123"

Write-Host "🛒 Testing Cart API con Redis" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Test 1: Ottenere un carrello vuoto
Write-Host "`n1. Ottenendo carrello vuoto..." -ForegroundColor Yellow
$response = curl -X GET "$baseUrl/$cartId" -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

# Test 2: Aggiungere un articolo
Write-Host "`n2. Aggiungendo primo articolo..." -ForegroundColor Yellow
$item1 = @{
    productId = 1
    productName = "Notebook Gaming"
    price = 1299.99
    quantity = 1
    pictureUrl = "https://example.com/notebook.jpg"
    brand = "ASUS"
    type = "Laptop"
} | ConvertTo-Json

$response = curl -X POST "$baseUrl/$cartId/items" -H "Content-Type: application/json" -d $item1 -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

# Test 3: Aggiungere un secondo articolo
Write-Host "`n3. Aggiungendo secondo articolo..." -ForegroundColor Yellow
$item2 = @{
    productId = 2
    productName = "Mouse Gaming"
    price = 79.99
    quantity = 2
    pictureUrl = "https://example.com/mouse.jpg"
    brand = "Logitech"
    type = "Accessory"
} | ConvertTo-Json

$response = curl -X POST "$baseUrl/$cartId/items" -H "Content-Type: application/json" -d $item2 -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

# Test 4: Verificare contenuto carrello
Write-Host "`n4. Verificando contenuto carrello..." -ForegroundColor Yellow
$response = curl -X GET "$baseUrl/$cartId" -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

# Test 5: Aggiornare quantità primo articolo
Write-Host "`n5. Aggiornando quantità primo articolo..." -ForegroundColor Yellow
$updateQuantity = @{
    quantity = 3
} | ConvertTo-Json

$response = curl -X PUT "$baseUrl/$cartId/items/1" -H "Content-Type: application/json" -d $updateQuantity -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

# Test 6: Aggiungere stesso articolo (dovrebbe sommare quantità)
Write-Host "`n6. Aggiungendo stesso articolo (test somma quantità)..." -ForegroundColor Yellow
$item1Again = @{
    productId = 1
    productName = "Notebook Gaming"
    price = 1299.99
    quantity = 1
    pictureUrl = "https://example.com/notebook.jpg"
    brand = "ASUS"
    type = "Laptop"
} | ConvertTo-Json

$response = curl -X POST "$baseUrl/$cartId/items" -H "Content-Type: application/json" -d $item1Again -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

# Test 7: Rimuovere un articolo
Write-Host "`n7. Rimuovendo secondo articolo..." -ForegroundColor Yellow
$response = curl -X DELETE "$baseUrl/$cartId/items/2" -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

# Test 8: Stato finale del carrello
Write-Host "`n8. Stato finale del carrello..." -ForegroundColor Yellow
$response = curl -X GET "$baseUrl/$cartId" -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

# Test 9: Svuotare completamente il carrello
Write-Host "`n9. Svuotando carrello completamente..." -ForegroundColor Yellow
$response = curl -X DELETE "$baseUrl/$cartId" -k -s -w "%{http_code}"
Write-Host "HTTP Status: $response" -ForegroundColor Cyan

# Test 10: Verificare che il carrello sia stato eliminato
Write-Host "`n10. Verificando eliminazione..." -ForegroundColor Yellow
$response = curl -X GET "$baseUrl/$cartId" -k -s
Write-Host "Response: $response" -ForegroundColor Cyan

Write-Host "`n✅ Test completati!" -ForegroundColor Green
