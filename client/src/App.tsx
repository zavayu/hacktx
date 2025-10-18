import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              {/* Hero Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                  <h1 className="text-5xl font-bold text-gray-900 mb-6">
                    Take Control of Your Credit Journey
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    CreditMob creates personalized roadmaps to help you improve your credit score and choose the perfect credit cards for your financial goals.
                  </p>
                  
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
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        Go to Dashboard
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <a 
                        href="/login" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors mr-4"
                      >
                        Get Started Free
                      </a>
                      <a 
                        href="#features" 
                        className="inline-block bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 transition-colors"
                      >
                        Learn More
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Section */}
              <div id="features" className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Your Personal Credit Roadmap
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      We analyze your financial situation and create a step-by-step plan to optimize your credit health.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Credit Score Analysis</h3>
                      <p className="text-gray-600">
                        Get detailed insights into your credit score factors and understand exactly what's affecting your rating.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Roadmap</h3>
                      <p className="text-gray-600">
                        Receive a customized step-by-step plan tailored to your specific financial situation and goals.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Card Recommendations</h3>
                      <p className="text-gray-600">
                        Get matched with credit cards that align with your spending habits and credit improvement goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Why Choose CreditMob?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Join thousands of users who have improved their credit scores and found the perfect credit cards.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600 mb-2">742</div>
                      <div className="text-sm text-gray-600 mb-2">Average Credit Score</div>
                      <div className="text-xs text-green-600">+15 points improvement</div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-3xl font-bold text-green-600 mb-2">23%</div>
                      <div className="text-sm text-gray-600 mb-2">Average Utilization</div>
                      <div className="text-xs text-green-600">-5% reduction</div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-3xl font-bold text-purple-600 mb-2">$12K</div>
                      <div className="text-sm text-gray-600 mb-2">Average Credit Limit</div>
                      <div className="text-xs text-green-600">+$2K increase</div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
                      <div className="text-sm text-gray-600 mb-2">Payment History</div>
                      <div className="text-xs text-green-600">Perfect record</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-blue-600 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Transform Your Credit?
                  </h2>
                  <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join CreditMob today and start your journey to better credit health with personalized guidance and smart recommendations.
                  </p>
                  {!currentUser && (
                    <a 
                      href="/login" 
                      className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors"
                    >
                      Start Your Free Journey
                    </a>
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
