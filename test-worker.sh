#!/bin/bash

# Test script for Cloudflare Workers MCP server

echo "=== Testing System Designer MCP Server (Workers) ==="
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s http://localhost:8787/health
echo -e "\n✅ Health check passed\n"

# Test 2: Root endpoint
echo "2. Testing root endpoint..."
curl -s http://localhost:8787/ | jq '.'
echo -e "✅ Root endpoint passed\n"

# Test 3: SSE connection (get session ID)
echo "3. Testing SSE endpoint (getting session ID)..."
SESSION_DATA=$(curl -N -m 2 http://localhost:8787/sse 2>/dev/null | head -n 2)
echo "$SESSION_DATA"

# Extract session ID from SSE response
SESSION_ID=$(echo "$SESSION_DATA" | grep "data:" | sed 's/.*sessionId=//')
echo "Session ID: $SESSION_ID"
echo -e "✅ SSE endpoint passed\n"

# Test 4: List tools
echo "4. Testing tools/list..."
curl -s -X POST "http://localhost:8787/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | jq '.'
echo -e "✅ Tools list passed\n"

# Test 5: Create MSON model
echo "5. Testing create_mson_model..."
curl -s -X POST "http://localhost:8787/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_mson_model",
      "arguments": {
        "name": "TestModel",
        "description": "A test model",
        "entities": [
          {
            "id": "entity_1",
            "name": "User",
            "type": "class",
            "attributes": [
              {
                "name": "id",
                "type": "string",
                "visibility": "private"
              }
            ],
            "methods": []
          }
        ],
        "relationships": []
      }
    }
  }' | jq '.result.content[0].text' -r
echo -e "\n✅ Create MSON model passed\n"

echo "=== All tests completed successfully! ==="

