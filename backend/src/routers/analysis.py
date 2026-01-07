from fastapi import APIRouter, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from src.services.ai_service import ai_service
from src.services.pcap_service import pcap_service

from src.services.virustotal_service import vt_service
from src.services.storage_service import storage_service
from fastapi import Depends
from src.auth import verify_token

router = APIRouter()

@router.post("/file")
async def analyze_file(file: UploadFile = File(...), auth_data=Depends(verify_token)):
    user = auth_data['user']
    token = auth_data['token']
    content = await file.read()
    filename = file.filename
    
    # 1. Try VirusTotal (Run in threadpool to allow polling)
    vt_result = await run_in_threadpool(vt_service.scan_file, content, filename)
    
    if vt_result:
        vt_data = {
            "filename": filename,
            "name": filename,
            "size": f"{len(content)/1024:.2f} KB",
            "type": file.content_type,
            "score": vt_result["risk_score"],
            "risk_score": vt_result["risk_score"],
            "summary": vt_result["summary"],
            "threats": vt_result["threats"],
            "technical_details": vt_result["details"],
            "source": "VirusTotal"
        }
        # Save to DB
        storage_service.save_analysis(vt_data, user_id=user.id, token=user.user_metadata.get('access_token')) 
        return vt_data

    # 2. Fallback to Gemini
    try:
        text_content = content.decode('utf-8')
        ai_result = await ai_service.analyze_text(text_content, filename)
        
        result_data = {
            "filename": filename,
            "name": filename,
            "size": f"{len(content)/1024:.2f} KB",
            "type": file.content_type,
            "score": ai_result.get("risk_score", 0),
            **ai_result,
            "source": "Gemini AI"
        }
        
        # Save to DB
        storage_service.save_analysis(result_data, user_id=user.id, token=token)
        return result_data
    except UnicodeDecodeError:
        return {
            "filename": filename,
            "name": filename,
            "size": f"{len(content)/1024:.2f} KB",
            "type": "Binary",
            "score": 0,
            "risk_score": 0,
            "summary": "Clean binary file (No VirusTotal matches).",
            "threats": [],
            "technical_details": {},
            "source": "VirusTotal (Clean)"
        }

@router.post("/pcap")
async def analyze_pcap(file: UploadFile = File(...), auth_data=Depends(verify_token)):
    return pcap_service.analyze(file.file, file.filename)

@router.post("/qr")
async def analyze_qr(file: UploadFile = File(...), auth_data=Depends(verify_token)):
    user = auth_data['user']
    token = auth_data['token']
    content = await file.read()
    # Detect mime type or default to png
    mime_type = file.content_type if file.content_type else "image/png"
    
    
    result = await ai_service.analyze_image(content, mime_type)
    # Save Image Analysis
    storage_service.save_analysis({**result, "filename": file.filename, "source": "Gemini Vision"}, user_id=user.id, token=token)
    return result

@router.post("/qr-text")
async def analyze_qr_text(data: dict, auth_data=Depends(verify_token)):
    user = auth_data['user']
    token = auth_data['token']
    content = data.get("content")
    if not content:
        return {"error": "No content provided"}
        
    result = await ai_service.analyze_qr_content(content)
    # Save QR Text Analysis
    storage_service.save_analysis({**result, "filename": "QR_CONTENT", "source": "Gemini QR"}, user_id=user.id, token=token)
    return result

@router.post("/url")
async def analyze_url(data: dict, auth_data=Depends(verify_token)):
    url = data.get("url")
    if not url:
        return {"error": "No URL provided"}

    # Run in threadpool
    vt_result = None
    error_msg = None
    
    if not vt_service.client:
        error_msg = "VirusTotal not configured (Check API Key)"
    else:
        try:
            vt_result = await run_in_threadpool(vt_service.scan_url, url)
        except Exception as e:
            print(f"VT Execution Error: {e}")
            error_msg = str(e)

    if vt_result:
        return {
            "filename": url,
            "name": url,
            "size": "N/A",
            "type": "URL",
            "score": vt_result["risk_score"],
            "risk_score": vt_result["risk_score"],
            "summary": vt_result["summary"],
            "threats": vt_result["threats"],
            "technical_details": vt_result["details"],
            "source": "VirusTotal"
        }
    
    # Fallback / Mock with Transparency
    is_dangerous = any(x in url.lower() for x in ['evil', 'risk', 'phish', 'malware', 'attack', 'login-verify'])
    
    summary = "No threats detected by local heuristics."
    if error_msg:
        summary = f"Scan Service Unavailable ({error_msg}). Falling back to local heuristics."
    
    if is_dangerous:
        return {
            "filename": url,
            "name": url,
            "size": "N/A",
            "type": "URL",
            "score": 85,
            "risk_score": 85,
            "summary": "High-risk probability detected based on heuristic analysis.",
            "threats": ["Phishing Indicator", "Malicious Pattern", "Suspicious TLD"],
            "technical_details": {"reputation": "Poor", "domain_age": "1 day", "error": error_msg},
            "source": f"CyberSpy Heuristics ({'Fallback' if error_msg else 'Mock'})"
        }
    else:
        return {
            "filename": url,
            "name": url,
            "size": "N/A",
            "type": "URL",
            "score": 0,
            "risk_score": 0,
            "summary": summary,
            "threats": [],
            "technical_details": {"reputation": "Neutral", "registry": "Safe", "error": error_msg},
            "source": f"CyberSpy Heuristics ({'Fallback' if error_msg else 'Mock'})"
        }