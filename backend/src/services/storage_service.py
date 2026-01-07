import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class StorageService:
    def __init__(self):
        self.service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        
        self.client: Client = None
        self.admin_client: Client = None
        
        if self.url:
            try:
                # Standard Client (Anon)
                if self.key:
                    self.client = create_client(self.url, self.key)
                
                # Admin Client (Service Role) - Bypasses RLS
                if self.service_key:
                    print("Storage Service: Service Role Key loaded (RLS Bypass enabled)")
                    self.admin_client = create_client(self.url, self.service_key)
            except Exception as e:
                print(f"Supabase Connection Error: {e}")

    def save_analysis(self, data: dict, user_id=None, token=None):
        target_client = self.client
        
        # This is the most robust way for backend to save data without fighting RLS
        if self.admin_client:
            target_client = self.admin_client
        
        elif token:
            try:
                target_client = create_client(self.url, self.key)
                target_client.auth.set_session(token, "dummy_refresh")
            except Exception as e:
                print(f"Client Auth Scope Error: {e}")

        if not target_client:
            print("Supabase client not initialized")
            return None
        
        try:
            # Prepare data for insertion
            record = {
                "filename": data.get("filename", "unknown"),
                "risk_score": data.get("risk_score", 0),
                "summary": data.get("summary", ""),
                "details": data.get("technical_details", {}),
                "source": data.get("source", "unknown"),
                "user_id": user_id
            }
            
            response = target_client.table("analysis_results").insert(record).execute()
            return response
        except Exception as e:
            print(f"Error saving to Supabase: {e}")
            return None

storage_service = StorageService()
