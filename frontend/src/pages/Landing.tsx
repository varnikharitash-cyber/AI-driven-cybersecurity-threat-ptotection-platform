import { Link } from 'react-router-dom';
import { Shield, Activity, Globe, Cpu, ChevronRight, Mail, Phone, MapPin, Github, Twitter, Linkedin, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Landing = () => {
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      message: ''
   });

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      try {
         const response = await fetch("https://formspree.io/f/xandzlvw", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
         });

         if (response.ok) {
            setShowSuccessModal(true);
            setFormData({ firstName: '', lastName: '', email: '', message: '' });
         } else {
            console.error("Form submission failed");
         }
      } catch (error) {
         console.error("Error submitting form:", error);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden font-sans">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-black/80 to-cyber-black pointer-events-none"></div>

         <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 border-b border-white/10 glass-morphism backdrop-blur-sm">
            <div className="max-w-[90%] mx-auto flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="bg-cyber-blue/20 p-1.5 md:p-2.5 rounded-xl">
                     <Shield className="w-6 h-6 md:w-8 md:h-8 text-cyber-blue" />
                  </div>
                  <span className="text-xl md:text-3xl font-extrabold tracking-tight">CYBERSPY</span>
               </div>
               
               {/* Desktop Menu */}
               <div className="hidden md:flex items-center gap-6">
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors font-semibold text-lg hover:bg-white/5 px-4 py-2 rounded-lg">Log In</Link>
                  <Link to="/signup" className="bg-cyber-blue text-cyber-black px-8 py-3 rounded-xl font-bold text-lg hover:shadow-neon-blue transition-all flex items-center gap-2">
                     Get Started <ChevronRight size={18} />
                  </Link>
               </div>

               {/* Mobile Menu Toggle */}
               <button 
                  className="md:hidden p-1 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>

            {mobileMenuOpen && (
               <div className="absolute top-full left-0 w-full bg-cyber-black/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-3 md:hidden shadow-2xl animate-in slide-in-from-top-5">
                  <Link to="/login" className="w-full text-center py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">Log In</Link>
                  <Link to="/signup" className="w-full text-center py-3 text-sm font-bold bg-cyber-blue text-cyber-black rounded-xl hover:shadow-neon-blue transition-all flex items-center justify-center gap-2">
                     Get Started <ChevronRight size={16} />
                  </Link>
               </div>
            )}
         </nav>

         <main className="relative z-10 pt-32 pb-0">
            <div className="w-full max-w-full mx-auto px-6 mb-32">
               <div className="text-center">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-xs font-mono mb-8 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-cyber-blue"></div>
                      SYSTEM SECURE // V.2.1.0 ACTIVE
                   </div>
                   
                   <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Next-Gen AI</span>
                      <br />
                      <span className="text-cyber-blue drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]">Threat prediction</span>
                   </h1>
                   
                   <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                      Autonomous cybersecurity platform powered by advanced neural networks. Detect, analyze, and neutralize zero-day threats in real-time.
                   </p>

                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                      <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-cyber-blue text-cyber-black rounded-xl font-bold text-lg hover:shadow-neon-blue transition-all">
                         Deploy Platform
                      </Link>
                      <Link to="/login" className="w-full sm:w-auto px-8 py-4 glass-morphism border border-white/10 rounded-xl font-bold text-lg hover:bg-white/5 transition-all">
                         Live Demo
                      </Link>
                   </div>
               </div>

               {/* Stats / Features Grid */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-32">
                  <div className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-cyber-blue/30 transition-all group">
                     <div className="w-12 h-12 bg-cyber-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Activity className="text-cyber-blue" />
                     </div>
                     <h3 className="text-xl font-bold mb-3">Real-time Analysis</h3>
                     <p className="text-gray-400 text-sm">Continuous monitoring of network traffic with sub-millisecond threat detection latency.</p>
                  </div>
                  <div className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-cyber-purple/30 transition-all group">
                     <div className="w-12 h-12 bg-cyber-purple/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Cpu className="text-cyber-purple" />
                     </div>
                     <h3 className="text-xl font-bold mb-3">AI Intelligence</h3>
                     <p className="text-gray-400 text-sm">Self-learning models that adapt to new attack vectors and polymorphic malware.</p>
                  </div>
                  <div className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-cyber-green/30 transition-all group">
                     <div className="w-12 h-12 bg-cyber-green/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Globe className="text-cyber-green" />
                     </div>
                     <h3 className="text-xl font-bold mb-3">Global Threat Map</h3>
                     <p className="text-gray-400 text-sm">Visualize attack origins and targets on a live 3D interactive globe projection.</p>
                  </div>
               </div>

               {/* Contact Us Section */}
               <div className="max-w-7xl mx-auto mb-20">
                  <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
                     Get in <span className="text-cyber-blue">Touch</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 glass-morphism p-8 md:p-12 rounded-3xl border border-white/5">
                     {/* Contact Info */}
                     <div className="space-y-8">
                        <div>
                           <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
                           <p className="text-gray-400">Ready to secure your infrastructure? Our team of security experts is available 24/7 to assist you.</p>
                        </div>
                        
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-cyber-blue/10 flex items-center justify-center text-cyber-blue">
                                 <Mail size={24} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-400 font-bold uppercase">Email</p>
                                 <p className="text-white">security@cyberspy.io</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-cyber-purple/10 flex items-center justify-center text-cyber-purple">
                                 <Phone size={24} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-400 font-bold uppercase">Phone</p>
                                 <p className="text-white">+91 9876543210</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-cyber-green/10 flex items-center justify-center text-cyber-green">
                                 <MapPin size={24} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-400 font-bold uppercase">Headquarters</p>
                                 <p className="text-white">101 Cyber Avenue, Silicon Valley, Mumbai</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Contact Form */}
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input 
                              type="text" 
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="First Name" 
                              required
                              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyber-blue focus:outline-none transition-all placeholder-gray-600 w-full" 
                           />
                           <input 
                              type="text" 
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Last Name" 
                              required
                              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyber-blue focus:outline-none transition-all placeholder-gray-600 w-full" 
                           />
                        </div>
                        <input 
                           type="email" 
                           name="email"
                           value={formData.email}
                           onChange={handleInputChange}
                           placeholder="Email Address" 
                           required
                           className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyber-blue focus:outline-none transition-all placeholder-gray-600 w-full" 
                        />
                        <textarea 
                           name="message"
                           value={formData.message}
                           onChange={handleInputChange}
                           placeholder="Your Message" 
                           rows={4} 
                           required
                           className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyber-blue focus:outline-none transition-all placeholder-gray-600 w-full resize-none"
                        ></textarea>
                        <button 
                           type="submit" 
                           disabled={isSubmitting}
                           className="w-full bg-cyber-blue text-cyber-black font-bold py-3.5 rounded-xl hover:shadow-neon-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                     </form>
                  </div>
               </div>

               {/* Success Modal */}
               {showSuccessModal && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                     <div className="bg-cyber-black border border-cyber-blue/30 p-8 rounded-3xl max-w-md w-full relative shadow-[0_0_50px_rgba(0,242,255,0.1)] text-center">
                        <button 
                           onClick={() => setShowSuccessModal(false)}
                           className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                           <X size={24} />
                        </button>
                        <div className="w-16 h-16 bg-cyber-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                           <Shield className="w-8 h-8 text-cyber-blue" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                        <p className="text-gray-400 mb-8">
                           Thank you for contacting us. Our team will review your message and get back to you shortly.
                        </p>
                        <button 
                           onClick={() => setShowSuccessModal(false)}
                           className="bg-cyber-blue text-cyber-black font-bold py-3 px-8 rounded-xl hover:shadow-neon-blue transition-all w-full"
                        >
                           Close
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </main>

         {/* Footer */}
         <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md pt-20 pb-10">
            <div className="max-w-[90%] mx-auto px-6">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16 text-center md:text-left">
                  <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="bg-cyber-blue/20 p-2 rounded-xl">
                           <Shield className="w-6 h-6 text-cyber-blue" />
                        </div>
                        <span className="text-2xl md:text-3xl font-extrabold tracking-tight">CYBERSPY</span>
                     </div>
                     <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-xs mx-auto md:mx-0">
                        Advanced predictive threat intelligence for the modern digital landscape. Secure your future today.
                     </p>
                     <div className="flex gap-4 justify-center md:justify-start">
                        <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 hover:border-cyber-blue/30">
                           <Github size={20} />
                        </a>
                        <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 hover:border-cyber-blue/30">
                           <Twitter size={20} />
                        </a>
                        <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 hover:border-cyber-blue/30">
                           <Linkedin size={20} />
                        </a>
                     </div>
                  </div>

                  <div>
                     <h4 className="font-bold text-white text-lg md:text-xl mb-8">Platform</h4>
                     <ul className="space-y-4 text-gray-400 text-sm md:text-base">
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Integrations</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Roadmap</a></li>
                     </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-white text-lg md:text-xl mb-8">Resources</h4>
                     <ul className="space-y-4 text-gray-400 text-sm md:text-base">
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Documentation</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">API Reference</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Case Studies</a></li>
                     </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-white text-lg md:text-xl mb-8">Company</h4>
                     <ul className="space-y-4 text-gray-400 text-sm md:text-base">
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Legal</a></li>
                        <li><a href="#" className="hover:text-cyber-blue transition-colors">Contact</a></li>
                     </ul>
                  </div>
               </div>
               
               <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                  <p className="text-gray-500 text-sm md:text-base">© 2025 CyberSpy Inc. All rights reserved.</p>
                  <div className="flex gap-8 text-sm md:text-base text-gray-500 font-medium">
                     <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                     <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                     <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default Landing;
