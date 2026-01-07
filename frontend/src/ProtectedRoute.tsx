import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const ProtectedRoute = () => {
   const { user, loading } = useAuth();

   if (loading) {
      return (
         <div className="min-h-screen bg-cyber-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
               <Shield className="w-12 h-12 text-cyber-blue animate-pulse" />
               <div className="text-cyber-blue font-mono text-sm tracking-widest uppercase">Verifying Clearance...</div>
            </div>
         </div>
      );
   }

   if (!user) {
      return <Navigate to="/login" replace />;
   }

   return <Outlet />;
};

export default ProtectedRoute;
