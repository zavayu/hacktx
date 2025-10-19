import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
              <span className="text-2xl font-extrabold text-gray-900 font-manrope" style={{ letterSpacing: '-0.03em' }}>
                CreditMob
              </span>
            </Link>
          </div>

          {/* Navigation Links and User Menu Grouped */}
          <div className="flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-[#D2A0F0] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              {currentUser && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-[#D2A0F0] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/roadmap" 
                    className="text-gray-700 hover:text-[#D2A0F0] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Roadmap
                  </Link>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-10 h-10 bg-[#D2A0F0] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#D2A0F0] focus:ring-offset-2"
                  >
                    <span className="text-white text-sm font-medium">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5 text-gray-500" />
                        <span>User Profile</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-[#D2A0F0] focus:outline-none focus:text-[#D2A0F0]"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;