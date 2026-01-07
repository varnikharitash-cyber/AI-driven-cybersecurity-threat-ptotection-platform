import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FileAnalysis from './pages/Analysis';
import Streaming from './pages/Streaming';
import NetworkSecurity from './pages/Network';
import AttackMap from './pages/AttackMap';
import AIChat from './pages/AIChat';
import Analytics from './pages/Analytics';
import PCAPAnalysis from './pages/PCAPAnalysis';
import LiveMonitor from './pages/LiveMonitor';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Layout for protected routes
  const AppLayout = () => (
    <div className="flex min-h-screen bg-cyber-black animated-bg relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 glass-morphism rounded-lg text-cyber-blue hover:text-white transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<FileAnalysis />} />
          <Route path="/streaming" element={<Streaming />} />
          <Route path="/network" element={<NetworkSecurity />} />
          <Route path="/map" element={<AttackMap />} />
          <Route path="/ai" element={<AIChat />} />
          <Route path="/stats" element={<Analytics />} />
          <Route path="/pcap" element={<PCAPAnalysis />} />
          <Route path="/monitor" element={<LiveMonitor />} />
        </Routes>
      </main>
    </div>
  );

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes - All wrapped in ProtectedRoute and AppLayout */}
          <Route element={<ProtectedRoute />}>
             <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;