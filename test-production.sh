#!/bin/bash

# Test script for production Cloudflare Workers deployment
# Usage: ./test-production.sh [worker-url]

WORKER_URL="${1:-https://system-designer-mcp.system-designer-mcp.workers.dev}"

echo "=== Testing Production System Designer MCP Server ==="
echo "URL: $WORKER_URL"
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$WORKER_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed: $BODY"
else
    echo "❌ Health check failed (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi
echo ""

# Test 2: Root endpoint
echo "2. Testing root endpoint..."
ROOT_RESPONSE=$(curl -s "$WORKER_URL/" 2>&1)
if echo "$ROOT_RESPONSE" | jq -e '.name' > /dev/null 2>&1; then
    echo "✅ Root endpoint passed"
    echo "$ROOT_RESPONSE" | jq '.'
else
    echo "❌ Root endpoint failed"
    echo "Response: $ROOT_RESPONSE"
    exit 1
fi
echo ""

# Test 3: SSE connection (get session ID)
echo "3. Testing SSE endpoint (getting session ID)..."
SESSION_DATA=$(curl -N -m 2 "$WORKER_URL/sse" 2>/dev/null | head -n 2)
if [ -z "$SESSION_DATA" ]; then
    echo "❌ SSE endpoint failed - no response"
    exit 1
fi

echo "$SESSION_DATA"
SESSION_ID=$(echo "$SESSION_DATA" | grep "data:" | sed 's/.*sessionId=//')

if [ -z "$SESSION_ID" ]; then
    echo "❌ Failed to extract session ID"
    exit 1
fi

echo "Session ID: $SESSION_ID"
echo "✅ SSE endpoint passed"
echo ""

# Test 4: List tools
echo "4. Testing tools/list..."
TOOLS_RESPONSE=$(curl -s -X POST "$WORKER_URL/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' 2>&1)

if echo "$TOOLS_RESPONSE" | jq -e '.result.tools' > /dev/null 2>&1; then
    echo "✅ Tools list passed"
    TOOL_COUNT=$(echo "$TOOLS_RESPONSE" | jq '.result.tools | length')
    echo "Available tools: $TOOL_COUNT"
    echo "$TOOLS_RESPONSE" | jq '.result.tools[].name'
else
    echo "❌ Tools list failed"
    echo "Response: $TOOLS_RESPONSE"
    exit 1
fi
echo ""

# Test 5: Create MSON model
echo "5. Testing create_mson_model..."
MODEL_RESPONSE=$(curl -s -X POST "$WORKER_URL/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_mson_model",
      "arguments": {
        "name": "ProductionTest",
        "description": "Production deployment test",
        "type": "class",
        "entities": [
          {
            "id": "entity_1",
            "name": "TestEntity",
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
  }' 2>&1)

if echo "$MODEL_RESPONSE" | jq -e '.result' > /dev/null 2>&1; then
    echo "✅ Create MSON model passed"
    echo "$MODEL_RESPONSE" | jq '.result.content[0].text' -r | head -n 5
else
    echo "❌ Create MSON model failed"
    echo "Response: $MODEL_RESPONSE"
    exit 1
fi
echo ""

echo "=== All production tests completed successfully! ==="
echo ""
echo "Your MCP server is live and fully functional at:"
echo "$WORKER_URL"

