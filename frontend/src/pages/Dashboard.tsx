import { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Globe, 
  Lock, 
  TrendingUp, 
  Brain, 
  Wifi, 
  Activity, 
  Download, 
  Database, 
  X, 

} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 

  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 

  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

const Dashboard = () => {
    // State copied from provided code
  const [activeTab, setActiveTab] = useState('monitor');
  const [threats, setThreats] = useState<any[]>([]);
  const [isSecured, setIsSecured] = useState(false);
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [predictionData, setPredictionData] = useState<any[]>([]);

  const [showApiModal, setShowApiModal] = useState(false);


  const [filterCountry, setFilterCountry] = useState('all');
  const [filterAttackType, setFilterAttackType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [nearbyNetworks, setNearbyNetworks] = useState<any[]>([]);
  const [scanningNetworks, setScanningNetworks] = useState(false);
  const [connectedNetwork, setConnectedNetwork] = useState<any>(null);

  const attackTypes = [
    'DDoS', 'Malware', 'Phishing', 'SQL Injection', 'Ransomware', 'Zero-Day', 
    'Brute Force', 'XSS', 'Man-in-the-Middle', 'Trojan', 'Worm', 'Spyware'
  ];
  
  const countries = [
    { name: 'USA', lat: 37.0902, lng: -95.7129, code: 'US' },
    { name: 'China', lat: 35.8617, lng: 104.1954, code: 'CN' },
    { name: 'Russia', lat: 61.5240, lng: 105.3188, code: 'RU' },
    { name: 'Germany', lat: 51.1657, lng: 10.4515, code: 'DE' },
    { name: 'Brazil', lat: -14.2350, lng: -51.9253, code: 'BR' },
    { name: 'India', lat: 20.5937, lng: 78.9629, code: 'IN' },
    { name: 'UK', lat: 55.3781, lng: -3.4360, code: 'GB' },
    { name: 'France', lat: 46.2276, lng: 2.2137, code: 'FR' },
    { name: 'Japan', lat: 36.2048, lng: 138.2529, code: 'JP' },
    { name: 'Australia', lat: -25.2744, lng: 133.7751, code: 'AU' }
  ];

  const generateIP = () => {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  };

  const generateThreat = () => {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const severity = ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)];
    return {
      id: Date.now() + Math.random(),
      country: country.name,
      lat: country.lat,
      lng: country.lng,
      attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      ip: generateIP(),
      severity,
      timestamp: new Date().toLocaleTimeString(),
      blocked: isSecured
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newThreat = generateThreat();
      setThreats(prev => [newThreat, ...prev]); // Allow n number of attacks

      
      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMonitoringData(prev => {
        const newData = [...prev, {
          time,
          attacks: Math.floor(Math.random() * 50) + 20,
          blocked: Math.floor(Math.random() * 40) + 15,
          threats: Math.floor(Math.random() * 30) + 10
        }];
        return newData.slice(-20);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSecured]);

  useEffect(() => {
    const aiInterval = setInterval(() => {
      const prediction = {
        id: Date.now(),
        type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        probability: (Math.random() * 30 + 70).toFixed(1),
        targetRegion: countries[Math.floor(Math.random() * countries.length)].name,
        predictedTime: `${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 48) + 12}h`,
        confidence: (Math.random() * 15 + 85).toFixed(1)
      };
      setAiPredictions(prev => [prediction, ...prev.slice(0, 9)]);
      
      setPredictionData(prev => {
        const newPrediction = {
          attackType: prediction.type,
          probability: parseFloat(prediction.probability),
          confidence: parseFloat(prediction.confidence),
          risk: Math.floor(Math.random() * 100)
        };
        const updated = [...prev, newPrediction];
        return updated.slice(-6);
      });
    }, 5000);

    return () => clearInterval(aiInterval);
  }, []);

  const filteredThreats = threats.filter(threat => {
    if (filterCountry !== 'all' && threat.country !== filterCountry) return false;
    if (filterAttackType !== 'all' && threat.attackType !== filterAttackType) return false;
    if (filterSeverity !== 'all' && threat.severity !== filterSeverity) return false;
    return true;
  });

  interface ThreatStats {
    totalAttacks: number;
    blocked: number;
    critical: number;
    byCountry: Record<string, number>;
    byAttackType: Record<string, number>;
    bySeverity: Record<string, number>;
  }

  const filteredStats: ThreatStats = {
    totalAttacks: filteredThreats.length,
    blocked: filteredThreats.filter(t => t.blocked).length,
    critical: filteredThreats.filter(t => t.severity === 'Critical').length,
    byCountry: {},
    byAttackType: {},
    bySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 }
  };

  filteredThreats.forEach(threat => {
    filteredStats.byCountry[threat.country] = (filteredStats.byCountry[threat.country] || 0) + 1;
    filteredStats.byAttackType[threat.attackType] = (filteredStats.byAttackType[threat.attackType] || 0) + 1;
    filteredStats.bySeverity[threat.severity]++;
  });

  const countryChartData = Object.entries(filteredStats.byCountry)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const scanNearbyNetworks = async () => {
    setScanningNetworks(true);
    setShowNetworkDropdown(true);

    try {
        console.log("Attempting local scan...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); 
        
        const { data: { session } } = await supabase.auth.getSession();
        const headers: any = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        console.log("Starting network scan fetch...");
        const response = await fetch('http://localhost:8000/api/network/scan', { 
          signal: controller.signal,
          headers: headers 
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                setNearbyNetworks(data);
                console.log("Local scan successful", data.length, "networks found");
            } else {
                 console.warn("Backend returned empty or invalid data format:", data);
                 throw new Error("Empty or invalid data from backend");
            }
        } else {
            console.error("Backend scan failed with status:", response.status, response.statusText);
            throw new Error(`Backend error: ${response.status}`);
        }
    } catch (error) {
        console.error("Scan failed with error:", error);
         // Fallback to Mock Data
         setTimeout(() => {
          const mockNetworks = [
            { ssid: 'Home_WiFi_5G', signal: 95, security: 'WPA2', distance: 5, channel: 36, speed: '867 Mbps' },
            { ssid: 'Home_WiFi_2.4G', signal: 90, security: 'WPA2', distance: 10, channel: 1, speed: '600 Mbps' },
            { ssid: 'Office_Network', signal: 88, security: 'WPA3', distance: 12, channel: 1, speed: '600 Mbps' },
            { ssid: 'CoffeeShop_Guest', signal: 68, security: 'Open', distance: 35, channel: 11, speed: '150 Mbps' },
            { ssid: 'Public_Library', signal: 72, security: 'Open', distance: 45, channel: 6, speed: '300 Mbps' },
            { ssid: 'Secure_Corp_5G', signal: 85, security: 'WPA3-Ent', distance: 15, channel: 48, speed: '1200 Mbps' },
            { ssid: 'Neighbor_WiFi', signal: 45, security: 'WPA2', distance: 25, channel: 11, speed: '144 Mbps' },
            { ssid: 'City_Free_WiFi', signal: 60, security: 'Open', distance: 60, channel: 1, speed: '54 Mbps' },
            { ssid: 'Unknown_Device', signal: 30, security: 'WEP', distance: 80, channel: 9, speed: '11 Mbps' },
          ];
          setNearbyNetworks(mockNetworks);
        }, 1000); // Small delay to simulate "work" if failing over
    } finally {
        // Ensure scanning state is turned off after work is done
        setTimeout(() => setScanningNetworks(false), 1000);
    }
  };

  const connectToNetwork = (network: any) => {
    setConnectedNetwork(network);
    setShowNetworkDropdown(false);
    alert(`Connected to ${network.ssid}`);
  };
  
  const disconnectNetwork = () => {
    setConnectedNetwork(null);
    alert("Disconnected");
  }


  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      Low: 'bg-cyber-blue shadow-[0_0_10px_#00f2ff]',
      Medium: 'bg-cyber-yellow shadow-[0_0_10px_#fdf500]',
      High: 'bg-[#ff7b00] shadow-[0_0_10px_#ff7b00]',
      Critical: 'bg-cyber-red shadow-[0_0_10px_#ff003c]'
    };
    return colors[severity] || 'bg-gray-500';
  };

  // Helper functions for export
  const downloadJSON = () => {
    const dataStr = JSON.stringify(threats, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "threat_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (objArray: any[]) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const header = Object.keys(array[0]).join(',') + '\r\n';
    str += header;

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line !== '') line += ',';
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
  };

  const downloadCSV = () => {
      if (threats.length === 0) return alert("No data to export");
      const csvData = convertToCSV(threats);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "threat_data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const downloadExcel = () => {
      if (threats.length === 0) return alert("No data to export");
      const csvData = convertToCSV(threats);
      // Using CSV served as XLS to open in Excel easily without heavy libraries
      const blob = new Blob([csvData], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "threat_data.xls");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const [dbConnection, setDbConnection] = useState({
    type: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    connected: false
  });

  const connectDatabase = (type: string) => {
    setDbConnection(prev => ({ ...prev, type }));
    setConnectionStatus(null);
  };

  const handleDatabaseConnect = (e: any) => {
    e.preventDefault();
    setConnectionStatus(`Connecting to ${dbConnection.type}...`);
    setTimeout(() => {
      setConnectionStatus(`✓ Successfully connected to ${dbConnection.type}!`);
      setDbConnection(prev => ({ ...prev, connected: true }));
      setTimeout(() => {
          setShowConnectModal(false);
          setDbConnection({ type: '', host: '', port: '', database: '', username: '', password: '', connected: false });
          setConnectionStatus(null);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen text-gray-100">
        
       {/* Header from Original Design */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter uppercase">Operations Dashboard</h1>
          <p className="text-gray-400">Real-time global threat intelligence monitor</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-cyber-blue font-mono mb-1">SYSTEM TIME</div>
          <div className="text-xl font-mono text-white">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap gap-4 glass-morphism p-4 rounded-2xl relative z-40">
            <div className="relative">
              <button
                onClick={scanNearbyNetworks}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-cyber-green/10 text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/20 transition-all shadow-lg shadow-cyber-green/10"
              >
                <Wifi className="w-5 h-5" />
                {connectedNetwork ? `Connected: ${connectedNetwork.ssid}` : 'Connect Network'}
              </button>
              {showNetworkDropdown && (
                <div className="absolute top-14 left-0 w-full md:w-[400px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                   <div className="p-4 border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold flex items-center gap-2 text-white">
                        <Wifi className="w-5 h-5 text-cyber-green" />
                        Nearby Networks
                      </h4>
                      <button onClick={() => setShowNetworkDropdown(false)} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    {scanningNetworks && <div className="mt-2 text-xs text-cyber-blue animate-pulse">Scanning...</div>}
                  </div>
                   <div className="p-2">
                    {nearbyNetworks.map((network, index) => (
                      <div key={index} className="p-3 hover:bg-white/5 rounded-lg border-b border-white/5 last:border-0">
                         <div className="flex justify-between items-center mb-1">
                             <div className="font-bold text-white">{network.ssid}</div>
                             <div className="text-xs text-cyber-green">{network.signal}%</div>
                         </div>
                         <div className="flex gap-2 mt-2">
                             <button onClick={() => connectToNetwork(network)} className="flex-1 py-1 bg-cyber-blue/20 text-cyber-blue text-xs rounded hover:bg-cyber-blue/30">Connect</button>
                             {connectedNetwork?.ssid === network.ssid && <button onClick={disconnectNetwork} className="flex-1 py-1 bg-red-500/20 text-red-500 text-xs rounded hover:bg-red-500/30">Forget</button>}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSecured(!isSecured)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${
                isSecured 
                  ? 'bg-cyber-green/20 text-cyber-green border-cyber-green/50 shadow-[0_0_15px_rgba(0,255,159,0.3)]' 
                  : 'bg-cyber-red/20 text-cyber-red border-cyber-red/50 shadow-[0_0_15px_rgba(255,0,60,0.3)]'
              }`}
            >
              {isSecured ? <Lock className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              {isSecured ? 'Network Secured' : 'Secure Network'}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 hover:bg-cyber-blue/20 transition-all"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/30 hover:bg-cyber-purple/20 transition-all"
            >
              <Database className="w-5 h-5" />
              Connect DB
            </button>
      </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Attacks', value: filteredStats.totalAttacks, icon: Activity, color: 'text-cyber-blue' },
            { label: 'Blocked', value: filteredStats.blocked, icon: Shield, color: 'text-cyber-green' },
            { label: 'Critical Threats', value: filteredStats.critical, icon: AlertTriangle, color: 'text-cyber-red' },
            { label: 'Success Rate', value: `${filteredStats.totalAttacks > 0 ? Math.round((filteredStats.blocked / filteredStats.totalAttacks) * 100) : 0}%`, icon: TrendingUp, color: 'text-cyber-cyan' },
          ].map((stat, i) => (
             <div key={i} className="glass-morphism p-6 rounded-2xl border-l-4 border-l-transparent hover:border-l-cyber-blue transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                </div>
             </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'monitor'
                ? 'bg-cyber-blue text-cyber-black shadow-neon-blue'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-5 h-5" />
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'ai'
                ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(188,0,255,0.5)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain className="w-5 h-5" />
            AI Predictions
          </button>
        </div>


        {/* Content Area */}
        {activeTab === 'monitor' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filters */}
            <div className="glass-morphism p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="text-cyber-blue"/> Advanced Threat Filters</h3>
                    <button onClick={() => setShowFilters(!showFilters)} className="text-sm text-cyber-blue hover:underline">{showFilters ? 'Hide' : 'Show'} Filters</button>
                </div>
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg p-2 text-white">
                            <option value="all">All Countries</option>
                            {countries.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                        </select>
                        <select value={filterAttackType} onChange={e => setFilterAttackType(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg p-2 text-white">
                             <option value="all">All Types</option>
                             {attackTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                         <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg p-2 text-white">
                             <option value="all">All Severities</option>
                             {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => { setFilterCountry('all'); setFilterAttackType('all'); setFilterSeverity('all'); }} className="bg-red-500/20 text-red-400 rounded-lg border border-red-500/50 hover:bg-red-500/30">Clear</button>
                    </div>
                )}
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-morphism p-6 rounded-3xl">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Globe className="text-cyber-blue"/> Top Attack Origins</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countryChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis type="number" stroke="#666" fontSize={12}/>
                        <YAxis dataKey="country" type="category" stroke="#fff" fontSize={12} width={80}/>
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }} itemStyle={{ color: '#00f2ff' }} />
                        <Bar dataKey="count" fill="#00f2ff" radius={[0, 4, 4, 0]} barSize={20}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-morphism p-6 rounded-3xl">
                   <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Activity className="text-cyber-red"/> Real-Time Monitor</h3>
                   <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monitoringData}>
                        <defs>
                          <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff003c" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ff003c" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="time" stroke="#666" fontSize={12}/>
                        <YAxis stroke="#666" fontSize={12}/>
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="attacks" stroke="#ff003c" fillOpacity={1} fill="url(#colorAttacks)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            </div>

             {/* Live Threat Feed */}
            <div className="glass-morphism p-6 rounded-3xl">
               <h3 className="text-lg font-semibold text-white mb-6">Live Threat Feed</h3>
               <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  {filteredThreats.map(threat => (
                    <div key={threat.id} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4">
                             <div className={`w-3 h-3 rounded-full ${getSeverityColor(threat.severity)}`}></div>
                             <div>
                                <div className="font-bold text-white text-sm">{threat.attackType} <span className="text-gray-500 font-normal">from</span> {threat.country}</div>
                                <div className="text-xs text-gray-400 font-mono">{threat.ip}</div>
                             </div>
                        </div>
                        <div className="text-right">
                             <span className={`text-[10px] font-bold px-2 py-1 rounded border ${threat.blocked ? 'text-cyber-green border-cyber-green/30 bg-cyber-green/10' : 'text-cyber-red border-cyber-red/30 bg-cyber-red/10'}`}>
                                {threat.blocked ? 'BLOCKED' : 'ACTIVE'}
                             </span>
                             <div className="text-xs text-gray-500 mt-1">{threat.timestamp}</div>
                        </div>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        )}

        {/* AI Predictions Tab */}
        {activeTab === 'ai' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="glass-morphism p-6 rounded-3xl">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Brain className="text-cyber-purple"/> Attack Probability</h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={predictionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="attackType" stroke="#666" fontSize={10} angle={-45} textAnchor="end" height={60} />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333' }} />
                            <Bar dataKey="probability" fill="#bc00ff" barSize={30} radius={[4, 4, 0, 0]} />
                         </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="glass-morphism p-6 rounded-3xl">
                       <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><TrendingUp className="text-cyber-cyan"/> Risk Assessment</h3>
                       <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="80%" data={predictionData}>
                             <PolarGrid stroke="#333" />
                             <PolarAngleAxis dataKey="attackType" tick={{ fill: '#999', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666"/>
                             <Radar name="Risk" dataKey="risk" stroke="#00f2ff" fill="#00f2ff" fillOpacity={0.3} />
                             <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333' }}/>
                           </RadarChart>
                        </ResponsiveContainer>
                       </div>
                   </div>
               </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiPredictions.map(pred => (
                        <div key={pred.id} className="glass-morphism p-6 rounded-2xl border border-cyber-purple/20 bg-gradient-to-br from-cyber-purple/5 to-transparent relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 bg-cyber-purple/20 rounded-bl-xl text-cyber-purple text-xs font-bold">{pred.probability}% Prob</div>
                             <h4 className="text-white font-bold text-lg mb-1">{pred.type}</h4>
                             <p className="text-gray-400 text-sm mb-4">Target: {pred.targetRegion}</p>
                             <div className="space-y-2 text-xs">
                                 <div className="flex justify-between">
                                     <span className="text-gray-500">Confidence</span>
                                     <span className="text-cyber-green">{pred.confidence}%</span>
                                 </div>
                                 <div className="w-full bg-black/50 rounded-full h-1">
                                     <div className="h-full bg-cyber-purple rounded-full" style={{ width: `${pred.probability}%` }}></div>
                                 </div>
                                 <div className="flex justify-between pt-1">
                                     <span className="text-gray-500">Est. Time</span>
                                     <span className="text-white font-mono">{pred.predictedTime}</span>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
           </div>
        )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowExportModal(false)}>
           <div className="glass-morphism p-8 rounded-3xl max-w-md w-full border border-cyber-blue/30 shadow-neon-blue" onClick={e => e.stopPropagation()}>
               <div className="flex items-center gap-4 mb-6 text-cyber-blue">
                   <Download className="w-8 h-8"/>
                   <h2 className="text-2xl font-bold uppercase tracking-tight">Export Data</h2>
               </div>
               <div className="space-y-3">
                   <button onClick={downloadCSV} className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all">
                       <span className="font-bold text-white">CSV Format</span>
                       <span className="text-cyber-blue group-hover:translate-x-1 transition-transform">→</span>
                   </button>
                   <button onClick={downloadExcel} className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all">
                       <span className="font-bold text-white">Excel Format</span>
                       <span className="text-cyber-blue group-hover:translate-x-1 transition-transform">→</span>
                   </button>
                    <button onClick={downloadJSON} className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all">
                       <span className="font-bold text-white">JSON Format</span>
                       <span className="text-cyber-blue group-hover:translate-x-1 transition-transform">→</span>
                   </button>
               </div>
               <button onClick={() => setShowExportModal(false)} className="mt-6 w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20">Cancel</button>
           </div>
        </div>
      )}
      
       {/* DB Connect Modal */}
       {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="glass-morphism p-8 rounded-3xl max-w-lg w-full border border-cyber-purple/30 shadow-[0_0_20px_rgba(188,0,255,0.2)] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4 text-cyber-purple">
                     <Database className="w-8 h-8"/>
                     <h2 className="text-2xl font-bold uppercase tracking-tight">Connect Database</h2>
                 </div>
                 <button onClick={() => {
                     setShowConnectModal(false);
                     setDbConnection({ type: '', host: '', port: '', database: '', username: '', password: '', connected: false });
                     setConnectionStatus(null);
                 }} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>
               </div>
               
               {connectionStatus ? (
                   <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                       <div className="text-cyber-green font-bold animate-pulse">{connectionStatus}</div>
                   </div>
               ) : !dbConnection.type ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                       {['MySQL', 'PostgreSQL', 'MongoDB Atlas', 'Amazon AWS', 'Google Cloud', 'Microsoft Azure'].map(db => (
                           <button key={db} onClick={() => connectDatabase(db)} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left hover:border-cyber-purple/50 transition-all group">
                               <div className="font-bold text-white mb-1 group-hover:text-cyber-purple transition-colors">{db}</div>
                               <div className="text-xs text-gray-500">Connect securely</div>
                           </button>
                       ))}
                   </div>
               ) : (
                   <form onSubmit={handleDatabaseConnect} className="space-y-4">
                       <div className="space-y-4">
                           <input placeholder="Host Address" className="w-full p-3 bg-black/50 border border-white/10 rounded-xl focus:border-cyber-purple text-white outline-none" required />
                           <div className="grid grid-cols-2 gap-4">
                               <input placeholder="Port" className="w-full p-3 bg-black/50 border border-white/10 rounded-xl focus:border-cyber-purple text-white outline-none" required />
                               <input placeholder="Database Name" className="w-full p-3 bg-black/50 border border-white/10 rounded-xl focus:border-cyber-purple text-white outline-none" required />
                           </div>
                           <input placeholder="Username" className="w-full p-3 bg-black/50 border border-white/10 rounded-xl focus:border-cyber-purple text-white outline-none" required />
                           <input type="password" placeholder="Password" className="w-full p-3 bg-black/50 border border-white/10 rounded-xl focus:border-cyber-purple text-white outline-none" required />
                       </div>
                       <div className="flex gap-4 mt-6">
                           <button type="button" onClick={() => setDbConnection({ type: '', host: '', port: '', database: '', username: '', password: '', connected: false })} className="flex-1 py-3 bg-white/5 rounded-xl hover:bg-white/10 text-white">Back</button>
                           <button type="submit" className="flex-1 py-3 bg-cyber-purple text-white rounded-xl shadow-lg shadow-cyber-purple/20 hover:bg-opacity-90">Connect</button>
                       </div>
                   </form>
               )}
           </div>
        </div>
      )}

      {/* API Configuration Modal (Placeholder for structure) */}
      {showApiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               {/* Simplified API Modal */}
               <div className="glass-morphism p-8 rounded-3xl max-w-lg w-full">
                   <h2 className="text-xl font-bold text-white mb-4">API Settings</h2>
                   <button onClick={() => setShowApiModal(false)} className="w-full py-3 bg-white/10 rounded-xl text-white">Close</button>
               </div>
          </div>
      )}

    </div>
  );
};

export default Dashboard;
