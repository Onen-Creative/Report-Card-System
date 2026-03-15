#!/bin/bash

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tadeo@gmail.com","password":"tadeotadeo"}' | jq -r '.tokens.access_token')

echo "Token obtained: ${TOKEN:0:20}..."

# Update student with photo URL
RESPONSE=$(curl -s -X PUT http://localhost:8080/api/v1/students/761b1ded-faad-4199-8688-67c6127c02f8 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "photo_url": "/photos/d6e811cc-1e72-4974-95ad-1db908525d20.jpg"
  }')

echo ""
echo "Response: $RESPONSE"
echo ""
echo "Photo URL updated! Refresh the page to see the photo."
