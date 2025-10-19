import { GoogleGenerativeAI } from "@google/generative-ai";
import cosineSimilarity from "compute-cosine-similarity";
import CreditCardAPI from "credit-card-db-api";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface UserProfile {
    creditScore: string;
    annualIncome: string;
    employmentStatus: string;
    hasCreditCards: string;
    creditCards: string[];
    creditLength: string;
    latePayments: string;
    creditGoal: string;
    citizenshipStatus: string;
    purchases?: Array<{
        merchant_name: string;
        category: string;
        purchase_date: string;
        amount: number;
        status: string;
        description: string;
    }>;
}

export interface CreditCard {
    id?: string;
    name: string;
    bank?: string;
    issuer?: string;
    category?: string;
    type?: string;
    annualFee?: number;
    annual_fee?: string;
    rewardsType?: string;
    benefits?: string | string[];
    creditScoreNeeded?: string;
    image_url?: string;
    application_url?: string;
    eligibility_requirements?: {
        credit_score?: string;
        employment_status?: string;
        citizenship?: string;
        income?: string;
    };
    [key: string]: unknown;
}

export type UserRank = "tenderfoot" | "journeyman" | "mobster";

/**
 * Determine user rank based on their credit profile
 */
export function determineUserRank(user: UserProfile): UserRank {
    const creditScore = user.creditScore.toLowerCase();
    const hasCreditCards = user.hasCreditCards === "yes";
    const creditLength = user.creditLength;

    // Tenderfoot: No credit history or building credit
    if (
        creditScore.includes("no credit") ||
        creditScore.includes("no-credit") ||
        creditScore.includes("never had credit") ||
        creditLength === "never" ||
        creditLength === "<1" ||
        !hasCreditCards ||
        creditScore.includes("bad") ||
        user.creditGoal === "building"
    ) {
        return "tenderfoot";
    }

    // Mobster: Excellent credit with long history
    if (
        creditScore.includes("excellent") &&
        (creditLength === "5-10" || creditLength === "10+") &&
        hasCreditCards &&
        user.creditCards.length > 0
    ) {
        return "mobster";
    }

    // Journeyman: Everyone else (building up from basic cards)
    return "journeyman";
}

/**
 * Check if user meets hard requirements for a card
 */
function meetsHardRequirements(user: UserProfile, card: CreditCard): boolean {
    const requirements = card.eligibility_requirements;
    if (!requirements) return true; // No requirements specified

    // Check student requirement
    if (requirements.employment_status) {
        const reqStatus = requirements.employment_status.toLowerCase();
        const userStatus = user.employmentStatus.toLowerCase();

        if (reqStatus.includes("student") && !userStatus.includes("student")) {
            return false; // Card requires student, user is not
        }
    }

    // Check citizenship requirement
    if (requirements.citizenship) {
        const reqCitizenship = requirements.citizenship.toLowerCase();
        const userCitizenship = user.citizenshipStatus.toLowerCase();

        // Normalize citizenship values
        const isUserCitizen =
            userCitizenship.includes("citizen") ||
            userCitizenship === "us-citizen";
        const isUserResident =
            userCitizenship.includes("resident") || isUserCitizen;

        // If card requires citizen and user is not citizen
        if (
            reqCitizenship.includes("citizen") &&
            !reqCitizenship.includes("resident") &&
            !isUserCitizen
        ) {
            return false;
        }

        // If card requires resident (includes citizens) and user is neither
        if (reqCitizenship.includes("resident") && !isUserResident) {
            return false;
        }
    }

    // Check credit score requirement
    if (requirements.credit_score) {
        const reqScore = requirements.credit_score.toLowerCase();
        const userScore = user.creditScore.toLowerCase();

        // Map credit scores to ranges for comparison
        const scoreMap: Record<string, number> = {
            "no credit": 0,
            bad: 1,
            poor: 1,
            fair: 2,
            good: 3,
            excellent: 4,
        };

        let userScoreLevel = 0;
        let reqScoreLevel = 0;

        for (const [key, value] of Object.entries(scoreMap)) {
            if (userScore.includes(key)) userScoreLevel = value;
            if (reqScore.includes(key)) reqScoreLevel = value;
        }

        // User must meet or exceed required credit score
        if (userScoreLevel < reqScoreLevel) {
            return false;
        }
    }

    return true;
}

/**
 * Filter credit cards based on user rank
 */
