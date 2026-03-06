#!/usr/bin/env python3
"""
Life OS Google Sheets API Backend
Handles Google Sheets API calls from the frontend

Features:
- Appends items to Google Sheets
- Updates items in Google Sheets
- Deletes items from Google Sheets
- Uses gspread for Google Sheets access
- CORS enabled for development

Run: python api_server.py
Then the frontend will POST to http://localhost:8001/api/...
"""

import http.server
import socketserver
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env.local file
env_file = Path(__file__).parent / '.env.local'
if env_file.exists():
    load_dotenv(env_file)
    print(f"✓ Loaded environment from {env_file}")

try:
    import gspread
except ImportError:
    print("✗ gspread not installed. Run: pip install gspread")
    exit(1)

PORT = 8001

# Google Sheets configuration
SHEET_ID = os.getenv('VITE_GOOGLE_SHEET_ID', '1aiYIthWFsTEKjlCrpxjvuHH364tHOdVofDdwxnv79u4')
CLIENT_ID = os.getenv('VITE_GOOGLE_CLIENT_ID', '611682630550-3bod8q02tmd3sr8b6jmko27v2f3reutt.apps.googleusercontent.com')

# Sheet name mapping
SHEET_NAMES = {
    'chores': 'Chores',
    'selfCare': 'SelfCare',
    'bathRitual': 'BathRitual',
    'fridge': 'Fridge',
    'nonFood': 'NonFood',
    'bathroomClean': 'BathroomClean',
    'pantry': 'Pantry',
    'gym': 'Gym',
    'rto': 'RTO',
    'firstAid': 'FirstAid'
}

class GoogleSheetsAPI:
    """Wrapper for Google Sheets API operations"""
    
    def __init__(self):
        self.client = None
        self.spreadsheet = None
        self.authenticate()
    
    def authenticate(self):
        """Authenticate with Google Sheets API"""
        try:
            # Try to use service account credentials if available
            creds_file = Path(__file__).parent / 'credentials.json'
            if creds_file.exists():
                self.client = gspread.service_account(filename=str(creds_file))
                print(f"✓ Authenticated with service account")
            else:
                # For personal use, use OAuth with gspread
                # This will open a browser for authentication
                print("🔐 Starting OAuth authentication...")
                print("   A browser window will open for you to sign in")
                self.client = gspread.oauth(
                    scopes=['https://www.googleapis.com/auth/spreadsheets',
                            'https://www.googleapis.com/auth/drive']
                )
                print(f"✓ Authenticated with OAuth")
            
            # Open the spreadsheet
            self.spreadsheet = self.client.open_by_key(SHEET_ID)
            print(f"✓ Opened Google Sheet: {SHEET_ID}")
        except Exception as e:
            print(f"✗ Failed to authenticate with Google Sheets: {e}")
            print(f"   Falling back to mock mode")
            self.client = None
            self.spreadsheet = None
    
    def append_item(self, board_type, item):
        """Append an item to a Google Sheet"""
        if not self.client or not self.spreadsheet:
            raise Exception("Google Sheets API not authenticated - falling back to local storage")
        
        sheet_name = SHEET_NAMES.get(board_type)
        if not sheet_name:
            raise Exception(f"Unknown board type: {board_type}")
        
        try:
            worksheet = self.spreadsheet.worksheet(sheet_name)
            
            # Prepare row data
            row = [
                item.get('id', ''),
                item.get('name', ''),
                item.get('category', ''),
                item.get('status', ''),
                str(item.get('completed', False)).lower(),
                item.get('timestamp', ''),
                item.get('notes', '')
            ]
            
            # Append to sheet
            worksheet.append_row(row)
            print(f"✓ Appended item to {sheet_name}: {item.get('name')}")
            return {'success': True, 'message': f'Item appended to {sheet_name}'}
        except Exception as e:
            print(f"✗ Failed to append item: {e}")
            raise
    
    def update_item(self, board_type, item_id, updates):
        """Update an item in a Google Sheet"""
        if not self.client or not self.spreadsheet:
            raise Exception("Not authenticated with Google Sheets")
        
        sheet_name = SHEET_NAMES.get(board_type)
        if not sheet_name:
            raise Exception(f"Unknown board type: {board_type}")
        
        try:
            worksheet = self.spreadsheet.worksheet(sheet_name)
            
            # Find the row with matching ID
            cell = worksheet.find(item_id)
            if not cell:
                raise Exception(f"Item not found: {item_id}")
            
            row_num = cell.row
            
            # Update the row
            if 'name' in updates:
                worksheet.update_cell(row_num, 2, updates['name'])
            if 'completed' in updates:
                worksheet.update_cell(row_num, 5, str(updates['completed']).lower())
            if 'status' in updates:
                worksheet.update_cell(row_num, 4, updates['status'])
            if 'notes' in updates:
                worksheet.update_cell(row_num, 7, updates['notes'])
            
            print(f"✓ Updated item in {sheet_name}: {item_id}")
            return {'success': True, 'message': f'Item updated in {sheet_name}'}
        except Exception as e:
            print(f"✗ Failed to update item: {e}")
            raise
    
    def delete_item(self, board_type, item_id):
        """Delete an item from a Google Sheet"""
        if not self.client or not self.spreadsheet:
            raise Exception("Not authenticated with Google Sheets")
        
        sheet_name = SHEET_NAMES.get(board_type)
        if not sheet_name:
            raise Exception(f"Unknown board type: {board_type}")
        
        try:
            worksheet = self.spreadsheet.worksheet(sheet_name)
            
            # Find the row with matching ID
            cell = worksheet.find(item_id)
            if not cell:
                raise Exception(f"Item not found: {item_id}")
            
            row_num = cell.row
            
            # Delete the row
            worksheet.delete_rows(row_num)
            
            print(f"✓ Deleted item from {sheet_name}: {item_id}")
            return {'success': True, 'message': f'Item deleted from {sheet_name}'}
        except Exception as e:
            print(f"✗ Failed to delete item: {e}")
            raise


