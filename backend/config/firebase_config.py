import firebase_admin
from firebase_admin import credentials, db as db_admin
import os
from dotenv import load_dotenv

load_dotenv()

def initialize_firebase():
    """
    Initializes Firebase Admin SDK with Realtime Database.
    """
    if not firebase_admin._apps:
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://hirex-d80c6-default-rtdb.firebaseio.com'
            })
        else:
            try:
                firebase_admin.initialize_app(None, {
                    'databaseURL': 'https://hirex-d80c6-default-rtdb.firebaseio.com'
                })
            except Exception as e:
                print(f"Warning: Firebase Admin not initialized: {e}")

    return db_admin.reference()

db = initialize_firebase()
