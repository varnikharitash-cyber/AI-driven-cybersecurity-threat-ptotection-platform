import os
import random
import shutil
from fastapi import HTTPException

# Try importing Scapy
try:
    from scapy.all import rdpcap, TCP, UDP, DNS
    SCAPY_AVAILABLE = True
except (ImportError, OSError):
    SCAPY_AVAILABLE = False

class PCAPService:
    def analyze(self, file_obj, filename):
        if not SCAPY_AVAILABLE:
            return self._mock_pcap()

        temp_path = f"temp_{filename}_{random.randint(1000,9999)}.pcap"
        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file_obj, buffer)
            
            packets = rdpcap(temp_path)
            summary = {
                "packets": len(packets),
                "duration": f"{packets[-1].time - packets[0].time:.2f}s" if len(packets) > 1 else "0s",
                "protocols": {"TCP": 0, "UDP": 0, "DNS": 0, "HTTP": 0, "Other": 0},
                "suspicious": 0
            }
            
            timeline = []
            
            for p in packets:
                # Protocol Stats
                if p.haslayer(TCP): summary["protocols"]["TCP"] += 1
                elif p.haslayer(UDP): summary["protocols"]["UDP"] += 1
                elif p.haslayer(DNS): summary["protocols"]["DNS"] += 1
                else: summary["protocols"]["Other"] += 1
                
                # Simple Heuristics
                if p.haslayer(TCP) and p[TCP].flags == 'S': 
                    summary["suspicious"] += 1
                
                # Timeline sampling
                if len(timeline) < 100: # Limit points
                    timeline.append({"time": int(p.time), "len": len(p)})

            chart_data = [{"name": k, "value": v} for k, v in summary["protocols"].items() if v > 0]
            
            return {
                "stats": summary,
                "chart": chart_data,
                "timeline": timeline
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PCAP Error: {str(e)}")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def _mock_pcap(self):
        return {
            "stats": {
                "packets": 0,
                "duration": "N/A (Npcap Missing)",
                "protocols": {},
                "suspicious": 0
            },
            "chart": [],
            "timeline": [],
            "error": "Scapy/Npcap driver not found. Please install Npcap."
        }

pcap_service = PCAPService()
