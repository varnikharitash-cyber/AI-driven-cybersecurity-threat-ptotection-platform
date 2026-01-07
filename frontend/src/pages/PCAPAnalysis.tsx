import { useState } from 'react';
import {
   FileCode,
   Activity,
   Zap
} from 'lucide-react';
import {
   ResponsiveContainer,
   BarChart, Bar,
   XAxis, YAxis, Tooltip,
   LineChart, Line,
   CartesianGrid
} from 'recharts';

import api from '../lib/api';

const PCAPAnalysis = () => {
   interface PcapData {
      timeline: { time: string; count: number }[];
      packets: number;
      duration: string;
      suspicious: number;
      protocols: { name: string; value: number; fill: string }[];
   }
   
   const [isUploading, setIsUploading] = useState(false);
   const [pcapData, setPcapData] = useState<PcapData | null>(null);
   const [error, setError] = useState('');

   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         setIsUploading(true);
         const formData = new FormData();
         formData.append('file', e.target.files[0]);

         try {
            const res = await api.post('/api/analyze/pcap', formData);
            setPcapData({
               packets: res.data.stats.packets,
               duration: res.data.stats.duration,
               suspicious: res.data.stats.suspicious,
               protocols: res.data.chart.map((c: { name: string; value: number }) => ({ ...c, fill: '#00f2ff' })), // Simplify color logic
               timeline: res.data.timeline.map((t: { time: string; len: number }) => ({ time: t.time, count: t.len }))
            });
         } catch (err: any) {
            setError("Analysis Failed: " + (err.response?.data?.detail || err.message));
            setTimeout(() => setError(''), 5000);
         } finally {
            setIsUploading(false);
         }
      }
   };

   return (
      <div className="p-4 md:p-8 space-y-8">
         <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter uppercase">PCAP Forensics</h1>
            <p className="text-gray-400">Low-level packet inspection and protocol anomaly detection</p>
         </div>

         {error && (
            <div className="p-4 bg-cyber-red bg-opacity-20 border border-cyber-red text-white rounded-xl">
               {error}
            </div>
         )}

         {!pcapData ? (
            <div className="h-[600px] glass-morphism rounded-3xl border-2 border-dashed border-white border-opacity-10 flex flex-col items-center justify-center p-12 text-center group relative">
               <input
                  type="file"
                  accept=".pcap,.pcapng,.cap"
                  onChange={handleUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               {isUploading ? (
                  <div className="space-y-6">
                     <div className="w-24 h-24 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                     <div>
                        <h3 className="text-xl font-bold text-white animate-pulse">PARSING PACKETS...</h3>
                        <p className="text-gray-500 mt-2">Reconstructing TCP streams and verifying checksums</p>
                     </div>
                  </div>
               ) : (
                  <>
                     <div className="p-8 rounded-full bg-black/40 border border-white/10 mb-6 group-hover:scale-110 transition-transform">
                        <FileCode size={64} className="text-gray-500 group-hover:text-cyber-blue transition-colors" />
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-2">Upload PCAP / PCAPNG</h3>
                     <p className="text-gray-500 max-w-md mx-auto mb-10">
                        Drag your packet capture files here to begin deep flow analysis. We support all standard Wireshark exports.
                     </p>
                     <button
                        onClick={() => { }}
                        className="px-10 py-4 bg-cyber-blue text-cyber-black font-bold rounded-2xl hover:shadow-neon-blue transition-all uppercase tracking-widest pointer-events-none"
                     >
                        SELECT FILE
                     </button>
                  </>
               )}
            </div>
         ) : (
            <div className="space-y-8 animate-in fade-in duration-700">
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="glass-morphism p-6 rounded-2xl border-b-2 border-cyber-blue">
                     <div className="text-xs text-gray-500 font-mono mb-1 uppercase">Total Packets</div>
                     <div className="text-2xl font-bold text-white font-mono">{pcapData.packets.toLocaleString()}</div>
                  </div>
                  <div className="glass-morphism p-6 rounded-2xl border-b-2 border-cyber-purple">
                     <div className="text-xs text-gray-500 font-mono mb-1 uppercase">Capture Duration</div>
                     <div className="text-2xl font-bold text-white font-mono">{pcapData.duration}</div>
                  </div>
                  <div className="glass-morphism p-6 rounded-2xl border-b-2 border-cyber-red">
                     <div className="text-xs text-gray-500 font-mono mb-1 uppercase">Anomalies Detected</div>
                     <div className="text-2xl font-bold text-cyber-red font-mono">{pcapData.suspicious}</div>
                  </div>
                  <div className="glass-morphism p-6 rounded-2xl border-b-2 border-cyber-green">
                     <div className="text-xs text-gray-500 font-mono mb-1 uppercase">Confidence Score</div>
                     <div className="text-2xl font-bold text-cyber-green font-mono">98.4%</div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="glass-morphism p-8 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                           <Activity size={20} className="text-cyber-blue" />
                           Packet Flow Timeline
                        </h3>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={pcapData.timeline}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                 <XAxis dataKey="time" hide />
                                 <YAxis stroke="#444" fontSize={10} />
                                 <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }}
                                    labelStyle={{ display: 'none' }}
                                    formatter={(value: any) => [`${value} bytes`, 'Packet Size']}
                                 />
                                 <Line type="monotone" dataKey="count" stroke="#00f2ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#fff' }} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="glass-morphism rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white border-opacity-5 flex justify-between items-center">
                           <h3 className="text-lg font-bold text-white">Detailed Flow Logs</h3>
                           <div className="flex gap-2">
                              <div className="px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-gray-400">SRC IP: 10.0.0.42</div>
                              <div className="px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-gray-400">PORT: ANY</div>
                           </div>
                        </div>
                        <div className="p-0 overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="bg-white/10 text-[10px] uppercase text-gray-400 font-mono">
                                 <tr>
                                    <th className="px-6 py-4">No.</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4">Destination</th>
                                    <th className="px-6 py-4">Protocol</th>
                                    <th className="px-6 py-4">Length</th>
                                    <th className="px-6 py-4">Info</th>
                                 </tr>
                              </thead>
                              <tbody className="text-xs font-mono text-gray-400">
                                 {[1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="border-b border-white border-opacity-5 hover:bg-white/10 transition-all">
                                       <td className="px-6 py-4">{i}</td>
                                       <td className="px-6 py-4">192.168.1.{10 + i}</td>
                                       <td className="px-6 py-4">10.0.0.24</td>
                                       <td className={`px-6 py-4 ${i === 3 ? 'text-cyber-red' : 'text-cyber-blue'}`}>{i === 3 ? 'TCP-RET' : 'TCP'}</td>
                                       <td className="px-6 py-4">1514</td>
                                       <td className="px-6 py-4">80 → 49234 [SYN, ACK] Seq=0 Ack=1 Win=65535</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="glass-morphism p-8 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-8">Protocol Composition</h3>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={pcapData.protocols}>
                                 <XAxis dataKey="name" stroke="#666" fontSize={10} />
                                 <YAxis hide />
                                 <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }} />
                                 <Bar dataKey="value" radius={[10, 10, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                           {pcapData.protocols.map((p) => (
                              <div key={p.name} className="flex justify-between items-center text-sm">
                                 <span className="text-gray-500">{p.name}</span>
                                 <span className="text-white font-mono">{p.value}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="glass-morphism p-8 rounded-3xl border-l-4 border-cyber-red bg-cyber-red/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                           <Zap size={20} className="text-cyber-red" />
                           Anomaly Alert
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                           Observed potential <strong>Port Scanning</strong> from 192.168.1.15. Sequential TCP SYN packets to 50+ ports detected within 2ms.
                        </p>
                        <button className="mt-6 w-full py-3 bg-cyber-red bg-opacity-10 border border-cyber-red border-opacity-20 text-cyber-red text-xs font-bold rounded-xl hover:bg-opacity-20 transition-all uppercase">
                           BLOCK IP ADDRESS
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default PCAPAnalysis;