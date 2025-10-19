import type { UserProfile, CreditCard } from "./creditCardMatcher";

export interface PreapprovalResult {
    probability: number; // 0-100
    confidence: "high" | "medium" | "low";
    recommendation: string;
    factors: {
        positive: string[];
        negative: string[];
    };
}

/**
 * Calculate pre-approval probability based on user profile and card requirements
 * This uses a multi-factor scoring system to estimate approval chances
 */
export function calculatePreapproval(
    user: UserProfile,
    card: CreditCard
): PreapprovalResult {
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    let confidence: "high" | "medium" | "low" = "medium";

    // Parse numeric values from string fields
    const creditScore = parseInt(user.creditScore) || 0;
    const annualIncome = parseAnnualIncome(user.annualIncome);
    const annualFee = getAnnualFeeAmount(card);

    // Determine card tier/difficulty
    const cardCategory = card.category?.toLowerCase() || "";
    const cardName = card.name.toLowerCase();
    const creditRequirement = getCreditScoreRequirement(card);
    
    let cardTier: "starter" | "standard" | "premium" = "standard";
    let baseScore = 60;
    
    // Identify card tier
    if (
        cardCategory.includes("secured") ||
        cardCategory.includes("student") ||
        cardName.includes("student") ||
        cardName.includes("secured") ||
        annualFee === 0 && creditRequirement === "poor"
    ) {
        cardTier = "starter";
        baseScore = 75; // Starter cards have higher base approval
        positiveFactors.push("Starter-friendly card");
    } else if (
        cardCategory.includes("premium") ||
        annualFee > 400 ||
        creditRequirement === "excellent"
    ) {
        cardTier = "premium";
        baseScore = 45; // Premium cards start lower
    }
    
    let score = baseScore;

    // Factor 1: Credit Score - adjusted by card tier
    if (cardTier === "starter") {
        // Starter cards are very lenient with credit scores
        if (creditScore >= 700) {
            score += 20;
            positiveFactors.push("Excellent credit for a starter card");
        } else if (creditScore >= 650) {
            score += 15;
            positiveFactors.push("Good credit for this card type");
        } else if (creditScore >= 580) {
            score += 10;
            positiveFactors.push("Fair credit - acceptable for starter cards");
        } else if (creditScore >= 500) {
            score += 5;
            positiveFactors.push("Building credit - secured cards available");
        } else {
            score += 0;
            negativeFactors.push("Very low credit - consider secured options");
        }
    } else if (cardTier === "premium") {
        // Premium cards are strict
        if (creditScore >= 800) {
            score += 35;
            positiveFactors.push("Exceptional credit score (800+)");
        } else if (creditScore >= 750) {
            score += 28;
            positiveFactors.push("Excellent credit score (750-799)");
        } else if (creditScore >= 720) {
            score += 18;
            positiveFactors.push("Good credit score (720-749)");
        } else if (creditScore >= 700) {
            score += 8;
            positiveFactors.push("Credit score meets minimum for premium");
            negativeFactors.push("On the lower end for premium cards");
        } else {
            score -= 20;
            negativeFactors.push("Credit score below premium card requirements");
        }
    } else {
        // Standard cards - moderate requirements
        if (creditScore >= 750) {
            score += 30;
            positiveFactors.push("Excellent credit score");
        } else if (creditScore >= 700) {
            score += 22;
            positiveFactors.push("Good credit score");
        } else if (creditScore >= 670) {
            score += 15;
            positiveFactors.push("Fair to good credit score");
        } else if (creditScore >= 620) {
            score += 8;
            positiveFactors.push("Fair credit score");
            if (creditRequirement === "excellent" || creditRequirement === "good") {
                score -= 10;
                negativeFactors.push("Credit slightly below typical requirements");
            }
        } else {
            score -= 5;
            negativeFactors.push("Credit score needs improvement");
            if (creditRequirement === "excellent" || creditRequirement === "good") {
                score -= 15;
            }
        }
    }

    // Factor 2: Income - adjusted by card tier
    if (cardTier === "starter") {
        // Starter cards have minimal income requirements
        if (annualIncome > 0) {
            if (annualIncome >= 25000) {
                score += 12;
                positiveFactors.push("Income meets starter card requirements");
            } else if (annualIncome >= 15000) {
                score += 8;
                positiveFactors.push("Income sufficient for starter cards");
            } else {
                score += 5;
            }
        } else {
            score += 8; // Many starter cards don't require income proof
        }
    } else if (cardTier === "premium") {
        // Premium cards have strict income requirements
        if (annualIncome >= 100000) {
            score += 20;
            positiveFactors.push("Strong income level for premium card");
            if (annualFee > 500) {
                score += 2;
            }
        } else if (annualIncome >= 75000) {
            score += 12;
            positiveFactors.push("Good income level");
            if (annualFee > 500) {
                score -= 3;
                negativeFactors.push("High annual fee relative to income");
            }
        } else if (annualIncome >= 50000) {
            score += 5;
            negativeFactors.push("Income on lower end for premium cards");
        } else {
            score -= 10;
            negativeFactors.push("Income below typical premium card requirements");
        }
    } else {
        // Standard cards - moderate income requirements
        if (annualIncome > 0) {
            if (annualIncome >= 75000) {
                score += 15;
                positiveFactors.push("Strong income level");
            } else if (annualIncome >= 50000) {
                score += 12;
                positiveFactors.push("Solid income level");
            } else if (annualIncome >= 35000) {
                score += 8;
                positiveFactors.push("Moderate income level");
                if (annualFee > 200) {
                    score -= 3;
                }
            } else if (annualIncome >= 25000) {
                score += 5;
                if (annualFee > 100) {
                    score -= 2;
                }
            } else {
                score += 2;
            }
            
            // Check income requirements
            const minIncome = card.eligibility_requirements?.income;
            if (minIncome) {
                const minIncomeNum = parseIncomeRequirement(minIncome);
                if (annualIncome < minIncomeNum) {
                    score -= 10;
                    negativeFactors.push(`Income below stated minimum`);
                } else {
                    positiveFactors.push("Meets income requirements");
                    score += 2;
                }
            }
        } else {
            score += 5;
        }
    }

    // Factor 3: Employment Status - adjusted by card tier
    if (user.employmentStatus) {
        const empLower = user.employmentStatus.toLowerCase();
        if (empLower.includes("full-time") || empLower.includes("full time")) {
            score += (cardTier === "starter" ? 10 : 12);
            positiveFactors.push("Stable full-time employment");
        } else if (empLower.includes("part-time") || empLower.includes("part time")) {
            score += (cardTier === "starter" ? 8 : cardTier === "premium" ? 3 : 8);
            if (cardTier !== "premium") {
                positiveFactors.push("Part-time employment");
            }
        } else if (empLower.includes("self-employed")) {
            score += (cardTier === "premium" ? 8 : 9);
            positiveFactors.push("Self-employed with income");
        } else if (empLower.includes("unemployed")) {
            if (cardTier === "starter") {
                score += 0; // Neutral for starter cards
            } else {
                score -= (cardTier === "premium" ? 15 : 8);
                negativeFactors.push("No current employment");
            }
        } else if (empLower.includes("student")) {
            score += (cardTier === "starter" ? 10 : 6);
            if (cardName.includes("student") || cardCategory.includes("student")) {
                score += 10;
                positiveFactors.push("Student card designed for you");
            }
        }
    } else {
        score += (cardTier === "starter" ? 8 : 5);
    }

    // Factor 4: Credit History & Spending Pattern
    if (user.purchases && user.purchases.length > 0) {
        const totalSpending = user.purchases.reduce((sum, p) => sum + p.amount, 0);
        const avgMonthlySpending = totalSpending / Math.max(1, user.purchases.length / 4);
        
        if (avgMonthlySpending > 2000) {
            score += 10;
            positiveFactors.push("Strong spending history");
        } else if (avgMonthlySpending > 1000) {
            score += 7;
            positiveFactors.push("Good spending history");
        } else if (avgMonthlySpending > 500) {
            score += 5;
            positiveFactors.push("Moderate spending history");
        } else {
            score += 3;
        }

        // Check if spending matches card rewards
        const categories = user.purchases.map(p => p.category);
        const rewardsType = card.rewardsType?.toLowerCase() || "";
        
        if (rewardsType.includes("travel") && categories.some(c => c.includes("travel"))) {
            score += 3;
            positiveFactors.push("Spending aligns with card rewards");
        } else if (rewardsType.includes("dining") && categories.some(c => c.includes("restaurant"))) {
            score += 3;
            positiveFactors.push("Spending aligns with card rewards");
        }
    } else {
        score += 2;
        // Don't penalize for no purchase data
    }

    // Cap score between 10 and 95
    score = Math.max(10, Math.min(95, score));

    // Determine confidence level based on data completeness and score
    if (
        (creditScore >= 720 && annualIncome >= 50000) ||
        (creditScore >= 780) ||
        (score >= 85)
    ) {
        confidence = "high";
    } else if (
        creditScore < 580 ||
        (annualIncome > 0 && annualIncome < 20000) ||
        (score < 40)
    ) {
        confidence = "low";
    } else {
        confidence = "medium";
    }

    // Generate recommendation
    const recommendation = generateRecommendation(score, user, card, annualFee);

    return {
        probability: Math.round(score),
        confidence,
        recommendation,
        factors: {
            positive: positiveFactors,
            negative: negativeFactors,
        },
    };
}

