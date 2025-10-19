import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getRecommendedCards } from "./creditCardMatcher";
import type { UserProfile, CreditCard, UserRank } from "./creditCardMatcher";

export interface CardRecommendation {
    card: CreditCard;
    similarity: number;
}

export interface RecommendationResult {
    rank: UserRank;
    cards: CardRecommendation[];
    loading: boolean;
    error: string | null;
}

/**
 * Hook to get credit card recommendations for the current user
 */
export function useCardRecommendations(userId: string | undefined) {
    const [result, setResult] = useState<RecommendationResult>({
        rank: "journeyman",
        cards: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!userId) {
            setResult({
                rank: "journeyman",
                cards: [],
                loading: false,
                error: "No user ID provided",
            });
            return;
        }

        const fetchRecommendations = async () => {
            try {
                setResult((prev) => ({ ...prev, loading: true, error: null }));

                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, "users", userId));

                if (!userDoc.exists()) {
                    throw new Error("User profile not found");
                }

                const userData = userDoc.data();

                // Check if user has completed the survey
                if (!userData.creditScore || !userData.annualIncome) {
                    setResult({
                        rank: "journeyman",
                        cards: [],
                        loading: false,
                        error: "Please complete the survey first",
                    });
                    return;
                }

                // Create user profile
                const userProfile: UserProfile = {
                    creditScore: userData.creditScore || "",
                    annualIncome: userData.annualIncome || "",
                    employmentStatus: userData.employmentStatus || "",
                    hasCreditCards: userData.hasCreditCards || "no",
                    creditCards: userData.creditCards || [],
                    creditLength: userData.creditLength || "never",
                    latePayments: userData.latePayments || "no",
                    creditGoal: userData.creditGoal || "rewards",
                    citizenshipStatus:
                        userData.citizenshipStatus || "us-citizen",
                    purchases: userData.purchases || [],
                };

                // Get recommendations
                const recommendations = await getRecommendedCards(userProfile);

                setResult({
                    rank: recommendations.rank,
                    cards: recommendations.cards,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error("Error fetching recommendations:", error);
                setResult((prev) => ({
                    ...prev,
                    loading: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch recommendations",
                }));
            }
        };

        fetchRecommendations();
    }, [userId]);

    return result;
}

/**
 * Function to manually fetch recommendations for a user
 */
export async function fetchUserRecommendations(
    userId: string
): Promise<{ rank: UserRank; cards: CardRecommendation[] }> {
    try {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", userId));

        if (!userDoc.exists()) {
            throw new Error("User profile not found");
        }

        const userData = userDoc.data();

        // Check if user has completed the survey
        if (!userData.creditScore || !userData.annualIncome) {
            throw new Error("User has not completed the survey");
        }

        // Create user profile
        const userProfile: UserProfile = {
            creditScore: userData.creditScore || "",
            annualIncome: userData.annualIncome || "",
            employmentStatus: userData.employmentStatus || "",
            hasCreditCards: userData.hasCreditCards || "no",
            creditCards: userData.creditCards || [],
            creditLength: userData.creditLength || "never",
            latePayments: userData.latePayments || "no",
            creditGoal: userData.creditGoal || "rewards",
            citizenshipStatus: userData.citizenshipStatus || "us-citizen",
            purchases: userData.purchases || [],
        };

        // Get recommendations
        const recommendations = await getRecommendedCards(userProfile);

        return recommendations;
    } catch (error) {
        console.error("Error fetching user recommendations:", error);
        throw error;
    }
}

