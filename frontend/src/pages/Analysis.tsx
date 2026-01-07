import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  File,
  Search,
  ShieldCheck,
  ShieldAlert,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

import api from '../lib/api';

const FileAnalysis = () => {
  interface ScannedFile {
    name: string;
    size: string;
    type: string;
    score: number;
    threats: string[];
    summary?: string;
  }
  
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [isUrlScanning, setIsUrlScanning] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const startScan = async (files: FileList) => {
    setIsScanning(true);
    setProgress(10);

    const newFiles: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const res = await api.post('/api/analyze/file', formData, {
          onUploadProgress: (p) => {
            const percent = p.total ? Math.round((p.loaded * 100) / p.total) : 50;
            setProgress(percent);
          }
        });
        newFiles.push(res.data);
      } catch (err) {
        console.error("Scan error", err);
        newFiles.push({
          name: files[i].name,
          size: "Error",
          type: "Error",
          score: 0,
          threats: ["Analysis Failed"]
        });
      }
    }

    setScannedFiles(prev => [...newFiles, ...prev]);
    setIsScanning(false);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      startScan(e.dataTransfer.files);
    }
  };

  const handleUrlScan = async () => {
    if (!urlInput) return;
    setIsUrlScanning(true);
    try {
      const res = await api.post('/api/analyze/url', { url: urlInput });
      setScannedFiles(prev => [res.data, ...prev]);
      setUrlInput("");
    } catch (err) {
      console.error("URL Scan error", err);
    }
    setIsUrlScanning(false);
  };

  const pieData = [
    { name: 'Safe', value: 70 },
    { name: 'Suspicious', value: 20 },
    { name: 'Malicious', value: 10 },
  ];
  const COLORS = ['#00ff9f', '#fdf500', '#ff003c'];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter uppercase">Static File Analysis</h1>
        <p className="text-gray-400">Deep inspection of executables, documents, and scripts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-10"> {/* Increased spacing */}
          {/* URL Scan Section */}
          {/* URL Scan Section */}
          <div className="glass-morphism p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="hidden md:block p-3 bg-cyber-blue/10 rounded-xl text-cyber-blue">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder="Enter URL to scan..."
              className="flex-1 bg-transparent border border-white/10 md:border-none rounded-xl md:rounded-none p-3 md:p-0 outline-none text-white placeholder-gray-500 font-mono"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlScan()}
            />
            <button
              onClick={handleUrlScan}
              disabled={isUrlScanning}
              className="px-6 py-3 md:py-2 bg-cyber-blue text-cyber-black font-bold rounded-xl hover:shadow-neon-blue transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isUrlScanning ? 'SCANNING...' : 'SCAN URL'}
            </button>
          </div>

          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${isDragging
              ? 'border-cyber-blue bg-cyber-blue/20 scale-[1.02]'
              : 'border-cyber-blue/30 bg-cyber-blue/5'
              }`}
          >
            {isScanning ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white text-opacity-10"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={377}
                      animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
                      className="text-cyber-blue"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-cyber-blue">
                    {progress}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium animate-pulse">ANALYZING CODE STRUCTURE...</div>
                  <div className="text-gray-500 text-sm mt-1">Cross-referencing global threat databases</div>
                </div>
              </div>
            ) : (
              <>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer group w-full h-full"
                >
                  <div className={`p-6 rounded-full bg-white bg-opacity-5 mb-4 group-hover:bg-cyber-blue/20 transition-all duration-300 ${isDragging ? 'animate-bounce' : ''}`}>
                    <Upload size={48} className={isDragging ? 'text-cyber-blue' : 'text-gray-500 group-hover:text-cyber-blue transition-colors'} />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-medium text-white group-hover:text-cyber-blue transition-colors">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-gray-500 mt-2">Supports .EXE, .PDF, .ZIP, .JS, .PY and more</p>
                  </div>
                </label>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => e.target.files && startScan(e.target.files)}
                />
              </>
            )}
          </motion.div>

          {/* Results List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent Analysis Results</h3>
            <AnimatePresence>
              {scannedFiles.map((file, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-morphism p-6 rounded-2xl flex items-center gap-6"
                >
                  <div className={`p-4 rounded-xl ${file.score > 50 ? 'bg-cyber-red bg-opacity-10 text-cyber-red' : 'bg-cyber-green bg-opacity-10 text-cyber-green'}`}>
                    {file.score > 50 ? <ShieldAlert size={28} /> : <ShieldCheck size={28} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium text-lg">{file.name}</h4>
                        <p className="text-gray-500 text-sm font-mono uppercase">{file.type} | {file.size} | {file.score > 50 ? 'MALICIOUS' : 'CLEAN'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Threat Score</div>
                        <div className={`text-2xl font-bold font-mono ${file.score > 50 ? 'text-cyber-red' : 'text-cyber-green'}`}>{file.score}/100</div>
                      </div>
                    </div>

                    {/* AI Summary Section */}
                    {file.summary && (
                      <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 text-sm text-gray-300 italic">
                        "{file.summary}"
                      </div>
                    )}

                    {file.threats && file.threats.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {file.threats.map((t: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-[10px] rounded font-mono uppercase">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {scannedFiles.length === 0 && (
              <div className="text-center p-12 glass-morphism rounded-2xl border-dashed">
                <File className="mx-auto text-gray-700 mb-4" size={48} />
                <p className="text-gray-500 italic">No files analyzed in this session</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          <div className="glass-morphism p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-cyber-blue" />
              Risk Assessment
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-gray-400 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-3xl border-l-4 border-cyber-blue">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-cyber-blue" />
              Recommendations
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full mt-2"></div>
                <p className="text-sm text-gray-400">Always scan .exe files before execution</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full mt-2"></div>
                <p className="text-sm text-gray-400">High entropy detected in zip files often suggests obfuscated malware</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full mt-2"></div>
                <p className="text-sm text-gray-400">Quarantine files with threat scores above 75</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileAnalysis;