function filterCardsByRank(cards: CreditCard[], rank: UserRank): CreditCard[] {
    // Helper to parse annual fee
    const getAnnualFee = (card: CreditCard): number => {
        if (card.annualFee !== undefined) return card.annualFee;
        if (card.annual_fee) {
            const parsed = parseFloat(
                card.annual_fee.replace(/[^0-9.-]+/g, "")
            );
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    switch (rank) {
        case "tenderfoot":
            // Secured cards, student cards, cards for building credit
            return cards.filter((card) => {
                const creditScore =
                    card.creditScoreNeeded ||
                    card.eligibility_requirements?.credit_score ||
                    "";
                return (
                    card.category?.toLowerCase().includes("secured") ||
                    card.category?.toLowerCase().includes("student") ||
                    card.category?.toLowerCase().includes("bad") ||
                    card.category?.toLowerCase().includes("no-credit") ||
                    card.type?.toLowerCase() === "student" ||
                    card.name?.toLowerCase().includes("secured") ||
                    card.name?.toLowerCase().includes("student") ||
                    creditScore.toLowerCase().includes("fair") ||
                    creditScore.toLowerCase().includes("bad") ||
                    creditScore.toLowerCase().includes("poor") ||
                    creditScore.toLowerCase().includes("no credit")
                );
            });

        case "journeyman":
            // Cashback cards, basic rewards cards, no annual fee cards
            return cards.filter((card) => {
                const fee = getAnnualFee(card);
                return (
                    !card.category?.toLowerCase().includes("secured") &&
                    !card.category?.toLowerCase().includes("student") &&
                    !card.category?.toLowerCase().includes("premium") &&
                    card.type?.toLowerCase() !== "student" &&
                    fee < 100 &&
                    (card.rewardsType?.toLowerCase().includes("cashback") ||
                        card.rewardsType?.toLowerCase().includes("rewards") ||
                        card.category?.toLowerCase().includes("cashback") ||
                        card.category?.toLowerCase().includes("cash-back") ||
                        card.category?.toLowerCase().includes("good-credit") ||
                        card.category?.toLowerCase().includes("rewards"))
                );
            });

        case "mobster":
            // Premium cards, travel cards, high annual fee cards with luxury benefits
            return cards.filter((card) => {
                const fee = getAnnualFee(card);
                return (
                    card.category?.toLowerCase().includes("premium") ||
                    card.category?.toLowerCase().includes("travel") ||
                    card.category?.toLowerCase().includes("hotel") ||
                    fee >= 95 ||
                    card.name?.toLowerCase().includes("platinum") ||
                    card.name?.toLowerCase().includes("reserve") ||
                    card.name?.toLowerCase().includes("prestige") ||
                    card.name?.toLowerCase().includes("gold")
                );
            });

        default:
            return cards;
    }
}

/**
 * Create a text representation of user profile for embedding
 */
function userProfileToText(user: UserProfile): string {
    const parts = [
        `Credit score: ${user.creditScore}`,
        `Annual income: ${user.annualIncome}`,
        `Employment: ${user.employmentStatus}`,
        `Credit history length: ${user.creditLength}`,
        `Late payments: ${user.latePayments}`,
        `Credit goal: ${user.creditGoal}`,
        `Citizenship: ${user.citizenshipStatus}`,
    ];

    if (user.hasCreditCards === "yes" && user.creditCards.length > 0) {
        parts.push(`Current cards: ${user.creditCards.join(", ")}`);
    }

    // Add spending patterns if available
    if (user.purchases && user.purchases.length > 0) {
        const categories = user.purchases.map((p) => p.category);
        const uniqueCategories = [...new Set(categories)];
        parts.push(`Spending categories: ${uniqueCategories.join(", ")}`);
    }

    return parts.join(". ");
}

/**
 * Create a text representation of credit card for embedding
 */
function creditCardToText(card: CreditCard): string {
    const parts = [`Card: ${card.name}`];

    // Handle bank/issuer
    const issuer = card.bank || card.issuer;
    if (issuer) {
        parts.push(`Bank: ${issuer}`);
    }

    // Handle category
    if (card.category) {
        parts.push(`Category: ${card.category}`);
    }

    // Handle annual fee (string or number)
    if (card.annualFee !== undefined) {
        parts.push(`Annual fee: $${card.annualFee}`);
    } else if (card.annual_fee) {
        parts.push(`Annual fee: ${card.annual_fee}`);
    }

    // Handle rewards type
    if (card.rewardsType) {
        parts.push(`Rewards: ${card.rewardsType}`);
    }

    // Handle credit score requirements
    const creditScore =
        card.creditScoreNeeded || card.eligibility_requirements?.credit_score;
    if (creditScore) {
        parts.push(`Credit score needed: ${creditScore}`);
    }

    // Handle benefits (string or array)
    if (card.benefits) {
        const benefitsStr = Array.isArray(card.benefits)
            ? card.benefits.join(", ")
            : card.benefits;
        if (benefitsStr) {
            parts.push(`Benefits: ${benefitsStr}`);
        }
    }

    return parts.join(". ");
}

/**
 * Get embeddings for texts using Google Generative AI
 */
async function getEmbeddings(texts: string[]): Promise<number[][]> {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const embeddings: number[][] = [];

        // Process in batches to avoid rate limits
        const batchSize = 10;
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchPromises = batch.map(async (text) => {
                const result = await model.embedContent(text);
                return result.embedding.values;
            });
            const batchResults = await Promise.all(batchPromises);
            embeddings.push(...batchResults);
        }

        return embeddings;
    } catch (error) {
        console.error("Error getting embeddings:", error);
        throw error;
    }
}

