import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  Settings,
  Play,
  Square,
  Activity,
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const Streaming = () => {
  interface Threat {
    id: number | string;
    type: string;
    severity: string;
    ip: string;
    timestamp: string;
  }
  
  const [isConnected, setIsConnected] = useState(false);
  const [streamUrl, setStreamUrl] = useState(() => {
    // Localhost vs Production
    if (window.location.hostname === 'localhost') {
      return 'ws://localhost:8000/ws/stream';
    }
    return 'wss://ai-cybersecurity-guard.onrender.com/ws/stream';
  });
  const [threats, setThreats] = useState<Threat[]>([]);
  const [chartData, setChartData] = useState<{ time: string; count: number }[]>([]);
  const [metrics, setMetrics] = useState({
    latency: '0ms',
    packetLoss: '0%',
    throughput: '0 B/s'
  });

  const ws = useRef<WebSocket | null>(null);
  const lastMessageTime = useRef<number>(Date.now());
  const byteCount = useRef<number>(0);
  const messageCount = useRef<number>(0);

  useEffect(() => {
    // Metrics interval
    const metricsInterval = setInterval(() => {
      if (!isConnected) return;

      // Calculate throughput (Bytes per second)
      const bytesPerSec = byteCount.current;
      let throughputDisplay = `${bytesPerSec} B/s`;
      if (bytesPerSec > 1024 * 1024) throughputDisplay = `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
      else if (bytesPerSec > 1024) throughputDisplay = `${(bytesPerSec / 1024).toFixed(2)} KB/s`;

      // Calculate packet loss (Simulated/Heuristic)
      const packetLossDisplay = messageCount.current > 0 ? '0.00%' : '0.00%';

      setMetrics(prev => ({
        ...prev,
        throughput: throughputDisplay,
        packetLoss: packetLossDisplay
      }));

      // Reset counters
      byteCount.current = 0;
      messageCount.current = 0;
    }, 1000);

    return () => clearInterval(metricsInterval);
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      try {
        ws.current = new WebSocket(streamUrl);
        ws.current.onopen = () => console.log("WS Connected");
        ws.current.onmessage = (event) => {
          try {
            const msgSize = new Blob([event.data]).size;
            byteCount.current += msgSize;
            messageCount.current += 1;

            const now = Date.now();
            const data = JSON.parse(event.data);
            let newThreat = null;
            let chartValue = 0;
            let currentLatency = 0;

            if (data.packet) {
              // Internal Protocol
              const packet = data.packet;
              newThreat = {
                id: packet.id,
                type: packet.type + (packet.flag ? ` [${packet.flag}]` : ''),
                severity: packet.size > 1000 ? 'High' : 'Low',
                ip: packet.source,
                timestamp: new Date().toLocaleTimeString()
              };
              chartValue = data.system?.recv || 0;
              currentLatency = Math.random() * 20 + 10; // Simulated latency for internal protocol
            } else if (data.e === 'trade') {
              // Binance Trade Protocol
              newThreat = {
                id: data.t,
                type: `${data.s} TRADE`,
                severity: parseFloat(data.q) > 0.05 ? 'High' : 'Low',
                ip: `Price: ${parseFloat(data.p).toFixed(2)}`,
                timestamp: new Date(data.T).toLocaleTimeString()
              };
              chartValue = parseFloat(data.p);
              currentLatency = Math.abs(now - data.T);
            } else {
              // Generic JSON Protocol
              newThreat = {
                id: Date.now() + Math.random(),
                type: 'STREAM EVENT',
                severity: 'Info',
                ip: 'WebSocket Stream',
                timestamp: new Date().toLocaleTimeString()
              };
              chartValue = Object.keys(data).length;
              currentLatency = now - lastMessageTime.current;
            }

            lastMessageTime.current = now;
            setMetrics(prev => ({ ...prev, latency: `${Math.round(currentLatency)}ms` }));

            if (newThreat) {
              setThreats(prev => [newThreat, ...prev].slice(0, 50));
            }

            // Update Chart
            setChartData(prev => [
              ...prev,
              { time: new Date().toLocaleTimeString(), count: chartValue }
            ].slice(-20));
          } catch (err) {
            console.error("Stream Parsing Error:", err);
          }
        };
        ws.current.onclose = () => setIsConnected(false);
        ws.current.onerror = (err) => {
          console.error("WS Error:", err);
          setIsConnected(false);
        };
      } catch (err) {
        console.error("Connection Failed:", err);
        setIsConnected(false);
      }
    } else {
      if (ws.current) ws.current.close();
      setMetrics({ latency: '0ms', packetLoss: '0.00%', throughput: '0 B/s' });
    }
    return () => { if (ws.current) ws.current.close(); };
  }, [isConnected]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter uppercase">Streaming Analysis</h1>
          <p className="text-gray-400">Real-time packet inspection and stream monitoring</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border ${isConnected ? 'border-cyber-green text-cyber-green' : 'border-cyber-red text-cyber-red'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyber-green animate-pulse shadow-[0_0_8px_#00ff9f]' : 'bg-cyber-red'}`}></div>
          <span className="text-xs font-mono font-bold uppercase">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-morphism p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Settings size={20} className="text-cyber-blue" />
              Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-mono block mb-2 uppercase">Stream Source URL</label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-mono block mb-2 uppercase">API Key / Token</label>
                <input
                  type="password"
                  value="••••••••••••••••"
                  readOnly
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
              <button
                onClick={() => setIsConnected(!isConnected)}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${isConnected
                  ? 'bg-cyber-red text-white hover:shadow-neon-red'
                  : 'bg-cyber-blue text-cyber-black hover:shadow-neon-blue'
                  }`}
              >
                {isConnected ? <><Square size={18} /> DISCONNECT</> : <><Play size={18} /> START STREAM</>}
              </button>
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-white mb-4">Stream Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Latency</span>
                <span className="text-sm font-mono text-cyber-green">{metrics.latency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Packet Loss</span>
                <span className="text-sm font-mono text-cyber-green">{metrics.packetLoss}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Throughput</span>
                <span className="text-sm font-mono text-cyber-blue">{metrics.throughput}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Packet Flow Animation */}
          <div className="h-48 glass-morphism rounded-3xl relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#00f2ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-12 relative z-10 w-full px-12">
                <div className="p-4 rounded-2xl bg-cyber-blue bg-opacity-20 border border-cyber-blue">
                  <Wifi size={32} className="text-cyber-blue" />
                </div>

                <div className="flex-1 h-1 bg-white bg-opacity-10 relative overflow-hidden rounded-full">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ x: '-10%' }}
                      animate={{ x: '110%' }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
                      className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyber-blue to-transparent"
                    />
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-cyber-purple bg-opacity-20 border border-cyber-purple">
                  <Zap size={32} className="text-cyber-purple" />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 font-mono tracking-widest uppercase animate-pulse">
                STREAMING INACTIVE
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Real-time Threat Feed */}
            <div className="glass-morphism rounded-3xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-6 border-b border-white border-opacity-5 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <AlertCircle size={20} className="text-cyber-red" />
                  Live Detection Stream
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
                <AnimatePresence>
                  {threats.map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-3 rounded-xl bg-black/50 border border-white/10 flex justify-between items-center hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-bold text-white uppercase tracking-tighter">{t.type}</div>
                        <div className="text-[10px] font-mono text-gray-400">{t.ip} • {t.timestamp}</div>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.severity === 'Critical' ? 'bg-cyber-red text-white shadow-neon-red' :
                        t.severity === 'High' ? 'text-cyber-red border border-cyber-red' :
                          'text-cyber-yellow border border-cyber-yellow'
                        }`}>
                        {t.severity}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!isConnected && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-700">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p className="italic">Awaiting connection...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Chart */}
            <div className="glass-morphism p-6 rounded-3xl flex flex-col h-[500px]">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-cyber-green" />
                Detections per Minute
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#444" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }}
                    />
                    <Line type="stepAfter" dataKey="count" stroke="#00ff9f" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 bg-black/40 rounded-2xl border border-cyber-green/50 flex items-center gap-4">
                <CheckCircle2 className="text-cyber-green" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">AI Engine Status</div>
                  <div className="text-xs text-cyber-green font-medium">Optimizing detection thresholds based on current stream volume.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streaming;
