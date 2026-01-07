import { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Globe as GlobeIcon, Map as MapIcon, Shield, Zap } from 'lucide-react';

const AttackMap = () => {
   interface Attack {
      startLat: number;
      startLng: number;
      endLat: number;
      endLng: number;
      color: string;
      type: string;
      ip: string;
   }

   const globeEl = useRef<any>(undefined);
   const containerRef = useRef<HTMLDivElement>(null);
   const [attacks, setAttacks] = useState<Attack[]>([]);
   const [stats, setStats] = useState({ total: 12849, rate: 42 });
   const [isMapMode, setIsMapMode] = useState(false);
   const [activeTab, setActiveTab] = useState<'map' | 'intel'>('map');
   const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

   useEffect(() => {
      const updateDimensions = () => {
         if (containerRef.current) {
            setDimensions({
               width: containerRef.current.clientWidth,
               height: containerRef.current.clientHeight
            });
         }
      };

      window.addEventListener('resize', updateDimensions);
      updateDimensions();
      
      return () => window.removeEventListener('resize', updateDimensions);
   }, []);

   useEffect(() => {
      const interval = setInterval(() => {
         const newAttack = {
            startLat: (Math.random() - 0.5) * 180,
            startLng: (Math.random() - 0.5) * 360,
            endLat: (Math.random() - 0.5) * 180,
            endLng: (Math.random() - 0.5) * 360,
            color: ['#ff003c', '#00f2ff', '#fdf500'][Math.floor(Math.random() * 3)],
            type: ['DDoS', 'Malware', 'SQLi', 'Brute Force'][Math.floor(Math.random() * 4)],
            ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
         };

         setAttacks(prev => [...prev.slice(-20), newAttack]);
         setStats(prev => ({ total: prev.total + 1, rate: Math.floor(Math.random() * 20) + 30 }));
      }, 2000);
      return () => clearInterval(interval);
   }, []);

   return (
      <div ref={containerRef} className="relative w-full h-[calc(100vh-4rem)] md:h-full bg-cyber-black overflow-hidden select-none flex items-center justify-center">
         {/* Mobile Tab Toggle */}
         <div className="absolute top-4 right-4 z-50 flex lg:hidden bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button 
               onClick={() => setActiveTab('map')}
               className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'map' 
                     ? 'bg-cyber-blue text-cyber-black shadow-neon-blue' 
                     : 'text-gray-400 hover:text-white'
               }`}
            >
               Map
            </button>
            <button 
               onClick={() => setActiveTab('intel')}
               className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'intel' 
                     ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(188,0,255,0.3)]' 
                     : 'text-gray-400 hover:text-white'
               }`}
            >
               Intel
            </button>
         </div>

         <AnimatePresence mode="wait">
            {!isMapMode ? (
               <motion.div
                  key="globe"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 z-10 transition-opacity duration-300 ${activeTab === 'intel' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
               >
                  <Globe
                     ref={globeEl}
                     width={dimensions.width}
                     height={dimensions.height}
                     globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                     backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                     arcsData={attacks}
                     arcColor={'color'}
                     arcDashLength={0.4}
                     arcDashGap={4}
                     arcDashAnimateTime={1000}
                     arcStroke={0.5}
                     pointsData={attacks.map(a => ({ lat: a.endLat, lng: a.endLng, color: a.color }))}
                     pointColor="color"
                     pointRadius={0.5}
                     pointAltitude={0}
                  />
               </motion.div>
            ) : (
               <motion.div
                  key="flatmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 z-10 bg-[#050505] flex items-center justify-center p-4 md:p-20 transition-opacity duration-300 ${activeTab === 'intel' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
               >
                  <div className="relative w-full h-full border border-white/10 rounded-3xl overflow-hidden bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-contain bg-no-repeat bg-center md:bg-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000">
                     {attacks.map((a, i) => (
                        <motion.div
                           key={i}
                           initial={{ opacity: 0, scale: 0 }}
                           animate={{ opacity: [0, 1, 0], scale: [1, 2, 3] }}
                           transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                           style={{
                              left: `${(a.endLng + 180) / 3.6}%`,
                              top: `${(-a.endLat + 90) / 1.8}%`,
                              backgroundColor: a.color
                           }}
                           className="absolute w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
                        />
                     ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <h2 className="text-2xl md:text-4xl font-bold text-white opacity-10 uppercase tracking-[0.5em] md:tracking-[1em] text-center">Flat Projection</h2>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>


         {/* Overlays */}
         <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 space-y-4 pointer-events-none md:pointer-events-auto w-[calc(100%-2rem)] md:w-auto overflow-y-auto max-h-[calc(100vh-2rem)] scrollbar-hide pb-20 md:pb-0">
            <div className="glass-morphism p-4 md:p-6 rounded-2xl border-l-4 border-cyber-blue w-full md:w-64 pointer-events-auto shadow-lg backdrop-blur-md bg-black/40">
               <div className="text-xs text-cyber-blue font-mono mb-1 tracking-widest uppercase">Global Attack Rate</div>
               <div className="text-2xl md:text-3xl font-bold text-white font-mono">{stats.rate} <span className="text-[10px] md:text-sm font-normal text-gray-500 uppercase tracking-tighter">Attacks/Sec</span></div>
               <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white bg-opacity-5 rounded-full overflow-hidden">
                     <motion.div
                        animate={{ width: `${(stats.rate / 60) * 100}%` }}
                        className="h-full bg-cyber-blue shadow-neon-blue"
                     />
                  </div>
               </div>
            </div>

            <div className={`glass-morphism p-4 rounded-2xl w-full md:w-64 space-y-3 pointer-events-auto ${activeTab === 'intel' ? 'block' : 'hidden md:block'}`}>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Crosshair size={14} className="text-cyber-red" />
                  Live Vectors
               </h3>
               <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {attacks.slice().reverse().map((a, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px] font-mono p-2 bg-black/40 border border-white/5 rounded">
                        <span className="text-cyber-red">{a.ip}</span>
                        <span className="text-white opacity-50">→</span>
                        <span className="text-cyber-blue">{a.type}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Mobile Threat Intelligence (Moved inside scrollable container) */}
            <div className={`glass-morphism p-4 rounded-2xl w-full md:w-64 space-y-3 pointer-events-auto md:hidden ${activeTab === 'intel' ? 'block' : 'hidden'}`}>
               <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                     <Shield size={14} className="text-cyber-green" />
                     Threat Intel
                  </h3>
               </div>
               <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-black/50 border border-cyber-red/50">
                     <div className="text-[10px] font-bold text-cyber-red uppercase mb-1">Active Outbreak</div>
                     <div className="text-xs text-white font-medium mb-1">LockBit 3.0 Variant detected in SEA</div>
                     <div className="text-[10px] text-gray-400 font-medium leading-tight">Affecting Financial Institutions and Healthcare.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                     <div className="text-[10px] font-bold text-cyber-yellow uppercase mb-1">Botnet Activity</div>
                     <div className="text-xs text-white font-medium mb-1">Mirai cluster surge in South America</div>
                     <div className="text-[10px] text-gray-400 font-medium leading-tight">IoT devices targeting port 23/2323.</div>
                  </div>
               </div>
               <div className="mt-4 pt-4 border-t border-white border-opacity-10">
                  <div className="flex justify-between items-end">
                     <div>
                        <div className="text-[10px] text-gray-500 uppercase font-mono">Total Blocked</div>
                        <div className="text-xl font-bold text-white font-mono">{stats.total.toLocaleString()}</div>
                     </div>
                     <div className="p-1.5 rounded-lg bg-cyber-green bg-opacity-10 text-cyber-green">
                        <Zap size={14} />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className={`absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-20 glass-morphism p-4 md:px-8 md:py-4 rounded-2xl md:rounded-full flex flex-row flex-wrap md:flex-nowrap items-center justify-between md:justify-center gap-3 md:gap-8 border-white border-opacity-10 pointer-events-auto transition-opacity ${activeTab === 'intel' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-2 md:gap-3">
               <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-cyber-red shadow-[0_0_8px_#ff003c]"></div>
               <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">High</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
               <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-cyber-yellow shadow-[0_0_8px_#fdf500]"></div>
               <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">Med</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
               <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-cyber-blue shadow-[0_0_8px_#00f2ff]"></div>
               <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">Block</span>
            </div>
         </div>

         <div className="absolute top-20 right-4 md:top-8 md:right-8 z-20 glass-morphism p-4 md:p-6 rounded-2xl w-64 md:w-80 hidden md:block pointer-events-auto">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-white">Threat Intelligence</h3>
               <Shield size={20} className="text-cyber-green" />
            </div>
            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-black/50 border border-cyber-red/50">
                  <div className="text-xs font-bold text-cyber-red uppercase mb-1">Active Outbreak</div>
                  <div className="text-sm text-white font-medium mb-1">LockBit 3.0 Variant detected in SEA</div>
                  <div className="text-[10px] text-gray-400 font-medium">Affecting Financial Institutions and Healthcare.</div>
               </div>
               <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                  <div className="text-xs font-bold text-cyber-yellow uppercase mb-1">Botnet Activity</div>
                  <div className="text-sm text-white font-medium mb-1">Mirai cluster surge in South America</div>
                  <div className="text-[10px] text-gray-400 font-medium">IoT devices targeting port 23/2323.</div>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white border-opacity-10">
               <div className="flex justify-between items-end">
                  <div>
                     <div className="text-[10px] text-gray-500 uppercase font-mono">Total Threats Blocked</div>
                     <div className="text-2xl font-bold text-white font-mono">{stats.total.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-cyber-green bg-opacity-10 text-cyber-green">
                     <Zap size={16} />
                  </div>
               </div>
            </div>
         </div>

         <div className={`absolute bottom-24 right-4 md:bottom-8 md:right-8 z-20 flex flex-col gap-2 pointer-events-auto transition-opacity ${activeTab === 'intel' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button
               onClick={() => setIsMapMode(false)}
               className={`p-3 rounded-xl transition-all ${!isMapMode ? 'bg-cyber-blue text-cyber-black shadow-neon-blue' : 'glass-morphism text-white hover:bg-white/10'}`}
            >
               <GlobeIcon size={20} />
            </button>
            <button
               onClick={() => setIsMapMode(true)}
               className={`p-3 rounded-xl transition-all ${isMapMode ? 'bg-cyber-blue text-cyber-black shadow-neon-blue' : 'glass-morphism text-white hover:bg-white/10'}`}
            >
               <MapIcon size={20} />
            </button>
         </div>
      </div>
   );
};

export default AttackMap;
