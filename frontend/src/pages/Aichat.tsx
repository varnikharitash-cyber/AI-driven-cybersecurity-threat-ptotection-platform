import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Send,
   Mic,
   Bot,
   User,
   ShieldAlert,
   FileText,
   Globe,
   History,
   Terminal,
   Cpu,
   Sparkles
} from 'lucide-react';

import api from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIChat = () => {
   const [input, setInput] = useState('');
   interface Message {
      id: number;
      type: 'ai' | 'user';
      text: string;
      timestamp: string;
   }

   const [messages, setMessages] = useState<Message[]>([
      {
         id: 1,
         type: 'ai',
         text: "Hello! I am SIMBA (Security Intelligence Multi-Agent Bot). How can I help you secure your perimeter today?",
         timestamp: new Date().toLocaleTimeString()
      }
   ]);
   const [isTyping, setIsTyping] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [messages, isTyping]);

   const handleSend = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!input.trim()) return;

      const userMsg: Message = {
         id: Date.now(),
         type: 'user',
         text: input,
         timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      try {
         const response = await api.post('/api/chat', { message: input });
            const aiMsg: Message = {
               id: Date.now() + 1,
               type: 'ai',
               text: response.data.response,
               timestamp: new Date().toLocaleTimeString()
            };
         setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
         const aiMsg: Message = {
            id: Date.now() + 1,
            type: 'ai',
            text: "I'm having trouble connecting to my neural core. Please ensure the CyberSpy Backend is active.",
            timestamp: new Date().toLocaleTimeString()
         };
         setMessages(prev => [...prev, aiMsg]);
      } finally {
         setIsTyping(false);
      }
   };

   const suggestions = [
      "Scan current network",
      "Latest threat reports",
      "How to analyze PCAP?",
      "Check file for malware"
   ];

   const [activeTab, setActiveTab] = useState<'chat' | 'intel'>('chat');

   return (
      <div className="h-full flex flex-col gap-4 md:gap-6 overflow-hidden p-2 md:p-8">
         <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 mt-2 md:mt-0">
            <div>
               <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2 tracking-tighter uppercase flex items-center gap-2 md:gap-3">
                  <Bot className="text-cyber-blue w-6 h-6 md:w-8 md:h-8" />
                  SIMBA Intelligence
               </h1>
               <p className="text-gray-400 text-xs md:text-base">CyberSpy's Neural Security Assistant</p>
            </div>
            
            {/* Mobile View Toggles */}
            <div className="flex lg:hidden bg-black/40 p-1 rounded-xl border border-white/10 w-full md:w-auto mt-2 md:mt-0">
               <button 
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                     activeTab === 'chat' 
                        ? 'bg-cyber-blue text-cyber-black shadow-neon-blue' 
                        : 'text-gray-400 hover:text-white'
                  }`}
               >
                  Chat
               </button>
               <button 
                  onClick={() => setActiveTab('intel')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                     activeTab === 'intel' 
                        ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(188,0,255,0.3)]' 
                        : 'text-gray-400 hover:text-white'
                  }`}
               >
                  Intel
               </button>
            </div>

            <div className="flex gap-2 md:gap-4 absolute top-0 right-0 md:static md:self-auto">
               <button className="p-2 md:p-3 glass-morphism rounded-xl text-gray-400 hover:text-white transition-all"><History size={18} className="md:w-5 md:h-5" /></button>
               <button className="p-2 md:p-3 glass-morphism rounded-xl text-gray-400 hover:text-white transition-all"><Terminal size={18} className="md:w-5 md:h-5" /></button>
            </div>
         </div>

         <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
            {/* Chat Window */}
            <div className={`flex-1 glass-morphism rounded-3xl flex flex-col overflow-hidden ${
               activeTab === 'chat' ? 'flex' : 'hidden lg:flex'
            }`}>
               <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide" ref={scrollRef}>
                  <AnimatePresence initial={false}>
                     {messages.map((msg) => (
                        <motion.div
                           key={msg.id}
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                           <div className={`flex gap-4 max-w-[85%] md:max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-cyber-purple' : 'bg-cyber-blue shadow-neon-blue'
                                 }`}>
                                 {msg.type === 'user' ? <User size={16} className="md:w-5 md:h-5 text-white" /> : <Bot size={16} className="md:w-5 md:h-5 text-cyber-black" />}
                              </div>
                              <div className="space-y-1">
                                 <div className={`p-3 md:p-4 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                    ? 'bg-cyber-purple/20 border border-cyber-purple/50 text-white shadow-[0_0_15px_rgba(188,0,255,0.1)]'
                                    : 'bg-gray-900/80 border border-white/10 text-gray-100 shadow-lg backdrop-blur-md'
                                    }`}>
                                    {msg.type === 'user' ? (
                                       msg.text
                                    ) : (
                                       <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                             p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                             ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                             ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                             li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
                                             h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-cyber-blue mb-2 mt-4 border-b border-cyber-blue/30 pb-1" {...props} />,
                                             h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-cyber-blue mb-2 mt-3" {...props} />,
                                             h3: ({ node, ...props }) => <h3 className="text-md font-bold text-cyber-purple mb-1 mt-2" {...props} />,
                                             code: ({ node, inline, className, children, ...props }: any) => {
                                                return inline ? (
                                                   <code className="bg-white/10 px-1 py-0.5 rounded text-cyber-yellow font-mono text-xs" {...props}>
                                                      {children}
                                                   </code>
                                                ) : (
                                                   <div className="my-2 rounded-lg overflow-hidden border border-white/10 bg-[#050505]">
                                                      <div className="bg-white/5 px-3 py-1 text-[10px] text-gray-500 font-mono border-b border-white/5 flex justify-between">
                                                         <span>CODE_BLOCK</span>
                                                         <div className="flex gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                                            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                                            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                                         </div>
                                                      </div>
                                                      <pre className="p-3 overflow-x-auto">
                                                         <code className="text-xs font-mono text-gray-300 leading-relaxed" {...props}>
                                                            {children}
                                                         </code>
                                                      </pre>
                                                   </div>
                                                )
                                             },
                                             blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-cyber-purple pl-4 my-2 italic text-gray-400" {...props} />,
                                             table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="w-full text-left border-collapse" {...props} /></div>,
                                             th: ({ node, ...props }) => <th className="bg-white/10 p-2 text-xs font-bold text-cyber-blue border border-white/10" {...props} />,
                                             td: ({ node, ...props }) => <td className="p-2 text-xs border border-white/10 text-gray-300" {...props} />,
                                             a: ({ node, ...props }) => <a className="text-cyber-blue hover:underline cursor-pointer" {...props} />,
                                          }}
                                       >
                                          {msg.text}
                                       </ReactMarkdown>
                                    )}
                                 </div>
                                 <div className={`text-[10px] font-mono text-gray-500 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                                    {msg.timestamp}
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
                  {isTyping && (
                     <div className="flex justify-start">
                        <div className="flex gap-4 max-w-[85%] md:max-w-[80%]">
                           <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-cyber-blue shadow-neon-blue">
                              <Bot size={16} className="md:w-5 md:h-5 text-cyber-black" />
                           </div>
                           <div className="p-3 md:p-4 rounded-2xl bg-gray-900/80 border border-white/10 flex gap-1">
                              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-cyber-blue rounded-full" />
                              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-cyber-blue rounded-full" />
                              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-cyber-blue rounded-full" />
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               <div className="p-4 md:p-6 border-t border-white border-opacity-5 space-y-3 md:space-y-4">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                     {suggestions.map((s) => (
                        <button
                           key={s}
                           onClick={() => { setInput(s); }}
                           className="whitespace-nowrap px-3 py-1.5 rounded-full bg-black/40 border border-white/20 text-[10px] text-gray-300 hover:text-cyber-blue hover:border-cyber-blue transition-all uppercase font-bold flex-shrink-0"
                        >
                           {s}
                        </button>
                     ))}
                  </div>
                  <form onSubmit={handleSend} className="relative">
                     <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask SIMBA..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue/50 focus:bg-black/60 transition-all pr-24 md:pr-32 backdrop-blur-sm"
                     />
                     <div className="absolute right-2 top-1.5 bottom-1.5 md:top-2 md:bottom-2 flex gap-2">
                        <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors"><Mic size={18} className="md:w-5 md:h-5" /></button>
                        <button type="submit" className="px-4 md:px-6 rounded-xl bg-cyber-blue text-cyber-black font-bold flex items-center gap-2 hover:shadow-neon-blue transition-all">
                           <Send size={16} className="md:w-[18px] md:h-[18px]" />
                        </button>
                     </div>
                  </form>
               </div>
            </div>

            {/* Sidebar Intel */}
            <div className={`w-full lg:w-80 flex-col gap-6 ${
               activeTab === 'intel' ? 'flex' : 'hidden lg:flex'
            }`}>
               <div className="glass-morphism p-6 rounded-3xl bg-gradient-to-br from-cyber-blue/10 to-transparent">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                     <Sparkles size={20} className="text-cyber-blue" />
                     AI Capabilities
                  </h3>
                  <div className="space-y-4">
                     <div className="flex gap-4">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-cyber-blue"><ShieldAlert size={18} /></div>
                        <div>
                           <div className="text-sm font-bold text-white uppercase">Threat Explainer</div>
                           <div className="text-xs text-gray-500">Demystifying CVEs and attack vectors.</div>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-cyber-green"><FileText size={18} /></div>
                        <div>
                           <div className="text-sm font-bold text-white uppercase">Policy Audit</div>
                           <div className="text-xs text-gray-500">Analyze firewall and security rules.</div>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-cyber-purple"><Globe size={18} /></div>
                        <div>
                           <div className="text-sm font-bold text-white uppercase">OSINT Engine</div>
                           <div className="text-xs text-gray-500">Scanning surface & deep web leaks.</div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="glass-morphism p-6 rounded-3xl flex-1 relative overflow-hidden">
                  <h3 className="text-lg font-bold text-white mb-4">Neural Status</h3>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-2">
                           <span>Inference Speed</span>
                           <span>0.4ms/token</span>
                        </div>
                        <div className="h-1 bg-white bg-opacity-5 rounded-full overflow-hidden">
                           <motion.div animate={{ width: '92%' }} className="h-full bg-cyber-blue" />
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-2">
                           <span>Context Window</span>
                           <span>128k Tokens</span>
                        </div>
                        <div className="h-1 bg-white bg-opacity-5 rounded-full overflow-hidden">
                           <motion.div animate={{ width: '45%' }} className="h-full bg-cyber-purple" />
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 p-4 rounded-2xl bg-black/40 border border-white/10">
                     <div className="flex items-center gap-3 mb-2">
                        <Cpu size={16} className="text-cyber-yellow" />
                        <span className="text-xs font-bold text-white">HARDWARE ACCEL</span>
                     </div>
                     <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                        SIMBA is currently distributed across 4 H100 GPU clusters for real-time traffic inference.
                     </p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyber-blue/5 to-transparent pointer-events-none"></div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default AIChat;
