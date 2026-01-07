import { useState, useEffect } from 'react';
import {
   BarChart, Bar, PieChart, Pie, Cell,
   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
   Calendar,
   Filter,
   TrendingUp,
   AlertTriangle
} from 'lucide-react';

const Analytics = () => {
   const [attackTypeData, setAttackTypeData] = useState([
      { name: 'Brute Force', value: 450, fill: '#00f2ff' },
      { name: 'DDoS', value: 890, fill: '#ff003c' },
      { name: 'Malware', value: 320, fill: '#bc00ff' },
      { name: 'Phishing', value: 610, fill: '#fdf500' },
      { name: 'SQL Injection', value: 150, fill: '#00ff9f' },
      { name: 'XSS', value: 240, fill: '#ff7b00' },
   ]);

   const [regionalData, setRegionalData] = useState([
      { name: 'North America', attacks: 12000, blocked: 11500 },
      { name: 'Europe', attacks: 9500, blocked: 9100 },
      { name: 'Asia', attacks: 15000, blocked: 14200 },
      { name: 'South America', attacks: 4500, blocked: 4200 },
      { name: 'Africa', attacks: 2100, blocked: 2000 },
   ]);

   const [industryData] = useState([
      { name: 'Finance', value: 35 },
      { name: 'Healthcare', value: 25 },
      { name: 'Gov', value: 20 },
      { name: 'Tech', value: 15 },
      { name: 'Other', value: 5 },
   ]);

   const [scatterData, setScatterData] = useState([
      { x: 10, y: 30, z: 200, fill: '#00f2ff' },
      { x: 20, y: 50, z: 260, fill: '#00f2ff' },
      { x: 40, y: 80, z: 400, fill: '#ff003c' },
      { x: 70, y: 40, z: 150, fill: '#bc00ff' },
      { x: 50, y: 20, z: 100, fill: '#fdf500' },
   ]);

   const COLORS = ['#00f2ff', '#ff003c', '#bc00ff', '#fdf500', '#00ff9f'];

   useEffect(() => {
      const interval = setInterval(() => {
         // Update Attack Type Data
         setAttackTypeData(prev => prev.map(item => ({
            ...item,
            value: Math.max(0, item.value + Math.floor(Math.random() * 50 - 20))
         })));

         // Update Regional Data
         setRegionalData(prev => prev.map(item => {
            const newAttacks = Math.max(0, item.attacks + Math.floor(Math.random() * 200 - 50));
            return {
               ...item,
               attacks: newAttacks,
               blocked: Math.floor(newAttacks * 0.95) // Maintain correlation
            };
         }));

         // Update Scatter Data
         setScatterData(prev => prev.map(item => ({
            ...item,
            x: Math.max(0, Math.min(100, item.x + Math.floor(Math.random() * 10 - 5))),
            y: Math.max(0, Math.min(100, item.y + Math.floor(Math.random() * 10 - 5))),
            z: Math.max(50, item.z + Math.floor(Math.random() * 50 - 25))
         })));

      }, 2000);

      return () => clearInterval(interval);
   }, []);

   return (
      <div className="p-4 md:p-8 space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div>
               <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tighter uppercase">Security Analytics</h1>
               <p className="text-gray-400 text-sm md:text-base">Consolidated intelligence and trend forensics</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto scrollbar-hide">
               <button className="whitespace-nowrap flex items-center gap-2 px-4 py-2 glass-morphism rounded-xl text-sm text-gray-400 hover:text-white transition-all border border-white border-opacity-5">
                  <Calendar size={18} />
                  LAST 30 DAYS
               </button>
               <button className="whitespace-nowrap flex items-center gap-2 px-4 py-2 glass-morphism rounded-xl text-sm text-gray-400 hover:text-white transition-all border border-white border-opacity-5">
                  <Filter size={18} />
                  FILTERS
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Attack Type Breakdown */}
            <div className="glass-morphism p-8 rounded-3xl">
               <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                  <TrendingUp size={20} className="text-cyber-blue" />
                  Attack Type Distribution
               </h3>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={attackTypeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} />
                        <Tooltip
                           contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }}
                           itemStyle={{ color: '#fff' }}
                           labelStyle={{ color: '#fff' }}
                           cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20} isAnimationActive={true} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Regional Analytics */}
            <div className="glass-morphism p-8 rounded-3xl">
               <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-cyber-red" />
                  Regional Success Ratio
               </h3>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={regionalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#666" fontSize={10} />
                        <YAxis stroke="#666" fontSize={10} />
                        <Tooltip
                           contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }}
                           itemStyle={{ color: '#fff' }}
                           labelStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="attacks" stroke="#ff003c" fill="rgba(255, 0, 60, 0.1)" isAnimationActive={true} />
                        <Area type="monotone" dataKey="blocked" stroke="#00ff9f" fill="rgba(0, 255, 159, 0.1)" isAnimationActive={true} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Industry Pie */}
            <div className="glass-morphism p-8 rounded-3xl">
               <h3 className="text-lg font-bold text-white mb-8">Targeted Industries</h3>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={industryData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {industryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Pie>
                        <Tooltip
                           contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }}
                           itemStyle={{ color: '#fff' }}
                           labelStyle={{ color: '#fff' }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-4 grid grid-cols-2 gap-2">
                  {industryData.map((item, idx) => (
                     <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                        <span className="text-xs text-gray-500 uppercase font-mono">{item.name} {item.value}%</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Predictive Analytics (Scatter) */}
            <div className="glass-morphism p-8 rounded-3xl lg:col-span-2">
               <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                  Predictive Attack Cluster
               </h3>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis type="number" dataKey="x" name="Frequency" stroke="#666" fontSize={10} />
                        <YAxis type="number" dataKey="y" name="Severity" stroke="#666" fontSize={10} />
                        <ZAxis type="number" dataKey="z" range={[60, 400]} name="Volume" />
                        <Tooltip
                           cursor={{ strokeDasharray: '3 3' }}
                           contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }}
                           itemStyle={{ color: '#fff' }}
                           labelStyle={{ color: '#fff' }}
                        />
                        <Scatter name="Threat Clusters" data={scatterData} isAnimationActive={true} />
                     </ScatterChart>
                  </ResponsiveContainer>
               </div>
               <p className="text-[10px] text-gray-600 mt-6 font-mono uppercase tracking-widest text-center">
                  Neural prediction engine indicates high probability of DDoS in UTC+8 cluster.
               </p>
            </div>
         </div>
      </div>
   );
};

export default Analytics;
