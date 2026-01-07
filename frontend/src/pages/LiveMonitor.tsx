import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   ShieldAlert,
   Activity,
   Cpu,
   Database,
   Users,
   Clock,
   CheckCircle2,
   TrendingUp,
   ArrowUpRight,
   ArrowDownRight
} from 'lucide-react';
import {
   ResponsiveContainer,
   AreaChart, Area,
   XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

import api from '../lib/api';

const LiveMonitor = () => {
   interface Metrics {
      threats: number;
      blocked: number;
      cpu: number;
      memory: number;
      latency: number;
      accuracy: number;
   }

   const [metrics, setMetrics] = useState<Metrics>({
      threats: 1420,
      blocked: 1380,
      cpu: 0,
      memory: 0,
      latency: 18,
      accuracy: 99.8
   });

   interface MonitorEvent {
      id: number;
      type: string;
      msg: string;
      time: string;
   }

   const [events, setEvents] = useState<MonitorEvent[]>([]);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const res = await api.get('/api/dashboard/stats');
            setMetrics(prev => ({
               ...prev,
               cpu: res.data.system_load.cpu,
               memory: res.data.system_load.memory,
               threats: res.data.active_attacks + prev.threats 
            }));
         } catch (error) {
            console.error("Failed to fetch stats", error);
         }
      };

      const interval = setInterval(() => {
         fetchStats();

         // Keep event simulation for visual activity
         const newEvent = {
            id: Date.now(),
            type: Math.random() > 0.8 ? 'CRITICAL' : 'INFO',
            msg: [
               'Brute force attempt blocked',
               'Database sync successful',
               'Heuristic engine updated',
               'Suspicious IP blacklisted',
               'API request rate-limited'
            ][Math.floor(Math.random() * 5)],
            time: new Date().toLocaleTimeString()
         };
         setEvents(prev => [newEvent, ...prev].slice(0, 10));
      }, 2000);
      return () => clearInterval(interval);
   }, []);

   return (
      <div className="p-4 md:p-8 space-y-8">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter uppercase">Operations Center</h1>
               <p className="text-gray-400">Live system performance and threat containment monitor</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-right">
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Uptime</div>
                  <div className="text-sm font-bold text-cyber-green">99.999%</div>
               </div>
               <div className="w-12 h-12 bg-cyber-green bg-opacity-10 rounded-xl flex items-center justify-center text-cyber-green border border-cyber-green border-opacity-20 shadow-[0_0_15px_rgba(0,255,159,0.2)]">
                  <CheckCircle2 size={24} />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-morphism p-6 rounded-2xl flex items-center gap-4">
               <div className="w-12 h-12 bg-cyber-red bg-opacity-10 rounded-xl flex items-center justify-center text-cyber-red border border-cyber-red border-opacity-10">
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <div className="text-xs text-gray-500 uppercase">Active Threats</div>
                  <div className="text-2xl font-bold text-white font-mono">{metrics.threats.toLocaleString()}</div>
               </div>
            </div>
            <div className="glass-morphism p-6 rounded-2xl flex items-center gap-4">
               <div className="w-12 h-12 bg-cyber-blue bg-opacity-10 rounded-xl flex items-center justify-center text-cyber-blue border border-cyber-blue border-opacity-10">
                  <Cpu size={24} />
               </div>
               <div>
                  <div className="text-xs text-gray-500 uppercase">CPU Load</div>
                  <div className="text-2xl font-bold text-white font-mono">{metrics.cpu}%</div>
               </div>
            </div>
            <div className="glass-morphism p-6 rounded-2xl flex items-center gap-4">
               <div className="w-12 h-12 bg-cyber-purple bg-opacity-10 rounded-xl flex items-center justify-center text-cyber-purple border border-cyber-purple border-opacity-10">
                  <Database size={24} />
               </div>
               <div>
                  <div className="text-xs text-gray-500 uppercase">Buffer Usage</div>
                  <div className="text-2xl font-bold text-white font-mono">{metrics.memory}%</div>
               </div>
            </div>
            <div className="glass-morphism p-6 rounded-2xl flex items-center gap-4">
               <div className="w-12 h-12 bg-cyber-yellow bg-opacity-10 rounded-xl flex items-center justify-center text-cyber-yellow border border-cyber-yellow border-opacity-10">
                  <Activity size={24} />
               </div>
               <div>
                  <div className="text-xs text-gray-500 uppercase">Latency</div>
                  <div className="text-2xl font-bold text-white font-mono">{metrics.latency}ms</div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <div className="glass-morphism p-8 rounded-3xl">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-cyber-blue" />
                        Inference Accuracy Trend
                     </h3>
                     <div className="flex gap-2">
                        <span className="px-2 py-1 bg-cyber-green/10 text-cyber-green text-[10px] font-bold rounded border border-cyber-green/50">+0.2% YESTERDAY</span>
                     </div>
                  </div>
                  <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                           { time: '10:00', acc: 99.1 },
                           { time: '11:00', acc: 99.4 },
                           { time: '12:00', acc: 99.2 },
                           { time: '13:00', acc: 99.7 },
                           { time: '14:00', acc: 99.8 },
                           { time: '15:00', acc: 99.9 },
                        ]}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                           <XAxis dataKey="time" stroke="#666" fontSize={10} />
                           <YAxis domain={[99, 100]} stroke="#666" fontSize={10} />
                           <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }} />
                           <Area type="monotone" dataKey="acc" stroke="#00ff9f" fill="rgba(0, 255, 159, 0.1)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="glass-morphism rounded-3xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-white border-opacity-5 flex justify-between items-center">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={20} className="text-cyber-blue" />
                        Real-Time Activity Stream
                     </h3>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyber-red rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Live Feed</span>
                     </div>
                  </div>
                  <div className="p-0">
                     <AnimatePresence initial={false}>
                        {events.map((e) => (
                           <motion.div
                              key={e.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 border-b border-white border-opacity-5 flex items-center gap-4 ${e.type === 'CRITICAL' ? 'bg-cyber-red bg-opacity-5' : ''}`}
                           >
                              <div className="text-[10px] font-mono text-gray-600 w-20">{e.time}</div>
                              <div className={`w-2 h-2 rounded-full ${e.type === 'CRITICAL' ? 'bg-cyber-red shadow-[0_0_8px_#ff003c]' : 'bg-cyber-blue'}`}></div>
                              <div className="flex-1 text-sm text-gray-300">{e.msg}</div>
                              <div className={`text-[10px] font-bold uppercase ${e.type === 'CRITICAL' ? 'text-cyber-red' : 'text-gray-500'}`}>{e.type}</div>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="glass-morphism p-8 rounded-3xl">
                  <h3 className="text-lg font-bold text-white mb-6">Historical Comparison</h3>
                  <div className="space-y-6">
                     <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs text-gray-400 uppercase">Threats (This Week)</span>
                           <div className="flex items-center gap-1 text-cyber-red">
                              <ArrowUpRight size={14} />
                              <span className="text-xs font-bold">12%</span>
                           </div>
                        </div>
                        <div className="text-xl font-bold text-white font-mono">18,421</div>
                     </div>
                     <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs text-gray-400 uppercase">False Positives</span>
                           <div className="flex items-center gap-1 text-cyber-green">
                              <ArrowDownRight size={14} />
                              <span className="text-xs font-bold">4.2%</span>
                           </div>
                        </div>
                        <div className="text-xl font-bold text-white font-mono">0.03%</div>
                     </div>
                  </div>
               </div>

               <div className="glass-morphism p-8 rounded-3xl">
                  <h3 className="text-lg font-bold text-white mb-6">System Health</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/10">
                        <div className="flex items-center gap-3">
                           <Database size={16} className="text-cyber-blue" />
                           <span className="text-sm text-gray-300">Auth Engine</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyber-green uppercase">Operational</span>
                     </div>
                     <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/10">
                        <div className="flex items-center gap-3">
                           <Activity size={16} className="text-cyber-blue" />
                           <span className="text-sm text-gray-300">Stream Parser</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyber-green uppercase">Operational</span>
                     </div>
                     <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/10">
                        <div className="flex items-center gap-3">
                           <Users size={16} className="text-cyber-blue" />
                           <span className="text-sm text-gray-300">API Gateway</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyber-green uppercase">Operational</span>
                     </div>
                     <div className="flex justify-between items-center p-3 rounded-xl bg-cyber-red/10 border border-cyber-red/40">
                        <div className="flex items-center gap-3">
                           <ShieldAlert size={16} className="text-cyber-red" />
                           <span className="text-sm text-cyber-red font-bold">Heuristics Lab</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyber-red uppercase">Maintenance</span>
                     </div>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-4 text-xs font-mono text-gray-600">
                     <Clock size={14} />
                     LAST SYNC: JUST NOW
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default LiveMonitor;
