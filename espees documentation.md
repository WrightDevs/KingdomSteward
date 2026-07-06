# Espees API Documentation

## Introduction

### Espees API System Overview
Understand the two main categories of the Espees API system.

### Espees Merchant APIs
The Espees Merchant APIs are designed for users with merchant status on the Espees platform. A merchant is similar to a business account holder in traditional banking systems.

These accounts are used primarily for business-related transactions. If you're building applications for these users, use the Merchant API suite.

**Use Case:** Business owners or organizations using Espees for commercial transactions.

---

## Espees Merchant Web APIs Documentation
The Espees Merchant Web APIs allow applications to seamlessly integrate product listings, initiate payments, and confirm transaction statuses using the Espees payment platform. The process is easy and has been streamlined for easy integration into any platform you might be using to develop your applications.

### Authentication
**Header:** `x-api-key: 'your-api-key'`

Before you begin using the APIs, you will need to sign up/sign in to the Espees developer console. Click on the token menu to copy your developer's token.

### Steps on how to use the payment integration API

#### 📦 Step 1. Product Setup
First, you create the product you want to charge in our system by sending the required details as stated below to the product API.

**POST Link:** `https://api.espees.org/v2/payment/product`

**Headers:**
```
Content-Type: application/json
x-api-key: <your-api-key>
```

**Request Body:**
```json
{
  "product_sku": "SKU123ABC",
  "narration": "Product description or name",
  "price": 0.1,
  "merchant_wallet": "your-merchant-wallet-address",
  "success_url": "https://yourdomain.com/success ",
  "fail_url": "https://yourdomain.com/failure",
  "user_data": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_sku` | String | Yes | Unique product/service ID (This needs to be generated in your backend code.) |
| `narration` | String | Yes | Product description or name |
| `price` | Float | Yes | Amount in Espees (ESP) |
| `merchant_wallet` | String | Yes | Merchant wallet address |
| `success_url` | String | Yes | Redirect URL after success |
| `fail_url` | String | Yes | Redirect URL after failure |
| `user_data` | JSON | No | Optional additional metadata |

**Sample Response:**
```json
{
  "statusCode": 200,
  "payment_ref": "61a28ca663b0f2e92297f110c99176c9",
  "message": "Successfully Done"
}
```
*The response returns a payment ref for the created product. You need that ref-code for the next step.*

#### 💳 Step 2. Make Payment
Route next to the payment URL adding the `payment_ref` you created previously. 

**GET** `https://payment.espees.org/pay/<payment_ref>`

Replace `<payment_ref>` with the reference from the product setup step.
Redirect the user to this URL to complete the payment via the Espees Payment Portal.

#### ✅ Step 3. Confirm Payment
**POST** `https://api.espees.org/v2/payment/confirm/`

**Headers:**
```
Content-Type: application/json
x-api-key: <your-api-key>
```

**Request Body:**
```json
{
  "payment_ref": "your_payment_ref_here"
}
```

**Sample Response:**
```json
{
  "customer_username": "john_doe",
  "product_sku": "SKU123ABC",
  "narration": "Product description",
  "price": 0.1,
  "transaction_status": "APPROVED",
  "status_details": "Successfully Done",
  "transaction_date": "18-01-2023 5:50:23",
  "user_data": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

**Transaction Status Values:**

| Status | Meaning |
|--------|---------|
| APPROVED | Payment was successful |
| DECLINE | Payment failed |
| PENDING | Payment is still processing |
| NOT FOUND | No payment attempt found |

### 🔁 Integration Flow
1. Create a product using the Product Setup API.
2. Redirect the user to the payment URL using `payment_ref`.
3. After payment, the user is redirected to your `success_url` or `fail_url`.
4. Verify the transaction using the Confirm Payment API.

### API Examples (PHP)
```php
<?php
$apiKey = "YOUR_API_KEY";

// 1. Product Setup - Create Product
function createProduct($data) {
    global $apiKey;
    $url = "https://api.espees.org/v2/payment/product";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "x-api-key: $apiKey"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

// Usage example
$productData = [
    "product_sku" => "SKU123ABC",
    "narration" => "Sample product",
    "price" => 0.1,
    "merchant_wallet" => "your_merchant_wallet_address",
    "success_url" => "https://yourdomain.com/success",
    "fail_url" => "https://yourdomain.com/failure",
    "user_data" => [
        "param1" => "value1",
        "param2" => "value2"
    ]
];

$result = createProduct($productData);
print_r($result);
```

---

## Espees Vending APIs
The Espees Vending APIs are intended for liquidity partners—users who hold and transact in large volumes of Espees.

These users may not be businesses, but they contribute significantly to maintaining liquidity in the system. To develop applications for them, use the Vending API suite.

**Use Case:** High-volume Espees holders enabling frequent transactions, including non-business entities.

### 📘 Espees Vending Agent API Documentation
The Espees Vending API allows agents (liquidity partners) to programmatically create vending tokens and vend Espees to users.

**🔐 Authentication**
All requests must include the `x-api-key` header.

#### 1. 🔑 Create Vending Token
**Endpoint: POST** `https://api.espees.org/agents/vending/createtoken`

**Headers:**
```
Content-Type: application/json
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "vending_wallet_address": "wallet_address_of_vending_agent",
  "vending_wallet_pin": "pin_of_vending_agent",
  "vending_hash": "16_character_unique_string"
}
```

**Sample Response:**
```json
{
  "statusCode": 200,
  "vending_token": "61a28ca663b0f2e92297f110c99176c9",
  "message": "Successfully Done"
}
```

#### 2. 🪙 Vend Espees
**Endpoint: POST** `https://api.espees.org/v2/vending/vend`

**Headers:**
```
Content-Type: application/json
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "vending_token": "vending_token_received_from_previous_call",
  "user_wallet": "user_espees_wallet_address",
  "amount_in_espees": 10
}
```

**Sample Response:**
```json
{
    "statusCode": 200,
    "message": "Vend successful",
    "transaction_id": "abc123xyz"
}
```

### 🔧 Sample Code (PHP Curl)
```php
$data = [
  'vending_wallet_address' => 'your_wallet_address',
  'vending_wallet_pin' => 'your_wallet_pin',
  'vending_hash' => 'UNIQUEHASH123456'
];

$ch = curl_init('https://api.espees.org/agents/vending/createtoken');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'x-api-key: your_api_key'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
```

**✅ Notes**
- Each `vending_hash` must be a unique 16-character alphanumeric string.
- Tokens are single-use; always generate a new one per transaction.
- Keep your `x-api-key` and `vending_wallet_pin` secret.

---

## Quick Espees Payment Integration (Pure JS + PHP Proxy)

### Setup
**Quick set up**

Adding the script to your files. Paste this script on the body of the page you want users to pay with Espees:
```html
<script src="url?token=<your token>"></script>
```

**Locally Hosted Setup**
1. Download the zip file of the plugin from here: https://github.com/giftty/espees_payment_integration.git
2. Unzip the zip file and place it in your root directory.
3. Replace placeholder token: `<your-token>`

### Usage
```html
<div id="espees-button"></div>
<!-- set width as needed for your design -->
```

Initialise the function in your script like this:
```html
<script>
Espees.init({
    amount: "amount",
    sku: "<Product_identity>",
    narration: "<Example Product>",
    merchant_wallet: "Merchant-wallet-address",
    success_url: "success.html",
    fail_url: "failure.html",
    token: "<your token>"
});
</script>
```
And that's it. Users can click the button to make a payment.
