#!/usr/bin/env python3
"""
Setup OAuth credentials for Google Sheets API

This script will:
1. Open a browser window for you to sign in with Google
2. Ask for permission to access Google Sheets
3. Save the credentials locally for future use

Run: python setup_oauth.py
"""

import gspread
from pathlib import Path
import os

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

def setup_oauth():
    """Set up OAuth credentials"""
    print("\n" + "="*60)
    print("🔐 Google Sheets OAuth Setup")
    print("="*60)
    print("\nThis will open a browser window for you to sign in.")
    print("Please follow the prompts to grant access to Google Sheets.\n")
    
    try:
        # Get the client_secret.json file
        client_secret_file = Path(__file__).parent / 'client_secret.json'
        
        if not client_secret_file.exists():
            print(f"✗ client_secret.json not found at: {client_secret_file}")
            print("\nPlease download it from Google Cloud Console:")
            print("1. Go to https://console.cloud.google.com/credentials")
            print("2. Find your OAuth 2.0 Client ID")
            print("3. Click the download icon")
            print("4. Save as 'client_secret.json' in this directory")
            return
        
        print(f"✓ Found client_secret.json")
        
        # Create credentials directory if it doesn't exist
        creds_dir = Path.home() / '.config' / 'gspread'
        creds_dir.mkdir(parents=True, exist_ok=True)
        
        # This will open a browser window for authentication
        client = gspread.oauth(
            scopes=SCOPES,
            credentials_filename=str(client_secret_file),
            authorized_user_filename=str(creds_dir / 'authorized_user.json')
        )
        
        print("\n✓ Authentication successful!")
        print(f"✓ Credentials saved to: {creds_dir / 'authorized_user.json'}")
        print("\nYou can now run: python api_server.py")
        
    except Exception as e:
        print(f"\n✗ Authentication failed: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure you have a Google account")
        print("2. Make sure you have internet connection")
        print("3. Make sure client_secret.json is in this directory")
        print("4. Try running this script again")

if __name__ == '__main__':
    setup_oauth()
