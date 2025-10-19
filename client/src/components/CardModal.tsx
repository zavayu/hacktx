import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import type { CreditCard, UserProfile } from "../utils/creditCardMatcher";
import { calculatePreapproval } from "../utils/preapprovalPredictor";
import { MapIcon } from "@heroicons/react/24/outline";

interface CardModalProps {
    card: CreditCard | null;
    isOpen: boolean;
    onClose: () => void;
    similarity?: number;
    userProfile?: UserProfile;
}

export default function CardModal({
    card,
    isOpen,
    onClose,
    similarity,
    userProfile,
}: CardModalProps) {
    if (!card) return null;

    const getAnnualFee = () => {
        if (card.annualFee !== undefined) return `$${card.annualFee}`;
        if (card.annual_fee) return card.annual_fee;
        return "$0";
    };

    const getBenefitsList = () => {
        if (!card.benefits) return [];
        const benefitsArray = Array.isArray(card.benefits) ? card.benefits : [card.benefits];
        
        // Split comma-separated benefits into individual items
        const splitBenefits: string[] = [];
        benefitsArray.forEach(benefit => {
            // Split by comma and clean up each item
            const items = benefit.split(',').map(item => item.trim()).filter(item => item.length > 0);
            splitBenefits.push(...items);
        });
        
        return splitBenefits;
    };

    const getPersonalizedInsight = (): string | null => {
        if (!userProfile) return null;

        // Analyze spending patterns in detail
        if (userProfile.purchases && userProfile.purchases.length > 0) {
            // Calculate spending by category
            const categorySpending: { [key: string]: number } = {};
            userProfile.purchases.forEach(purchase => {
                const category = purchase.category;
                categorySpending[category] = (categorySpending[category] || 0) + purchase.amount;
            });

            // Get top spending category
            const sortedCategories = Object.entries(categorySpending)
                .sort((a, b) => b[1] - a[1]);
            const topCategory = sortedCategories[0]?.[0] || "";
            const topSpending = sortedCategories[0]?.[1] || 0;

            // Match spending with card rewards
            const cardName = card.name.toLowerCase();
            const cardBenefits = (Array.isArray(card.benefits) ? card.benefits : [card.benefits || ""])
                .join(" ").toLowerCase();
            const rewardsType = (card.rewardsType || "").toLowerCase();

            // Dining/Restaurants
            if (topCategory.includes('restaurant') || topCategory.includes('dining') || topCategory.includes('food')) {
                if (rewardsType.includes('dining') || cardBenefits.includes('dining') || cardName.includes('savor')) {
                    return `Perfect for foodies like you! With $${topSpending.toFixed(0)} spent on dining, you'll maximize rewards on every meal out.`;
                }
                return `You spend $${topSpending.toFixed(0)} on dining - this card's rewards will complement your foodie lifestyle.`;
            }

            // Travel
            if (topCategory.includes('travel') || topCategory.includes('flight') || topCategory.includes('hotel')) {
                if (rewardsType.includes('travel') || cardBenefits.includes('travel') || cardName.includes('venture')) {
                    return `Made for travelers like you! Your $${topSpending.toFixed(0)} in travel spending will earn you maximum rewards to fund your next adventure.`;
                }
                return `With $${topSpending.toFixed(0)} in travel expenses, this card's benefits align perfectly with your wanderlust.`;
            }

            // Gas/Transportation
            if (topCategory.includes('gas') || topCategory.includes('fuel') || topCategory.includes('transportation')) {
                if (rewardsType.includes('gas') || cardBenefits.includes('gas')) {
                    return `Ideal for commuters! Your $${topSpending.toFixed(0)} in gas spending means serious savings at the pump with this card.`;
                }
                return `You spend $${topSpending.toFixed(0)} on transportation - this card helps offset those costs with solid rewards.`;
            }

            // Groceries
            if (topCategory.includes('grocery') || topCategory.includes('groceries') || topCategory.includes('supermarket')) {
                if (rewardsType.includes('grocery') || cardBenefits.includes('grocery')) {
                    return `Perfect for everyday essentials! With $${topSpending.toFixed(0)} in grocery spending, you'll earn rewards on every shopping trip.`;
                }
                return `Your $${topSpending.toFixed(0)} grocery spending makes this card a smart choice for maximizing everyday rewards.`;
            }

            // Online/Shopping
            if (topCategory.includes('online') || topCategory.includes('shopping') || topCategory.includes('retail')) {
                if (cardBenefits.includes('online') || cardBenefits.includes('shopping')) {
                    return `Great for online shoppers! Your $${topSpending.toFixed(0)} in purchases means excellent rewards on all your favorite sites.`;
                }
                return `With $${topSpending.toFixed(0)} in shopping, this card's benefits align perfectly with your purchasing habits.`;
            }

            // Entertainment/Streaming
            if (topCategory.includes('entertainment') || topCategory.includes('streaming')) {
                if (cardBenefits.includes('streaming') || cardBenefits.includes('entertainment')) {
                    return `Perfect for entertainment lovers! Your $${topSpending.toFixed(0)} on subscriptions and fun activities means great value with this card.`;
                }
                return `Your $${topSpending.toFixed(0)} entertainment spending pairs well with this card's reward structure.`;
            }

            // Generic spending match
            if (topSpending > 500) {
                if (rewardsType.includes('cashback') || rewardsType.includes('cash back')) {
                    return `With $${topSpending.toFixed(0)} monthly spending in your top category, you'll earn straightforward cashback on all your purchases.`;
                }
                return `Your $${topSpending.toFixed(0)} in top category spending means this card's rewards will provide excellent value.`;
            }
        }

        // Credit goal alignment (fallback)
        if (userProfile.creditGoal) {
            const goalLower = userProfile.creditGoal.toLowerCase();
            if (goalLower.includes('building') || goalLower.includes('establish')) {
                return "Ideal for building your credit history - this card provides the foundation you need to reach your financial goals.";
            } else if (goalLower.includes('rewards') || goalLower.includes('maximize')) {
                return "Perfect for maximizing rewards - this card aligns with your goal of getting the most value from every purchase.";
            } else if (goalLower.includes('travel')) {
                return "Great for travelers - this card's benefits are designed to make your adventures more rewarding.";
            }
        }

        // Default insight
        return "This card's features and benefits align well with your spending profile and financial goals.";
    };

    // Calculate savings rate for financial health warning
    const calculateSavingsRate = (): number | null => {
        console.log('calculateSavingsRate - userProfile:', userProfile);
        
        if (!userProfile) {
            console.log('calculateSavingsRate - No userProfile');
            return null;
        }
        
        if (!userProfile.purchases || userProfile.purchases.length === 0) {
            console.log('calculateSavingsRate - No purchases');
            return null;
        }

        // Parse annual income
        let annualIncome = 0;
        if (userProfile.annualIncome) {
            const incomeStr = userProfile.annualIncome;
            console.log('calculateSavingsRate - Income string:', incomeStr);
            
            const rangeMatch = incomeStr.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
            if (rangeMatch) {
                const low = parseInt(rangeMatch[1].replace(/,/g, ""));
                const high = parseInt(rangeMatch[2].replace(/,/g, ""));
                annualIncome = (low + high) / 2;
                console.log('calculateSavingsRate - Parsed range income:', annualIncome);
            } else {
                const singleMatch = incomeStr.match(/\$?([\d,]+)/);
                if (singleMatch) {
                    annualIncome = parseInt(singleMatch[1].replace(/,/g, ""));
                    console.log('calculateSavingsRate - Parsed single income:', annualIncome);
                }
            }
        } else {
            console.log('calculateSavingsRate - No annualIncome field');
        }

        if (annualIncome === 0) {
            console.log('calculateSavingsRate - Income is 0, returning null');
            return null;
        }

        // Calculate total spending
        const totalSpending = userProfile.purchases.reduce((sum, p) => sum + p.amount, 0);
        console.log('calculateSavingsRate - Total spending:', totalSpending);
        
        // Estimate monthly values
        const monthlyIncome = annualIncome / 12;
        const monthlySpending = totalSpending / Math.max(1, userProfile.purchases.length / 4);
        
        console.log('calculateSavingsRate - Monthly income:', monthlyIncome);
        console.log('calculateSavingsRate - Monthly spending:', monthlySpending);
        
        // Calculate savings rate
        const savingsRate = ((monthlyIncome - monthlySpending) / monthlyIncome) * 100;
        console.log('calculateSavingsRate - Calculated savings rate:', savingsRate);
        
        return savingsRate;
    };

    const savingsRate = calculateSavingsRate();
    const showFinancialWarning = savingsRate !== null && savingsRate < 15; // Show warning if savings rate below 15%

    // Debug logging
    console.log('CardModal - Savings Rate:', savingsRate);
    console.log('CardModal - Show Warning:', showFinancialWarning);
    console.log('CardModal - User Profile:', userProfile);

    // Calculate pre-approval prediction
    const preapproval = userProfile ? calculatePreapproval(userProfile, card) : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            className="bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                        <div className="relative p-8 rounded-t-xl" style={{ backgroundColor: '#D2A0F0' }}>
                                <button
                                    onClick={onClose}
                                className="absolute top-4 right-4 p-1 z-10 hover:opacity-80 transition-opacity"
                                aria-label="Close modal"
                            >
                                <svg 
                                    width="32" 
                                    height="32" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="white" 
                                    strokeWidth="3" 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                </button>

                            <div className="relative z-10">
                                {/* Card Image and Info - Side by Side */}
                                <div className="flex items-center gap-6">
                                    {/* Card Image - Left Side */}
                                {card.image_url && (
                                        <div className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-lg w-64">
                                        <img
                                            src={card.image_url}
                                            alt={card.name}
                                                className="w-full h-36 object-contain"
                                        />
                                    </div>
                                )}

                                    {/* Card Info - Right Side */}
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-3 text-gray-900 font-manrope">
                                    {card.name}
                                </h2>

                                {similarity !== undefined && (
                                            <div className="inline-block bg-white rounded-full px-4 py-2 shadow-md">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {(similarity * 100).toFixed(0)}% Match
                                        </span>
                                    </div>
                                )}
                                    </div>
                                </div>
                            </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                {/* Pre-Approval Prediction */}
                                {preapproval && (
                                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-md">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 mb-1 font-manrope">
                                                    Pre-Approval Estimate
                                                </h3>
                                                <p className="text-xs text-gray-600">Based on your profile</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold font-manrope text-gray-900">
                                                    {preapproval.probability}%
                                                </div>
                                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    {preapproval.confidence} confidence
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recommendation */}
                                        <p className="text-sm text-gray-700 mb-4 bg-gray-50 rounded-lg p-3">
                                            {preapproval.recommendation}
                                        </p>

                                        {/* Factors */}
                                        <div className="grid grid-cols-1 gap-3">
                                            {/* Positive Factors */}
                                            {preapproval.factors.positive.length > 0 && (
                                                <div className="space-y-1">
                                                    {preapproval.factors.positive.map((factor, i) => (
                                                        <div key={i} className="flex items-start text-xs">
                                                            <span className="mr-2 flex-shrink-0" style={{ color: '#D2A0F0' }}>✓</span>
                                                            <span className="text-gray-700">{factor}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Negative Factors */}
                                            {preapproval.factors.negative.length > 0 && (
                                                <div className="space-y-1">
                                                    {preapproval.factors.negative.map((factor, i) => (
                                                        <div key={i} className="flex items-start text-xs">
                                                            <span className="text-gray-500 mr-2 flex-shrink-0">!</span>
                                                            <span className="text-gray-700">{factor}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Financial Health Warning */}
                                {showFinancialWarning && (
                                    <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200 shadow-md">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-100">
                                                <span className="text-amber-600 text-lg">⚠️</span>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 mb-2 font-manrope">
                                                    Important: Income vs. Spending Balance
                                                </h3>
                                                <div className="text-sm text-gray-700 space-y-2">
                                                    <p>
                                                        Lenders usually look for some margin between income and obligations — they estimate your disposable income (what's left after rent, bills, loans, etc.).
                                                    </p>
                                                    <p>
                                                        As long as you pay bills on time and your bank balance remains stable, this isn't disqualifying. But if your card reports show high balances or missed payments, it could lower odds.
                                                    </p>
                                                    {savingsRate !== null && savingsRate < 0 && (
                                                        <p className="text-amber-700 font-semibold">
                                                            Your current spending exceeds your income. Consider reviewing your budget before applying.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Key Insights - Card Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Annual Fee Card */}
                                    <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1 font-medium">Annual Fee</p>
                                        <p className="text-2xl font-bold text-gray-900 font-manrope">{getAnnualFee()}</p>
                                    </div>

                                    {/* Rewards Type Card */}
                                    {card.rewardsType && (
                                        <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-gray-100">
                                            <p className="text-xs text-gray-500 mb-1 font-medium">Rewards</p>
                                            <p className="text-base font-bold text-gray-900 capitalize">{card.rewardsType}</p>
                                        </div>
                                    )}

                                    {/* Credit Score Card */}
                                    {card.eligibility_requirements?.credit_score && (
                                        <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-gray-100">
                                            <p className="text-xs text-gray-500 mb-1 font-medium">Minimum Credit Needed</p>
                                            <p className="text-base font-bold text-gray-900 capitalize">{card.eligibility_requirements.credit_score}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Personalized Insight */}
                                {getPersonalizedInsight() && (
                                    <div className="rounded-2xl p-5 shadow-md border-2" style={{ 
                                        backgroundColor: '#F8F4FC',
                                        borderColor: '#D2A0F0'
                                    }}>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#D2A0F0' }}>
                                                <span className="text-white text-sm">💡</span>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 mb-1 font-manrope">
                                                    Why This Card Works For You
                                                </h3>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getPersonalizedInsight()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Benefits */}
                                {getBenefitsList().length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-100">
                                        <h3 className="text-base font-bold text-gray-900 mb-4 font-manrope">
                                            ✨ Card Benefits
                                        </h3>
                                        <div className="space-y-3">
                                            {getBenefitsList().slice(0, 8).map((benefit, i) => (
                                                <div key={i} className="flex items-start">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3" style={{ backgroundColor: '#D2A0F0' }}>
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                    <span className="text-sm text-gray-700 leading-relaxed">
                                                            {benefit}
                                                        </span>
                                                </div>
                                            ))}
                                            {getBenefitsList().length > 8 && (
                                                <p className="text-xs text-gray-500 italic mt-2">
                                                    +{getBenefitsList().length - 8} more benefits
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Eligibility */}
                                {(card.eligibility_requirements?.employment_status || 
                                  card.eligibility_requirements?.citizenship || 
                                  card.eligibility_requirements?.income) && (
                                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-100">
                                        <h3 className="text-base font-bold text-gray-900 mb-4 font-manrope">
                                            📋 Additional Requirements
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            {card.eligibility_requirements.employment_status && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Employment:</span>
                                                    <span className="font-medium text-gray-900">{card.eligibility_requirements.employment_status}</span>
                                                </div>
                                            )}
                                            {card.eligibility_requirements.citizenship && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Citizenship:</span>
                                                    <span className="font-medium text-gray-900">{card.eligibility_requirements.citizenship}</span>
                                                </div>
                                            )}
                                            {card.eligibility_requirements.income && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Income:</span>
                                                    <span className="font-medium text-gray-900">{card.eligibility_requirements.income}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* View Roadmap Button */}
                                    <Link
                                        to="/roadmap"
                                        state={{ selectedCard: card }}
                                        onClick={() => {
                                            // Store selected card in localStorage for roadmap
                                            if (card) {
                                                localStorage.setItem('selectedCardForRoadmap', JSON.stringify(card));
                                            }
                                            onClose();
                                        }}
                                        className="flex items-center justify-center gap-2 w-full text-white text-center py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                                        style={{ backgroundColor: '#D2A0F0' }}
                                    >
                                        <MapIcon className="w-5 h-5" />
                                        View Roadmap
                                    </Link>

                                    {/* Apply Now Button */}
                                    {card.application_url ? (
                                        <a
                                            href={card.application_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full bg-black text-white text-center py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                                        >
                                            Apply Now →
                                        </a>
                                    ) : (
                                        <div className="block w-full bg-gray-300 text-gray-500 text-center py-3 rounded-xl font-semibold cursor-not-allowed">
                                            Apply Now →
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