/**
 * Helper function to determine credit score requirement from card data
 */
function getCreditScoreRequirement(card: CreditCard): string {
    const creditReq = card.eligibility_requirements?.credit_score?.toLowerCase() || "";
    
    if (creditReq.includes("excellent") || creditReq.includes("750")) {
        return "excellent";
    } else if (creditReq.includes("good") || creditReq.includes("700")) {
        return "good";
    } else if (creditReq.includes("fair") || creditReq.includes("650")) {
        return "fair";
    } else if (creditReq.includes("poor") || creditReq.includes("secured")) {
        return "poor";
    }
    
    // Default based on category
    const category = card.category?.toLowerCase() || "";
    if (category.includes("premium")) return "excellent";
    if (category.includes("secured")) return "poor";
    
    return "good"; // default assumption
}

/**
 * Helper function to extract annual fee amount
 */
function getAnnualFeeAmount(card: CreditCard): number {
    if (typeof card.annualFee === "number") {
        return card.annualFee;
    }
    
    if (card.annual_fee) {
        const feeStr = card.annual_fee.toString();
        const match = feeStr.match(/\$?(\d+)/);
        if (match) {
            return parseInt(match[1]);
        }
    }
    
    return 0;
}

/**
 * Helper function to parse income requirements
 */
function parseIncomeRequirement(income: string): number {
    const cleanedIncome = income.replace(/[,$]/g, "");
    const match = cleanedIncome.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Helper function to parse annual income from string
 */
function parseAnnualIncome(income: string): number {
    if (!income) return 0;
    
    // If it's a range like "$25,000 - $50,000", take the average
    const rangeMatch = income.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
    if (rangeMatch) {
        const low = parseInt(rangeMatch[1].replace(/,/g, ""));
        const high = parseInt(rangeMatch[2].replace(/,/g, ""));
        return (low + high) / 2;
    }
    
    // If it's a single number like "$50,000" or "50000"
    const singleMatch = income.match(/\$?([\d,]+)/);
    if (singleMatch) {
        return parseInt(singleMatch[1].replace(/,/g, ""));
    }
    
    return 0;
}

/**
 * Generate personalized recommendation text
 */
function generateRecommendation(
    score: number,
    user: UserProfile,
    card: CreditCard,
    annualFee: number
): string {
    const creditScore = parseInt(user.creditScore) || 0;
    
    if (score >= 85) {
        return `You're an excellent candidate for this card! Your credit profile strongly aligns with the requirements. ${
            annualFee > 300
                ? "The benefits and rewards should easily offset the annual fee."
                : annualFee > 0
                ? "The annual fee is reasonable for the benefits offered."
                : "Plus, there's no annual fee!"
        } You have a very high chance of approval.`;
    } else if (score >= 70) {
        return `You have a strong chance of approval for this card. ${
            creditScore >= 700
                ? "Your credit profile is solid and meets most requirements."
                : "Continue building your credit to improve your odds further."
        } ${annualFee > 200 ? "Consider whether the annual fee fits your budget." : ""}`;
    } else if (score >= 55) {
        return `You have a fair chance of approval for this card. ${
            creditScore < 680
                ? "Improving your credit score would significantly boost your chances."
                : "Your profile meets many of the basic requirements."
        } ${
            annualFee > 0
                ? "Make sure the annual fee is worth it for your spending habits."
                : "The lack of annual fee makes this a good option to try."
        }`;
    } else if (score >= 35) {
        return `Approval is possible but less certain. ${
            creditScore < 650
                ? "Focus on building your credit score before applying."
                : "You may want to strengthen your credit profile first."
        } ${
            annualFee > 0
                ? "Consider no-annual-fee cards as alternatives."
                : "Starting with this card could help build your credit."
        }`;
    } else {
        return `This card may be challenging to get approved for right now. ${
            creditScore < 600
                ? "A secured card would be an excellent starting point to build credit."
                : "Consider cards specifically designed for your credit profile."
        } Focus on improving the factors listed above to boost your approval chances.`;
    }
}
