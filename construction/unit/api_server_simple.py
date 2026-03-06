#!/usr/bin/env python3
"""
Life OS Google Sheets API Backend (Simple Mock Version)
For testing without Google Sheets authentication

Run: python api_server_simple.py
Then the frontend will POST to http://localhost:8001/api/...
"""

import http.server
import socketserver
import json
from pathlib import Path

PORT = 8001

class APIRequestHandler(http.server.BaseHTTPRequestHandler):
    """HTTP request handler for API endpoints"""
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        print(f"\n📨 POST {self.path}")
        
        # Add CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            print(f"   Board: {data.get('boardType')}")
            print(f"   Item: {data.get('item', {}).get('name', 'N/A')}")
            
            # Route to appropriate handler
            if self.path == '/api/items/append':
                result = self.handle_append_item(data)
            elif self.path == '/api/items/update':
                result = self.handle_update_item(data)
            elif self.path == '/api/items/delete':
                result = self.handle_delete_item(data)
            else:
                result = {'error': f'Unknown endpoint: {self.path}'}
            
            print(f"   Response: {result}")
            self.wfile.write(json.dumps(result).encode('utf-8'))
        except Exception as e:
            print(f"   Error: {e}")
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def handle_append_item(self, data):
        """Handle append item request"""
        board_type = data.get('boardType')
        item = data.get('item')
        
        if not board_type or not item:
            return {'error': 'Missing boardType or item'}
        
        # Mock response - pretend we saved it
        return {
            'success': True,
            'message': f'Item appended to {board_type}',
            'item': item
        }
    
    def handle_update_item(self, data):
        """Handle update item request"""
        board_type = data.get('boardType')
        item_id = data.get('itemId')
        updates = data.get('updates')
        
        if not board_type or not item_id or not updates:
            return {'error': 'Missing boardType, itemId, or updates'}
        
        # Mock response
        return {
            'success': True,
            'message': f'Item updated in {board_type}',
            'itemId': item_id
        }
    
    def handle_delete_item(self, data):
        """Handle delete item request"""
        board_type = data.get('boardType')
        item_id = data.get('itemId')
        
        if not board_type or not item_id:
            return {'error': 'Missing boardType or itemId'}
        
        # Mock response
        return {
            'success': True,
            'message': f'Item deleted from {board_type}',
            'itemId': item_id
        }
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass


def run_api_server():
    """Start the API server"""
    print("\n" + "="*60)
    print("🚀 Life OS API Server (Mock Mode)")
    print("="*60)
    print(f"📍 API running at: http://localhost:{PORT}")
    print("\n✨ Endpoints:")
    print("   POST /api/items/append   - Mock append item")
    print("   POST /api/items/update   - Mock update item")
    print("   POST /api/items/delete   - Mock delete item")
    print("\n💡 This is a mock server for testing")
    print("   Items are NOT saved to Google Sheets")
    print("   Use api_server.py for real Google Sheets integration")
    print("\n🛑 Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    # Create and start server
    handler = APIRequestHandler
    server = socketserver.TCPServer(("", PORT), handler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 API server stopped gracefully")
        server.server_close()


if __name__ == '__main__':
    run_api_server()
