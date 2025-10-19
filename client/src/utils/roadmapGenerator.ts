import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface Milestone {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  requirements: string[];
  reward_xp: number;
}

export interface UserData {
  bankLinked?: boolean;
  creditScore?: string;
  annualIncome?: string;
  employmentStatus?: string;
  hasCreditCards?: string;
  creditCards?: string[];
  creditLength?: string;
  latePayments?: string;
  creditGoal?: string;
  citizenshipStatus?: string;
  customerName?: string;
  numPurchases?: number;
  purchases?: Array<{
    merchant_name: string;
    category: string;
    purchase_date: string;
    amount: number;
    status: string;
    description: string;
  }>;
}

/**
 * Generate personalized roadmap using Gemini API
 */
export async function generatePersonalizedRoadmap(
  userData: UserData,
  allMilestones: Milestone[]
): Promise<Milestone[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a credit roadmap advisor. Given a user's financial data and the available milestones,
select the 5 most relevant milestones that the user should focus on next.
Return only a JSON array of milestone IDs.`;

    const userPrompt = `User profile:
${JSON.stringify(userData, null, 2)}

Available milestones:
${JSON.stringify(allMilestones, null, 2)}

Rules:
- Pick exactly 5.
- Avoid duplicates.
- Prefer earlier milestones if the user's score is below 700.
- Return JSON only, like: ["starter_card", "build_700_score", "add_second_card", "maximize_cashback", "upgrade_card"]`;

    const prompt = `${systemPrompt}\n\n${userPrompt}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    // Remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const milestoneIds = JSON.parse(cleanedText) as string[];

    // Map IDs to actual milestone objects
    const selectedMilestones = milestoneIds
      .map((id) => allMilestones.find((m) => m.id === id))
      .filter((m): m is Milestone => m !== undefined)
      .slice(0, 5); // Ensure exactly 5

    return selectedMilestones;
  } catch (error) {
    console.error("Error generating personalized roadmap:", error);
    // Fallback to default recommendations based on credit score
    return getFallbackRoadmap(userData, allMilestones);
  }
}

/**
 * Fallback roadmap if API fails
 */
function getFallbackRoadmap(
  userData: UserData,
  allMilestones: Milestone[]
): Milestone[] {
  const creditScore = userData.creditScore?.toLowerCase() || "";
  const creditLength = userData.creditLength || "";

  // Beginner: No credit or bad credit
  if (
    creditScore.includes("no credit") ||
    creditScore.includes("no-credit") ||
    creditScore.includes("bad") ||
    creditLength === "never" ||
    creditLength === "<1"
  ) {
    return [
      "starter_card",
      "monitor_credit_report",
      "pay_off_balance",
      "lower_utilization",
      "build_700_score",
    ]
      .map((id) => allMilestones.find((m) => m.id === id))
      .filter((m): m is Milestone => m !== undefined);
  }

  // Fair credit
  if (creditScore.includes("fair")) {
    return [
      "build_700_score",
      "pay_off_balance",
      "lower_utilization",
      "add_second_card",
      "monitor_credit_report",
    ]
      .map((id) => allMilestones.find((m) => m.id === id))
      .filter((m): m is Milestone => m !== undefined);
  }

  // Good credit
  if (creditScore.includes("good")) {
    return [
      "add_second_card",
      "maximize_cashback",
      "earn_travel_points",
      "lower_utilization",
      "build_700_score",
    ]
      .map((id) => allMilestones.find((m) => m.id === id))
      .filter((m): m is Milestone => m !== undefined);
  }

  // Excellent credit
  if (creditScore.includes("excellent")) {
    return [
      "upgrade_card",
      "earn_travel_points",
      "maximize_cashback",
      "perfect_utilization",
      "add_second_card",
    ]
      .map((id) => allMilestones.find((m) => m.id === id))
      .filter((m): m is Milestone => m !== undefined);
  }

  // Default fallback
  return allMilestones.slice(0, 5);
}
