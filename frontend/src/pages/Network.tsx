import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  ShieldCheck,
  ShieldAlert,
  Link2,
  QrCode,
  Lock,
  Unlock,
  RefreshCw,
  Search,
} from 'lucide-react';

import jsQR from 'jsqr';
import api from '../lib/api';

const NetworkSecurity = () => {
  interface Network {
    ssid: string;
    security: string;
    signal: number;
    status: string;
  }

  const [isScanning, setIsScanning] = useState(false);
  const [vpnActive, setVpnActive] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [url, setUrl] = useState('');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'safe' | 'danger'>('idle');
  const [qrResult, setQrResult] = useState<{ is_qr: boolean; decoded_content: string; risk_score: number; summary: string; threats: string[] } | null>(null);
  const [isQrScanning, setIsQrScanning] = useState(false);

  // QR Camera State
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScan = async () => {
    setIsScanning(true);
    setNetworks([]);
    try {
      // 1. Try Local Scan (Real Hardware)
      try {
        console.log("Attempting local scan...");
        const localRes = await api.get('http://localhost:8000/api/network/scan', {
          timeout: 2000 
        });
        setNetworks(localRes.data);
        console.log("Local scan successful");
      } catch (localErr) {
        // 2. Fallback to Cloud/Simulated Scan
        console.warn("Local backend unavailable, falling back to cloud simulation.", localErr);
        const cloudRes = await api.get('/api/network/scan');
        setNetworks(cloudRes.data);
      }
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  const checkUrl = async () => {
    if (!url) return;
    setUrlStatus('checking');
    try {
      const res = await api.post('/api/analyze/url', { url });
      if (res.data.score > 5) {
        setUrlStatus('danger');
      } else {
        setUrlStatus('safe');
      }
    } catch (err) {
      console.error("URL check failed", err);
      setUrlStatus('idle');
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    processQrImage(e.target.files[0]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Could not access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  React.useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(blob => {
      if (blob) processQrImage(blob as File);
    }, 'image/png');
    stopCamera();
  };

  const processQrImage = async (file: File) => {
    setIsQrScanning(true);

    try {
      // 1. Convert File to Image Bitmap or use FileReader
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // 2. Scan with jsQR
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            // 3. Send DECODED string to backend
            try {
              const res = await api.post('/api/analyze/qr-text', {
                content: code.data
              });
              setQrResult(res.data);
            } catch (err) {
              console.error("Analysis error", err);
            }
          } else {
            setQrResult({
              is_qr: false,
              decoded_content: "No QR Code found in image",
              risk_score: 0,
              summary: "Could not decode any QR data locally.",
              threats: []
            });
          }
          setIsQrScanning(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error("QR Processing error", err);
      setIsQrScanning(false);
    }
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter uppercase">Network Security Scanner</h1>
        <p className="text-gray-400">Wireless landscape auditing and proactive defense</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* WiFi Discovery */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-morphism p-8 rounded-3xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 md:gap-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Wifi size={24} className="text-cyber-blue" />
                WiFi Landscape
              </h3>
              <button
                onClick={startScan}
                disabled={isScanning}
                className="w-full md:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-cyber-blue font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />
                {isScanning ? 'SCANNING...' : 'SCAN NETWORKS'}
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode='popLayout'>
                {isScanning ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-64 flex flex-col items-center justify-center relative"
                  >
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full border border-cyber-blue"
                        initial={{ width: 0, height: 0, opacity: 1 }}
                        animate={{ width: 400, height: 400, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                      />
                    ))}
                    <Wifi size={48} className="text-cyber-blue animate-pulse mb-4" />
                    <p className="text-cyber-blue font-mono tracking-widest uppercase text-sm">Auditing Spectrum...</p>
                  </motion.div>
                ) : (
                  networks.map((net, idx) => (
                    <motion.div
                      key={net.ssid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 md:p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4 md:gap-6 group hover:border-cyber-blue hover:border-opacity-30 transition-all"
                    >
                      <div className={`p-3 md:p-4 rounded-xl shrink-0 ${net.status === 'Trusted' ? 'bg-cyber-green bg-opacity-10 text-cyber-green' :
                        net.status === 'Warning' ? 'bg-cyber-yellow bg-opacity-10 text-cyber-yellow' :
                          'bg-cyber-red bg-opacity-10 text-cyber-red'
                        }`}>
                        <Wifi size={20} className="md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-bold truncate mr-2 text-sm md:text-base">{net.ssid}</span>
                          <span className="text-[10px] md:text-xs font-mono text-gray-500 uppercase whitespace-nowrap">{net.security}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1 bg-white bg-opacity-5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${net.signal}%` }}
                              className={`h-full ${net.signal > 80 ? 'bg-cyber-green' : net.signal > 50 ? 'bg-cyber-yellow' : 'bg-cyber-red'}`}
                            />
                          </div>
                          <span className="text-[10px] md:text-xs font-mono text-gray-400 w-8 text-right">{net.signal}%</span>
                        </div>
                      </div>
                      <div className={`hidden md:block px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${net.status === 'Trusted' ? 'text-cyber-green border border-cyber-green' :
                        net.status === 'Warning' ? 'text-cyber-yellow border border-cyber-yellow' :
                          'text-cyber-red border border-cyber-red'
                        }`}>
                        {net.status}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              {!isScanning && networks.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-700">
                  <Wifi size={48} className="mb-4 opacity-20" />
                  <p className="italic">Click Scan to begin network discovery</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Link Checker */}
            <div className="glass-morphism p-6 rounded-3xl">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Link2 size={20} className="text-cyber-blue" />
                Fraud Link Detection
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter URL to verify..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors pr-12"
                  />
                  <button onClick={checkUrl} className="absolute right-2 top-2 p-2 text-cyber-blue hover:text-white transition-colors">
                    <Search size={20} />
                  </button>
                </div>
                <AnimatePresence mode='wait'>
                  {urlStatus === 'checking' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-black/80 rounded-2xl border border-white/20 animate-pulse">
                      <div className="w-5 h-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-300">Analyzing domain reputation...</span>
                    </motion.div>
                  )}
                  {urlStatus === 'safe' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-cyber-green bg-opacity-10 rounded-2xl border border-cyber-green border-opacity-20">
                      <ShieldCheck className="text-cyber-green" />
                      <div>
                        <div className="text-sm font-bold text-white uppercase">Domain Safe</div>
                        <div className="text-[10px] text-cyber-green">No malicious indicators found.</div>
                      </div>
                    </motion.div>
                  )}
                  {urlStatus === 'danger' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-cyber-red bg-opacity-10 rounded-2xl border border-cyber-red border-opacity-20">
                      <ShieldAlert className="text-cyber-red" />
                      <div>
                        <div className="text-sm font-bold text-white uppercase">Phishing Detected</div>
                        <div className="text-[10px] text-cyber-red">This domain is flagged for credential theft.</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* QR Scanner */}
            <div className="glass-morphism p-6 rounded-3xl">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <QrCode size={20} className="text-cyber-purple" />
                Secure QR Audit
              </h3>

              {!qrResult ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setIsCameraMode(false); setIsCameraActive(false); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${!isCameraMode ? 'bg-cyber-purple text-black border-cyber-purple' : 'bg-transparent text-gray-400 border-white/10 hover:border-cyber-purple/50'}`}
                    >
                      UPLOAD
                    </button>
                    <button
                      onClick={() => setIsCameraMode(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${isCameraMode ? 'bg-cyber-purple text-black border-cyber-purple' : 'bg-transparent text-gray-400 border-white/10 hover:border-cyber-purple/50'}`}
                    >
                      CAMERA
                    </button>
                  </div>

                  {!isCameraMode ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-black/40 hover:bg-white/5 cursor-pointer transition-all group"
                    >
                      {isQrScanning ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-purple"></div>
                      ) : (
                        <>
                          <QrCode size={40} className="text-gray-600 group-hover:text-cyber-purple transition-colors" />
                          <p className="text-xs text-gray-500 font-mono">CLICK TO UPLOAD</p>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleQrUpload}
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-black rounded-2xl overflow-hidden relative border-2 border-white/10">
                      {!isCameraActive ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <button
                            onClick={startCamera}
                            className="px-6 py-2 bg-cyber-purple text-black font-bold rounded-xl hover:shadow-neon-purple transition-all"
                          >
                            START CAMERA
                          </button>
                        </div>
                      ) : (
                        <>
                          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                            <button
                              onClick={captureImage}
                              disabled={isQrScanning}
                              className="p-3 bg-white rounded-full hover:scale-110 transition-all border-4 border-cyber-purple shadow-lg"
                            >
                              {isQrScanning && <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyber-purple border-t-transparent"></div>}
                            </button>
                            <button
                              onClick={stopCamera}
                              className="px-4 py-2 bg-red-500/20 text-red-500 text-xs font-bold rounded-xl border border-red-500/50 hover:bg-red-500/40"
                            >
                              STOP
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-mono text-gray-400">DECODED CONTENT</div>
                    <button onClick={() => { setQrResult(null); if (isCameraMode) startCamera(); }} className="text-xs text-cyber-blue hover:underline">RESET</button>
                  </div>
                  <div className="p-2 bg-black/50 rounded border border-white/5 text-sm font-mono text-white break-all">
                    {qrResult.decoded_content || "No QR Found"}
                  </div>

                  {qrResult.is_qr && (
                    <>
                      <div className={`text-xs font-bold uppercase ${qrResult.risk_score > 50 ? 'text-cyber-red' : 'text-cyber-green'}`}>
                        {qrResult.risk_score > 50 ? 'MALICIOUS PAYLOAD DETECTED' : 'SAFE CONTENT'}
                      </div>
                      <p className="text-xs text-gray-500">{qrResult.summary}</p>
                    </>
                  )}
                </div>
              )}

              <p className="text-[10px] text-gray-600 mt-4 leading-relaxed">
                Scanning a QR code can trigger hidden actions. CyberSpy audits the payload using Gemini AI before execution.
              </p>
            </div>
          </div>
        </div>

        {/* Protection Panel */}
        <div className="space-y-8">
          <div className="glass-morphism p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock size={20} className="text-cyber-blue" />
                VPN Shield
              </h3>
              <button
                onClick={() => setVpnActive(!vpnActive)}
                className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 relative ${vpnActive ? 'bg-cyber-blue' : 'bg-gray-700'}`}
              >
                <motion.div
                  animate={{ x: vpnActive ? 28 : 0 }}
                  className="w-5 h-5 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                {vpnActive ? <Lock className="text-cyber-blue" /> : <Unlock className="text-cyber-red" />}
                <div>
                  <div className="text-sm font-bold text-white uppercase">
                    {vpnActive ? 'Tunnel Active' : 'Unprotected'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {vpnActive ? 'AES-256-GCM / WireGuard' : 'Local IP exposed'}
                  </div>
                </div>
              </div>
              {vpnActive && (
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-2">
                    <span>Connection Speed</span>
                    <span>842 Mbps</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      className="h-full bg-cyber-blue shadow-neon-blue"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkSecurity;
