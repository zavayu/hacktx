/**
 * Test file for credit card matching system
 * Run this with: npm run dev (or create a test script)
 */

import { matchUserWithCards, determineUserRank } from "./creditCardMatcher";
import type { UserProfile } from "./creditCardMatcher";

// Sample user profiles for testing
const testUsers: Record<string, UserProfile> = {
    noCredit: {
        creditScore: "No Credit / Never Had Credit",
        annualIncome: "< $25,000",
        employmentStatus: "student",
        hasCreditCards: "no",
        creditCards: [],
        creditLength: "never",
        latePayments: "no",
        creditGoal: "building",
        citizenshipStatus: "us-citizen",
    },
    tenderfoot: {
        creditScore: "Bad (350-629)",
        annualIncome: "< $25,000",
        employmentStatus: "student",
        hasCreditCards: "no",
        creditCards: [],
        creditLength: "never",
        latePayments: "no",
        creditGoal: "building",
        citizenshipStatus: "us-citizen",
    },
    journeyman: {
        creditScore: "Good (690-719)",
        annualIncome: "$50,000 - $75,000",
        employmentStatus: "full-time",
        hasCreditCards: "yes",
        creditCards: ["Discover It Cash Back"],
        creditLength: "1-2",
        latePayments: "no",
        creditGoal: "rewards",
        citizenshipStatus: "us-citizen",
    },
    mobster: {
        creditScore: "Excellent (720-850)",
        annualIncome: "$150,000 - $250,000",
        employmentStatus: "full-time",
        hasCreditCards: "yes",
        creditCards: ["Chase Sapphire Preferred", "American Express Gold"],
        creditLength: "10+",
        latePayments: "no",
        creditGoal: "travel",
        citizenshipStatus: "us-citizen",
        purchases: [
            {
                merchant_name: "United Airlines",
                category: "travel",
                purchase_date: "2024-01-15",
                amount: 500,
                status: "completed",
                description: "United Airlines - travel",
            },
            {
                merchant_name: "Fine Dining Restaurant",
                category: "restaurants",
                purchase_date: "2024-01-20",
                amount: 300,
                status: "completed",
                description: "Fine Dining Restaurant - restaurants",
            },
            {
                merchant_name: "Luxury Hotel",
                category: "hotel",
                purchase_date: "2024-01-25",
                amount: 800,
                status: "completed",
                description: "Luxury Hotel - hotel",
            },
        ],
    },
};

/**
 * Test the card matching system
 */
export async function testCardMatcher() {
    console.log("=== Testing Credit Card Matcher ===\n");

    for (const [rankType, userProfile] of Object.entries(testUsers)) {
        console.log(`\n--- Testing ${rankType.toUpperCase()} User ---`);

        // Determine rank
        const rank = determineUserRank(userProfile);
        console.log(`Determined rank: ${rank}`);
        console.log(`User profile:`, {
            creditScore: userProfile.creditScore,
            income: userProfile.annualIncome,
            creditLength: userProfile.creditLength,
            goal: userProfile.creditGoal,
        });

        try {
            // Get card matches
            const matches = await matchUserWithCards(userProfile, 5);

            console.log(`\nTop 5 recommended cards:`);
            matches.forEach((match, idx) => {
                console.log(
                    `${idx + 1}. ${match.card.name} (${match.card.bank})`
                );
                console.log(
                    `   Similarity: ${(match.similarity * 100).toFixed(2)}%`
                );
                console.log(`   Category: ${match.card.category || "N/A"}`);
                if (match.card.annualFee !== undefined) {
                    console.log(`   Annual Fee: $${match.card.annualFee}`);
                }
                console.log("");
            });
        } catch (error) {
            console.error(`Error testing ${rankType}:`, error);
        }
    }
}

/**
 * Quick test for a single user
 */
export async function quickTest() {
    console.log("=== Quick Test ===\n");

    const testUser: UserProfile = testUsers.journeyman;

    console.log("Testing with journeyman profile...");
    const rank = determineUserRank(testUser);
    console.log(`Rank: ${rank}\n`);

    const matches = await matchUserWithCards(testUser, 5);

    console.log("Top 5 matches:");
    matches.forEach((m, i) => {
        console.log(
            `${i + 1}. ${m.card.name} - ${(m.similarity * 100).toFixed(2)}%`
        );
    });
}

// Uncomment to run the test
// testCardMatcher().catch(console.error);
// quickTest().catch(console.error);
