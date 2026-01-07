import psutil
import time
import random

def get_system_metrics():
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory().percent
    try:
        net = psutil.net_io_counters()
        sent = round(net.bytes_sent / 1024 / 1024, 2)
        recv = round(net.bytes_recv / 1024 / 1024, 2)
    except:
        sent, recv = 0, 0
    return {
        "cpu": cpu,
        "memory": mem,
        "sent": sent,
        "recv": recv
    }

def get_network_interfaces():
    networks = []
    try:
        stats = psutil.net_if_stats()
        addrs = psutil.net_if_addrs()
        
        for intf, stat in stats.items():
            ip_info = "No IP"
            if intf in addrs:
                for addr in addrs[intf]:
                    if addr.family == 2: # AF_INET
                        ip_info = addr.address
            
            networks.append({
                "ssid": intf,
                "signal": 100 if stat.isup else 0,
                "security": "Wired/System" if "Ethernet" in intf or "Wi-Fi" not in intf else "WPA2",
                "status": "Trusted" if stat.isup else "Inactive",
                "ip": ip_info,
                "speed": stat.speed
            })
    except:
        pass
    return networks
