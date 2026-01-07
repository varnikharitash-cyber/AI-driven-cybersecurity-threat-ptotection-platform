import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                print(f"AI Service Error: {e}")

    async def analyze_text(self, text: str, filename: str):
        if not self.model:
            return self._mock_response()

        prompt = f"""
        Analyze the following file content for security threats.
        Filename: {filename}
        Content Snippet:
        {text[:8000]}
        
        Provide a strict JSON response (no markdown, no backticks) with this structure:
        {{
            "risk_score": (integer 0-100),
            "summary": "Brief executive summary of findings",
            "threats": ["list", "of", "specific", "threats"],
            "technical_details": {{
                "vulnerabilities": ["list"],
                "recommendation": "string"
            }}
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_text)
        except Exception as e:
            print(f"Gemini Analysis Failed: {e}")
            return self._mock_response()

    async def analyze_qr_content(self, content: str):
        if not self.model:
            return self._mock_response()

        prompt = f"""
        Analyze the following text derived from a QR Code for security threats.
        Decoded Content: "{content}"
        
        Determine if this is a malicious URL, a phishing attempt, a command injection payload, or safe text.
        
        Provide a strict JSON response (no markdown, no backticks):
        {{
            "decoded_content": "{content}",
            "risk_score": (integer 0-100),
            "summary": "Analysis of the QR content destination/intent",
            "threats": ["list", "of", "threats"],
            "is_qr": true
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_text)
        except Exception as e:
            print(f"Gemini QR Text Analysis Failed: {e}")
            return {
                "decoded_content": content,
                "risk_score": 0,
                "summary": "AI Processing Error",
                "threats": [],
                "is_qr": True
            }

    async def analyze_image(self, image_bytes: bytes, mime_type: str):
        if not self.model:
            return self._mock_response()

        prompt = """
        Analyze this image. If it contains a QR code, extract the data. 
        Analyze the visual content and any extracted URL/Text for security threats (Phishing, Malware, Steganography).
        
        Provide a strict JSON response (no markdown, no backticks):
        {
            "decoded_content": "The string decoded from QR or 'No QR Found'",
            "risk_score": (integer 0-100),
            "summary": "Analysis of the image and QR destination",
            "threats": ["list", "of", "threats"],
            "is_qr": true/false
        }
        """
        try:
            # Create the content part for the image 
            # Note: The exact syntax depends on the SDK version, 
            # but usually passing the dict with 'mime_type' and 'data' works for latest genai.
            image_part = {"mime_type": mime_type, "data": image_bytes}
            
            response = self.model.generate_content([prompt, image_part])
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_text)
        except Exception as e:
            print(f"Gemini Image Analysis Failed: {e}")
            return {
                "decoded_content": "Error Analyzing Image",
                "risk_score": 0,
                "summary": "AI Processing Error",
                "threats": [],
                "is_qr": False
            }

    def chat(self, message: str, context: str = ""):
        if not self.model:
            return "SIMBA (Offline): AI Core is not connected. Check API Key."
        
        try:
            prompt = f"""
            System Context: {context}
            User: {message}
            
            Act as SIMBA, a cybersecurity expert AI. Be concise, technical, and helpful.
            """
            res = self.model.generate_content(prompt)
            return res.text
        except Exception as e:
            return f"Error: {str(e)}"

    def _mock_response(self):
        return {
            "risk_score": 65,
            "summary": "AI Analysis: Limited visibility (Mock Mode). Detected potentially suspicious patterns in content structure.",
            "threats": ["Obfuscation Detected", "Suspicious Metadata", "Unknown Origin"],
            "technical_details": {
                "vulnerabilities": ["Potential Buffer Overflow candidate", "Hardcoded credentials (Confidence: Low)"],
                "recommendation": "Manual review recommended. Run dynamic analysis."
            }
        }

ai_service = AIService()
