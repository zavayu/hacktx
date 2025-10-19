import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyzePurchases, formatCurrency, formatPercentage, getSpendingInsights } from '../utils/purchaseAnalysis';
import type { Purchase } from '../utils/purchaseAnalysis';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface DashboardProps {
  purchases?: Purchase[];
  customerName?: string;
}

interface UserData {
  bankLinked?: boolean;
  creditScore?: string;
  annualIncome?: string;
  employmentStatus?: string;
  hasCreditCards?: string;
  creditCards?: string[];
  creditLength?: string;
  latePayments?: string;
  creditGoal?: string;
  purchases?: Purchase[];
  customerName?: string;
  numPurchases?: number;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [currentUser]);

  const purchases = userData?.purchases || [];
  const customerName = userData?.customerName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Customer';
  
  const profile = analyzePurchases(purchases);
  const insights = getSpendingInsights(profile);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData?.bankLinked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">
            To see your personalized dashboard, please complete the onboarding survey and link your bank account.
          </p>
          <a
            href="/survey"
            className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Complete Survey
          </a>
        </motion.div>
      </div>
    );
  }

  // Pentagon chart data for spending categories
  const radarData = {
    labels: ['Restaurants', 'Travel', 'Groceries', 'Gas', 'Online Shopping'],
    datasets: [{
      label: 'Spending %',
      data: [
        profile.spendingPattern.restaurants,
        profile.spendingPattern.travel,
        profile.spendingPattern.groceries,
        profile.spendingPattern.gas,
        profile.spendingPattern.onlineShopping
      ],
      backgroundColor: 'rgba(210, 160, 240, 0.2)',
      borderColor: '#D2A0F0',
      borderWidth: 2,
      pointBackgroundColor: '#D2A0F0',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#D2A0F0'
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-manrope">
            Your Spending Analysis
          </h1>
          <p className="text-xl text-gray-600">
            We've analyzed {customerName}'s spending patterns to create your unique financial profile.
          </p>
        </motion.div>

        {/* Key Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(profile.totalSpent)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Category</h3>
                <p className="text-2xl font-bold text-green-600">{profile.topCategory.category}</p>
                <p className="text-sm text-gray-500">{formatPercentage(profile.topCategory.percentage)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                <p className="text-2xl font-bold text-blue-600">{purchases.length}</p>
                <p className="text-sm text-gray-500">Total purchases</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pentagon Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Spending Style</h3>
            <p className="text-gray-600 mb-4">Based on your spending patterns</p>
            
            {/* Simple pentagon visualization */}
            <div className="relative w-64 h-64 mx-auto">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Pentagon outline */}
                <polygon
                  points="100,20 180,70 160,150 40,150 20,70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {radarData.datasets[0].data.map((value, index) => {
                  const angle = (index * 72) * (Math.PI / 180);
                  const radius = (value / 100) * 60;
                  const x = 100 + radius * Math.cos(angle - Math.PI / 2);
                  const y = 100 + radius * Math.sin(angle - Math.PI / 2);
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#D2A0F0"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  );
                })}
                
                {/* Labels */}
                {radarData.labels.map((label, index) => {
                  const angle = (index * 72) * (Math.PI / 180);
                  const x = 100 + 80 * Math.cos(angle - Math.PI / 2);
                  const y = 100 + 80 * Math.sin(angle - Math.PI / 2);
                  
                  return (
                    <text
                      key={index}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Priority Distribution</h3>
            <p className="text-gray-600 mb-6">What matters most to you</p>
            
            <div className="space-y-4">
              {profile.categories.slice(0, 5).map((category, _) => (
                <div key={category.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category.category.replace('-', ' ')}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {formatPercentage(category.percentage)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Personalized Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;