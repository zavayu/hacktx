import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Survey() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    creditScore: '',
    annualIncome: '',
    employmentStatus: '',
    hasCreditCards: '',
    creditCards: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleNext = () => {
    if (currentStep < 4) {
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
    // Here you would typically save the survey data to your backend
    console.log('Survey answers:', answers);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    navigate('/dashboard');
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return answers.creditScore !== '';
      case 2: return answers.annualIncome !== '';
      case 3: return answers.employmentStatus !== '';
      case 4: return answers.hasCreditCards !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What is your current credit score?</h2>
            <div className="space-y-3">
              {creditScoreOptions.map((option) => (
                <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="creditScore"
                    value={option.value}
                    checked={answers.creditScore === option.value}
                    onChange={(e) => handleAnswer('creditScore', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What is your annual income?</h2>
            <div className="space-y-3">
              {incomeOptions.map((option) => (
                <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="annualIncome"
                    value={option.value}
                    checked={answers.annualIncome === option.value}
                    onChange={(e) => handleAnswer('annualIncome', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What is your employment status?</h2>
            <div className="space-y-3">
              {employmentOptions.map((option) => (
                <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="employmentStatus"
                    value={option.value}
                    checked={answers.employmentStatus === option.value}
                    onChange={(e) => handleAnswer('employmentStatus', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Do you currently have any credit cards?</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="hasCreditCards"
                  value="yes"
                  checked={answers.hasCreditCards === 'yes'}
                  onChange={(e) => handleAnswer('hasCreditCards', e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-900">Yes</span>
              </label>
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="hasCreditCards"
                  value="no"
                  checked={answers.hasCreditCards === 'no'}
                  onChange={(e) => handleAnswer('hasCreditCards', e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-900">No</span>
              </label>
            </div>
            
            {answers.hasCreditCards === 'yes' && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Which credit cards do you have?</h3>
                <div className="space-y-2">
                  {creditCardOptions.map((card) => (
                    <label key={card} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        value={card}
                        checked={answers.creditCards.includes(card)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAnswers(prev => ({
                            ...prev,
                            creditCards: e.target.checked
                              ? [...prev.creditCards, value]
                              : prev.creditCards.filter(c => c !== value)
                          }));
                        }}
                        className="mr-3"
                      />
                      <span className="text-gray-900">{card}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of 4</span>
              <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
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

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepComplete(currentStep) || loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