/**
 * Boost similarity scores to ensure better match rates
 * Maps scores to a 70-100% range while maintaining relative differences
 */
function boostSimilarityScore(
    rawScore: number,
    minScore: number,
    maxScore: number
): number {
    // Normalize the score to 0-1 range based on min/max
    const range = maxScore - minScore;
    const normalized = range > 0 ? (rawScore - minScore) / range : 0.5;

    // Map to 70-100% range with some non-linearity to spread out the scores
    // Use a power function to maintain differences while boosting scores
    const boosted = 0.7 + 0.3 * Math.pow(normalized, 0.6);

    return Math.min(1, Math.max(0.7, boosted));
}

/**
 * Match user with top credit cards using embeddings
 */
export async function matchUserWithCards(
    user: UserProfile,
    topN: number = 5
): Promise<Array<{ card: CreditCard; similarity: number; rank: UserRank }>> {
    try {
        // Determine user rank
        const userRank = determineUserRank(user);
        console.log(`User rank: ${userRank}`);

        // Get all credit cards
        const api = new CreditCardAPI();
        const allCards = api.getAll();
        console.log(`Total cards in database: ${allCards.length}`);

        // Filter cards by rank
        let filteredCards = filterCardsByRank(allCards, userRank);
        console.log(`Filtered cards for ${userRank}: ${filteredCards.length}`);

        // Apply hard requirement filters
        filteredCards = filteredCards.filter((card) =>
            meetsHardRequirements(user, card)
        );
        console.log(
            `After hard requirements filter: ${filteredCards.length} cards`
        );

        // If we don't have enough cards after filtering, relax rank filter but keep hard requirements
        if (filteredCards.length < topN) {
            console.log("Not enough filtered cards, relaxing rank filter");
            filteredCards = allCards.filter((card) =>
                meetsHardRequirements(user, card)
            );
        }

        // Limit to reasonable number for embedding API
        const cardsToProcess = filteredCards.slice(0, 50);

        // Create text representations
        const userText = userProfileToText(user);
        const cardTexts = cardsToProcess.map(creditCardToText);

        console.log("User profile text:", userText);
        console.log(`Processing ${cardTexts.length} cards for embeddings`);

        // Get embeddings
        const allTexts = [userText, ...cardTexts];
        const embeddings = await getEmbeddings(allTexts);

        const userEmbedding = embeddings[0];
        const cardEmbeddings = embeddings.slice(1);

        // Calculate similarities
        const similarities = cardEmbeddings.map((cardEmbedding, idx) => {
            const rawSimilarity =
                cosineSimilarity(userEmbedding, cardEmbedding) || 0;
            return {
                card: cardsToProcess[idx],
                rawSimilarity,
                rank: userRank,
            };
        });

        // Sort by similarity
        const sortedSimilarities = similarities.sort(
            (a, b) => b.rawSimilarity - a.rawSimilarity
        );

        // Get top N cards
        const topCards = sortedSimilarities.slice(0, topN);

        // Find min and max scores among top cards for boosting
        const scores = topCards.map((c) => c.rawSimilarity);
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);

        // Apply score boosting to ensure 70-100% range
        const boostedTopCards = topCards.map((card) => ({
            card: card.card,
            similarity: boostSimilarityScore(
                card.rawSimilarity,
                minScore,
                maxScore
            ),
            rank: card.rank,
        }));

        console.log(
            "Top matches (boosted):",
            boostedTopCards.map((t) => ({
                name: t.card.name,
                similarity: t.similarity,
                boosted: `${(t.similarity * 100).toFixed(1)}%`,
            }))
        );

        return boostedTopCards;
    } catch (error) {
        console.error("Error matching user with cards:", error);
        throw error;
    }
}

/**
 * Get recommended cards for a user (wrapper function)
 */
export async function getRecommendedCards(user: UserProfile): Promise<{
    rank: UserRank;
    cards: Array<{ card: CreditCard; similarity: number }>;
}> {
    const matches = await matchUserWithCards(user, 5);
    const rank = determineUserRank(user);

    return {
        rank,
        cards: matches.map((m) => ({ card: m.card, similarity: m.similarity })),
    };
}