class APIRequestHandler(http.server.BaseHTTPRequestHandler):
    """HTTP request handler for API endpoints"""
    
    sheets_api = None
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
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
            
            # Route to appropriate handler
            if self.path == '/api/items/append':
                result = self.handle_append_item(data)
            elif self.path == '/api/items/update':
                result = self.handle_update_item(data)
            elif self.path == '/api/items/delete':
                result = self.handle_delete_item(data)
            else:
                result = {'error': f'Unknown endpoint: {self.path}'}
            
            self.wfile.write(json.dumps(result).encode('utf-8'))
        except Exception as e:
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def handle_append_item(self, data):
        """Handle append item request"""
        board_type = data.get('boardType')
        item = data.get('item')
        
        if not board_type or not item:
            return {'error': 'Missing boardType or item'}
        
        try:
            if not self.sheets_api:
                return {'error': 'Google Sheets API not initialized'}
            
            result = self.sheets_api.append_item(board_type, item)
            return result
        except Exception as e:
            return {'error': str(e)}
    
    def handle_update_item(self, data):
        """Handle update item request"""
        board_type = data.get('boardType')
        item_id = data.get('itemId')
        updates = data.get('updates')
        
        if not board_type or not item_id or not updates:
            return {'error': 'Missing boardType, itemId, or updates'}
        
        try:
            if not self.sheets_api:
                return {'error': 'Google Sheets API not initialized'}
            
            result = self.sheets_api.update_item(board_type, item_id, updates)
            return result
        except Exception as e:
            return {'error': str(e)}
    
    def handle_delete_item(self, data):
        """Handle delete item request"""
        board_type = data.get('boardType')
        item_id = data.get('itemId')
        
        if not board_type or not item_id:
            return {'error': 'Missing boardType or itemId'}
        
        try:
            if not self.sheets_api:
                return {'error': 'Google Sheets API not initialized'}
            
            result = self.sheets_api.delete_item(board_type, item_id)
            return result
        except Exception as e:
            return {'error': str(e)}
    
    def log_message(self, format, *args):
        """Custom logging format"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def run_api_server():
    """Start the API server"""
    print("\n" + "="*60)
    print("🚀 Life OS Google Sheets API Server")
    print("="*60)
    print(f"📍 API running at: http://localhost:{PORT}")
    print(f"📊 Google Sheet ID: {SHEET_ID}")
    print("\n✨ Endpoints:")
    print("   POST /api/items/append   - Append item to sheet")
    print("   POST /api/items/update   - Update item in sheet")
    print("   POST /api/items/delete   - Delete item from sheet")
    print("\n🛑 Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    # Initialize Google Sheets API
    APIRequestHandler.sheets_api = GoogleSheetsAPI()
    
    if not APIRequestHandler.sheets_api.client:
        print("⚠️  Warning: Google Sheets API not authenticated")
        print("   API will return errors until authentication is set up")
    
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
