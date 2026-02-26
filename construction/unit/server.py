#!/usr/bin/env python3
"""
Life OS SPA Development Server
Handles client-side routing with catch-all redirect to index.html

Features:
- Serves static files from /src directory
- Redirects all non-file routes to index.html for client-side routing
- Adds CORS headers for development
- Configures cache control headers
- Pretty logging output

Run: python server.py
Then open: http://localhost:3000
"""

import http.server
import socketserver
import os
import mimetypes
from pathlib import Path
from urllib.parse import urlparse

PORT = 8000
# Set static directory to /src folder
STATIC_DIR = Path(__file__).parent / "src"


class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom HTTP request handler for Single Page Application (SPA)
    - Serves static files from /src directory
    - Redirects all non-file routes to index.html for client-side routing
    - Adds CORS headers for development
    - Configures cache control headers
    """
    
    def __init__(self, *args, **kwargs):
        # Set the directory to serve files from
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)
    
    def do_GET(self):
        """Handle GET requests with SPA routing logic"""
        # Parse URL without query string
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Normalize path
        if path == '/':
            path = '/index.html'
        
        # Get the file path
        file_path = STATIC_DIR / path.lstrip('/')
        
        # Check if it's a static file (has extension)
        if self._is_static_file(path):
            # Try to serve the file
            if file_path.exists() and file_path.is_file():
                self.path = path
                return super().do_GET()
            else:
                # File not found, return 404
                self.send_error(404, f"File not found: {path}")
                return
        
        # It's a route (no file extension), serve index.html for client-side routing
        self.path = '/index.html'
        return super().do_GET()
    
    def _is_static_file(self, path):
        """Check if path is a static file (has a file extension)"""
        # Get the last part of the path
        last_part = path.split('/')[-1]
        # Check if it has a dot (file extension)
        return '.' in last_part
    
    def end_headers(self):
        """Add CORS and cache headers"""
        # CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Cache control headers
        if self.path.endswith(('.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2')):
            # Cache static assets for 1 hour
            self.send_header('Cache-Control', 'public, max-age=3600')
        else:
            # Don't cache HTML files
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        super().end_headers()
    
    def log_message(self, format, *args):
        """Custom logging format"""
        # Only log actual requests, not 404s for non-existent files
        if '404' not in str(args):
            print(f"[{self.log_date_time_string()}] {format % args}")
    
    def guess_type(self, path):
        """Guess the MIME type of a file"""
        mimetype = mimetypes.guess_type(path)[0]
        if mimetype:
            return mimetype
        # Default to text/plain for unknown types
        return 'text/plain'


def run_server():
    """Start the development server"""
    # Verify src directory exists
    if not STATIC_DIR.exists():
        print(f"❌ Error: {STATIC_DIR} directory not found!")
        print(f"   Please ensure you have a /src folder with index.html")
        return
    
    # Verify index.html exists
    index_file = STATIC_DIR / 'index.html'
    if not index_file.exists():
        print(f"❌ Error: {index_file} not found!")
        print(f"   Please ensure you have /src/index.html")
        return
    
    # Create server
    handler = SPARequestHandler
    server = socketserver.TCPServer(("", PORT), handler)
    
    # Print startup message
    print("\n" + "="*60)
    print("🚀 Life OS SPA Development Server")
    print("="*60)
    print(f"📍 Server running at: http://localhost:{PORT}")
    print(f"📁 Serving from: {STATIC_DIR}")
    print(f"📄 Index file: {index_file}")
    print("\n✨ Features:")
    print("   ✓ Static files served from /src")
    print("   ✓ SPA routing: Non-file routes redirect to index.html")
    print("   ✓ CORS enabled for development")
    print("   ✓ Cache control headers configured")
    print("\n📝 Example routes:")
    print("   http://localhost:3000/                    → index.html")
    print("   http://localhost:3000/?area=chores        → index.html (SPA routing)")
    print("   http://localhost:3000/styles.css          → styles.css (static file)")
    print("   http://localhost:3000/app.js              → app.js (static file)")
    print("\n🛑 Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped gracefully")
        server.server_close()


if __name__ == '__main__':
    run_server()
