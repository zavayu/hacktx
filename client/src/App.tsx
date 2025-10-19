import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Survey from './pages/Survey';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/survey" element={
            <ProtectedRoute>
              <Survey />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <div className="bg-white flex items-center justify-center overflow-hidden relative" style={{ height: 'calc(100vh - 4rem)' }}>
              {/* SVG Decorations - Top Left */}
              <div className="absolute overflow-hidden rounded-lg z-10" style={{ left: '3%', top: '10%', width: '12rem', height: '8rem' }}>
                <motion.img 
                  src="/creditcardback.svg" 
                  alt="" 
                  className="w-full h-full z-10" 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 100 }}
                />
                <motion.div
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.4) 50%, transparent 80%)',
                    transform: 'translateX(-100%) rotate(-10deg)',
                  }}
                  animate={{
                    x: ['0%', '200%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <motion.img 
                src="/bluestar.svg" 
                alt="" 
                className="absolute w-12 h-12 z-10" 
                style={{ left: '25%', top: '22%' }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.15, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.2 },
                  scale: { duration: 3, delay: 0.7, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 20, delay: 0.7, repeat: Infinity, ease: "linear" }
                }}
              />
              
              {/* SVG Decorations - Clouds (Behind Everything) */}
              <motion.img 
                src="/cloudsleft.svg" 
                alt="" 
                className="absolute z-0" 
                style={{ left: '0%', top: '5%', width: '30%', height: 'auto' }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.img 
                src="/cloudsright.svg" 
                alt="" 
                className="absolute z-0" 
                style={{ right: '0%', top: '5%', width: '30%', height: 'auto' }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              
              {/* SVG Decorations - Left Side */}
              <motion.img 
                src="/purplemonster.svg" 
                alt="" 
                className="absolute w-64 h-64 z-10 cursor-pointer" 
                style={{ left: '6%', top: '32%' }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotate: 0
                }}
                whileHover={{ 
                  y: -10, 
                  rotate: 8,
                  transition: { duration: 0.3, type: "spring", stiffness: 300 }
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.3 },
                  scale: { duration: 0.5, delay: 0.3, type: "spring", stiffness: 100 },
                  rotate: { duration: 0.3, type: "spring", stiffness: 300 },
                  y: { duration: 2.5, type: "spring", stiffness: 40, damping: 30 }
                }}
              />
              <motion.img 
                src="/purplestar.svg" 
                alt="" 
                className="absolute w-10 h-10 z-10" 
                style={{ left: '24%', top: '48%' }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.4 },
                  scale: { duration: 2.5, delay: 0.9, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 18, delay: 0.9, repeat: Infinity, ease: "linear" }
                }}
              />
              <motion.img 
                src="/greenmonster.svg" 
                alt="" 
                className="absolute w-48 h-48 z-10 cursor-pointer" 
                style={{ left: '12%', bottom: '5%' }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                whileHover={{ 
                  y: -12, 
                  rotate: -6,
                  transition: { duration: 0.3, type: "spring", stiffness: 300 }
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.5 },
                  scale: { duration: 0.5, delay: 0.5, type: "spring", stiffness: 100 },
                  y: { duration: 0.3, type: "spring", stiffness: 300 },
                  rotate: { duration: 0.3, type: "spring", stiffness: 300 }
                }}
              />
              <motion.img 
                src="/fireball.svg" 
                alt="" 
                className="absolute w-24 h-24 z-10" 
                style={{ left: '5%', bottom: '20%' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 100 }}
              />
              
              {/* SVG Decorations - Top Right */}
              <motion.img 
                src="/jupiter.svg" 
                alt="" 
                className="absolute w-24 h-24 z-10" 
                style={{ right: '15%', top: '8%' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15, type: "spring", stiffness: 100 }}
              />
              <motion.img 
                src="/redstar.svg" 
                alt="" 
                className="absolute w-14 h-14 z-10" 
                style={{ right: '7%', top: '8%' }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.18, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.25 },
                  scale: { duration: 3.5, delay: 0.75, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 22, delay: 0.75, repeat: Infinity, ease: "linear" }
                }}
              />
              <motion.img 
                src="/greenstar.svg" 
                alt="" 
                className="absolute w-12 h-12 z-10" 
                style={{ right: '5%', top: '22%' }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.22, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.35 },
                  scale: { duration: 2.8, delay: 1, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 16, delay: 1, repeat: Infinity, ease: "linear" }
                }}
              />
              
              {/* SVG Decorations - Right Side */}
              <motion.img 
                src="/bluemonster.svg" 
                alt="" 
                className="absolute w-40 h-40 z-10 cursor-pointer" 
                style={{ right: '12%', top: '28%' }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotate: 0
                }}
                whileHover={{ 
                  y: -10, 
                  rotate: -7,
                  transition: { duration: 0.3, type: "spring", stiffness: 300 }
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.45 },
                  scale: { duration: 0.5, delay: 0.45, type: "spring", stiffness: 100 },
                  rotate: { duration: 0.3, type: "spring", stiffness: 300 },
                  y: { duration: 2.5, type: "spring", stiffness: 40, damping: 30 }
                }}
              />
              <motion.img 
                src="/earth.svg" 
                alt="" 
                className="absolute w-28 h-28 z-10" 
                style={{ right: '3%', top: '42%' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.55, type: "spring", stiffness: 100 }}
              />
              <div className="absolute overflow-hidden rounded-lg z-10" style={{ right: '7%', bottom: '22%', width: '12rem', height: '8rem' }}>
                <motion.img 
                  src="/creditcardfront.svg" 
                  alt="" 
                  className="w-full h-full z-10" 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.65, type: "spring", stiffness: 100 }}
                />
                <motion.div
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.4) 50%, transparent 80%)',
                    transform: 'translateX(-100%) rotate(-10deg)',
                  }}
                  animate={{
                    x: ['0%', '200%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <motion.img 
                src="/saturn.svg" 
                alt="" 
                className="absolute w-32 h-32 z-10" 
                style={{ right: '18%', bottom: '8%' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.75, type: "spring", stiffness: 100 }}
              />
              <motion.img 
                src="/redmonster.svg" 
                alt="" 
                className="absolute w-40 h-40 z-10 cursor-pointer" 
                style={{ right: '3%', bottom: '3%' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  y: -10, 
                  rotate: 5,
                  transition: { duration: 0.3, type: "spring", stiffness: 300 }
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.85 },
                  scale: { duration: 0.5, delay: 0.85, type: "spring", stiffness: 100 },
                  y: { duration: 2.5, type: "spring", stiffness: 40, damping: 30 },
                  rotate: { duration: 2.5, type: "spring", stiffness: 40, damping: 30 }
                }}
              />
              
              {/* Hero Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="text-center">
                  <motion.h1 
                    className="text-6xl font-extrabold text-gray-900 mb-6 font-manrope leading-[120.9%] tracking-[-0.03em]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    Your Credit<br />
                    Card Journey<br />
                    Simplified.
                  </motion.h1>
                  <motion.p 
                    className="text-sm mb-8 max-w-3xl mx-auto" 
                    style={{ color: '#4C4C4C' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  >
                    Personalized Roadmaps for Credit Improvement<br />
                    and Perfect Credit Card Choices
                  </motion.p>
                  
                  {currentUser ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-800 font-semibold">Successfully logged in!</span>
                      </div>
                      <p className="text-green-700 mb-4">Welcome back, {currentUser.email}</p>
                      <a 
                        href="/dashboard" 
                        className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        Go to Dashboard
                      </a>
                    </div>
                  ) : (
                    <motion.div 
                      className="flex gap-4 justify-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                    >
                      <a 
                        href="/login" 
                        className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-full transition-colors"
                      >
                        Get Started
                        <ArrowRightIcon className="w-4 h-4" strokeWidth={2} />
                      </a>
                      <button 
                        className="inline-flex items-center gap-2 text-black font-semibold py-3 px-8 rounded-full transition-colors hover:opacity-80"
                        style={{ backgroundColor: '#F2EBDE' }}
                      >
                        Watch Demo
                        <PlayIcon className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
