import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Survey() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    bankLinked: false,
    creditScore: '',
    annualIncome: '',
    employmentStatus: '',
    hasCreditCards: '',
    creditCards: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const creditCardsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when "Yes" is selected for credit cards
  useEffect(() => {
    if (answers.hasCreditCards === 'yes' && creditCardsRef.current) {
      setTimeout(() => {
        creditCardsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 500);
    }
  }, [answers.hasCreditCards]);

  const handleLinkBank = async () => {
    setBankLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnswers(prev => ({ ...prev, bankLinked: true }));
    setBankLoading(false);
  };

  const creditScoreOptions = [
    { value: 'excellent', label: 'Excellent (720-850)' },
    { value: 'good', label: 'Good (690-719)' },
    { value: 'fair', label: 'Fair (630-689)' },
    { value: 'bad', label: 'Bad (350-629)' }
  ];

  const incomeOptions = [
    { value: 'under-25k', label: '< $25,000' },
    { value: '25k-50k', label: '$25,000 - $50,000' },
    { value: '50k-75k', label: '$50,000 - $75,000' },
    { value: '75k-100k', label: '$75,000 - $100,000' },
    { value: '100k-150k', label: '$100,000 - $150,000' },
    { value: '150k-250k', label: '$150,000 - $250,000' }
  ];

  const employmentOptions = [
    { value: 'full-time', label: 'Full time' },
    { value: 'part-time', label: 'Part time' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'student', label: 'Full time student' }
  ];

  const creditCardOptions = [
    'Chase Sapphire Preferred',
    'Capital One Venture',
    'American Express Gold',
    'Discover It Cash Back',
    'Citi Double Cash',
    'Wells Fargo Active Cash',
    'Bank of America Cash Rewards',
    'None of the above'
  ];

  const handleAnswer = (question: string, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const totalSteps = 5;
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Map value to label for creditScore and annualIncome
      const creditScoreLabel = creditScoreOptions.find(opt => opt.value === answers.creditScore)?.label || '';
      const annualIncomeLabel = incomeOptions.find(opt => opt.value === answers.annualIncome)?.label || '';
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          bankLinked: answers.bankLinked,
          creditScore: creditScoreLabel,
          annualIncome: annualIncomeLabel,
          employmentStatus: answers.employmentStatus,
          hasCreditCards: answers.hasCreditCards,
          creditCards: answers.creditCards
        });
      }
    } catch (err) {
      console.error('Error saving survey:', err);
    }
    setLoading(false);
    navigate('/dashboard');
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return answers.bankLinked;
      case 2: return answers.creditScore !== '';
      case 3: return answers.annualIncome !== '';
      case 4: return answers.employmentStatus !== '';
      case 5: return answers.hasCreditCards !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-2xl font-bold text-gray-900 mb-6 font-manrope"
            >
              Link your bank account
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-gray-700 mb-6"
            >
              For a more personalized experience, link your bank account.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="flex items-center mt-2"
            >
              <button
                type="button"
                onClick={handleLinkBank}
                disabled={answers.bankLinked || bankLoading}
                className={`px-4 py-2 text-sm rounded-md font-semibold transition-colors flex items-center justify-center ${answers.bankLinked || bankLoading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#D2A0F0] text-white hover:bg-[#b97be2]'}`}
                style={{ minWidth: 'auto' }}
              >
                {bankLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Linking...
                  </span>
                ) : answers.bankLinked ? 'Bank Account Linked' : 'Link Bank Account'}
              </button>
            </motion.div>
          </div>
        );
      case 2:
        return (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-2xl font-bold text-gray-900 mb-6 font-manrope"
            >
              What is your current credit score?
            </motion.h2>
            <div className="space-y-3">
              {creditScoreOptions.map((option, index) => (
                <motion.label 
                  key={option.value}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                    answers.creditScore === option.value 
                      ? 'bg-purple-50 border-2 border-[#D2A0F0]' 
                      : 'border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="creditScore"
                    value={option.value}
                    checked={answers.creditScore === option.value}
                    onChange={(e) => handleAnswer('creditScore', e.target.value)}
                    className="appearance-none mr-3 w-5 h-5 rounded-full border-[2.5px] border-[#D2A0F0] relative cursor-pointer transition-all duration-200
                      before:content-[''] before:absolute before:inset-[2.5px] before:rounded-full before:transition-all before:duration-200
                      checked:before:bg-[#D2A0F0]"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </motion.label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-2xl font-bold text-gray-900 mb-6 font-manrope"
            >
              What is your annual income?
            </motion.h2>
            <div className="space-y-3">
              {incomeOptions.map((option, index) => (
                <motion.label 
                  key={option.value}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.08,
                    ease: "easeOut"
                  }}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                    answers.annualIncome === option.value 
                      ? 'bg-purple-50 border-2 border-[#D2A0F0]' 
                      : 'border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="annualIncome"
                    value={option.value}
                    checked={answers.annualIncome === option.value}
                    onChange={(e) => handleAnswer('annualIncome', e.target.value)}
                    className="appearance-none mr-3 w-5 h-5 rounded-full border-[2.5px] border-[#D2A0F0] relative cursor-pointer transition-all duration-200
                      before:content-[''] before:absolute before:inset-[2.5px] before:rounded-full before:transition-all before:duration-200
                      checked:before:bg-[#D2A0F0]"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </motion.label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-2xl font-bold text-gray-900 mb-6 font-manrope"
            >
              What is your employment status?
            </motion.h2>
            <div className="space-y-3">
              {employmentOptions.map((option, index) => (
                <motion.label 
                  key={option.value}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                    answers.employmentStatus === option.value 
                      ? 'bg-purple-50 border-2 border-[#D2A0F0]' 
                      : 'border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="employmentStatus"
                    value={option.value}
                    checked={answers.employmentStatus === option.value}
                    onChange={(e) => handleAnswer('employmentStatus', e.target.value)}
                    className="appearance-none mr-3 w-5 h-5 rounded-full border-[2.5px] border-[#D2A0F0] relative cursor-pointer transition-all duration-200
                      before:content-[''] before:absolute before:inset-[2.5px] before:rounded-full before:transition-all before:duration-200
                      checked:before:bg-[#D2A0F0]"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </motion.label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-2xl font-bold text-gray-900 mb-6 font-manrope"
            >
              Do you currently have any credit cards?
            </motion.h2>
            <div className="space-y-3">
              <motion.label
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0,
                  ease: "easeOut"
                }}
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                  answers.hasCreditCards === 'yes' 
                    ? 'bg-purple-50 border-2 border-[#D2A0F0]' 
                    : 'border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="hasCreditCards"
                  value="yes"
                  checked={answers.hasCreditCards === 'yes'}
                  onChange={(e) => handleAnswer('hasCreditCards', e.target.value)}
                  className="appearance-none mr-3 w-5 h-5 rounded-full border-[2.5px] border-[#D2A0F0] relative cursor-pointer transition-all duration-200
                    before:content-[''] before:absolute before:inset-[2.5px] before:rounded-full before:transition-all before:duration-200
                    checked:before:bg-[#D2A0F0]"
                />
                <span className="text-gray-900">Yes</span>
              </motion.label>
              <motion.label
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.1,
                  ease: "easeOut"
                }}
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                  answers.hasCreditCards === 'no' 
                    ? 'bg-purple-50 border-2 border-[#D2A0F0]' 
                    : 'border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="hasCreditCards"
                  value="no"
                  checked={answers.hasCreditCards === 'no'}
                  onChange={(e) => handleAnswer('hasCreditCards', e.target.value)}
                  className="appearance-none mr-3 w-5 h-5 rounded-full border-[2.5px] border-[#D2A0F0] relative cursor-pointer transition-all duration-200
                    before:content-[''] before:absolute before:inset-[2.5px] before:rounded-full before:transition-all before:duration-200
                    checked:before:bg-[#D2A0F0]"
                />
                <span className="text-gray-900">No</span>
              </motion.label>
            </div>
            
            {answers.hasCreditCards === 'yes' && (
              <motion.div 
                ref={creditCardsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-6"
              >
                <motion.h3 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  className="text-lg font-semibold text-gray-900 mb-1 font-manrope"
                >
                  Which credit cards do you have?
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  className="text-sm text-gray-500 mb-4"
                >
                  Select one or more options
                </motion.p>
                <div className="space-y-2">
                  {creditCardOptions.map((card, index) => (
                    <motion.label 
                      key={card}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.2 + index * 0.05,
                        ease: "easeOut"
                      }}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                        answers.creditCards.includes(card) 
                          ? 'bg-purple-50 border-2 border-[#D2A0F0]' 
                          : 'border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={card}
                        checked={answers.creditCards.includes(card)}
                        onChange={(e) => {
                          const value = e.target.value;
                          const isNoneOfAbove = value === 'None of the above';
                          
                          setAnswers(prev => {
                            if (e.target.checked) {
                              // If checking "None of the above", clear all others
                              if (isNoneOfAbove) {
                                return { ...prev, creditCards: [value] };
                              }
                              // If checking any other card, remove "None of the above" and add this card
                              return {
                                ...prev,
                                creditCards: [...prev.creditCards.filter(c => c !== 'None of the above'), value]
                              };
                            } else {
                              // Unchecking - just remove this card
                              return {
                                ...prev,
                                creditCards: prev.creditCards.filter(c => c !== value)
                              };
                            }
                          });
                        }}
                        className="appearance-none mr-3 w-5 h-5 rounded-full border-[2.5px] border-[#D2A0F0] relative cursor-pointer transition-all duration-200
                          before:content-[''] before:absolute before:inset-[2.5px] before:rounded-full before:transition-all before:duration-200
                          checked:before:bg-[#D2A0F0]"
                      />
                      <span className="text-gray-900">{card}</span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, (currentStep / totalSteps) * 100))}%`, backgroundColor: '#D2A0F0' }}
              ></div>
            </div>
          </div>

          {/* Survey Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepComplete(currentStep) || loading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Complete Survey'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Survey;
