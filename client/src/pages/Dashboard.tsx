import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyzePurchases } from '../utils/purchaseAnalysis';
import type { Purchase } from '../utils/purchaseAnalysis';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SpendingRadarChart } from '../components/SpendingRadarChart';
import { FinancialInsights } from '../components/FinancialInsights';
import CardRecommendations from '../components/CardRecommendations';

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
  const profile = analyzePurchases(purchases);

  // Prepare spending pattern data for radar chart
  const radarChartData = {
    restaurants: profile.spendingPattern.restaurants,
    travel: profile.spendingPattern.travel,
    groceries: profile.spendingPattern.groceries,
    gas: profile.spendingPattern.gas,
    onlineShopping: profile.spendingPattern.onlineShopping
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 lg:items-stretch">
          {/* Left Column: Credit Score + Radar Chart */}
          <div className="flex flex-col gap-6 h-full">
            {/* Credit Score Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-lg border-0 relative"
            >
              <div className="flex items-center justify-between relative">
                <div className="z-10">
                  <p className="text-sm text-gray-500 mb-1">Credit Score</p>
                  <p className="text-4xl font-bold text-gray-900 font-manrope">
                    {userData?.creditScore || 'Not provided'}
                  </p>
              </div>
                <div className="absolute -right-4 -top-4">
                  <img 
                    src={
                      userData?.creditScore?.includes('800') || userData?.creditScore?.includes('Excellent')
                        ? '/greenmonster.svg'
                        : userData?.creditScore?.includes('740') || userData?.creditScore?.includes('Good')
                        ? '/bluemonster.svg'
                        : userData?.creditScore?.includes('670') || userData?.creditScore?.includes('Fair')
                        ? '/purplemonster.svg'
                        : '/redmonster.svg'
                    }
                    alt="Credit score mascot"
                    className="w-32 h-32 object-contain"
                  />
              </div>
            </div>
              {userData?.creditScore && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {userData.creditScore.includes('800') || userData.creditScore.includes('Excellent') 
                      ? '🎉 Excellent credit! You qualify for the best rates.'
                      : userData.creditScore.includes('740') || userData.creditScore.includes('Good')
                      ? '✨ Good credit! You have access to competitive offers.'
                      : userData.creditScore.includes('670') || userData.creditScore.includes('Fair')
                      ? '📈 Fair credit. Building your score opens more opportunities.'
                      : '💪 Building credit is a journey. We\'re here to help!'}
                  </p>
              </div>
              )}
          </motion.div>

            {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            >
              <SpendingRadarChart 
                spendingPattern={radarChartData}
                topCategory={profile.topCategory}
              />
            </motion.div>
            </div>

          {/* Right Column: Financial Insights (Full Height) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex h-full"
          >
            <div className="flex-1 flex flex-col h-full">
              <FinancialInsights
                categories={profile.categories}
                totalSpent={profile.totalSpent}
                annualIncome={userData?.annualIncome}
                purchases={purchases}
              />
            </div>
          </motion.div>
        </div>

        {/* Credit Card Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <CardRecommendations />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
