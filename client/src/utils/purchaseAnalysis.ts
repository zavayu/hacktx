// Utility functions for analyzing purchase data

export interface Purchase {
  merchant_id: string;
  merchant_name: string;
  category: string;
  medium: string;
  purchase_date: string;
  amount: number;
  status: string;
  description: string;
}

export interface CategoryAnalysis {
  category: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  percentage: number;
}

export interface SpendingProfile {
  totalSpent: number;
  categories: CategoryAnalysis[];
  topCategory: CategoryAnalysis;
  spendingPattern: {
    restaurants: number;
    travel: number;
    groceries: number;
    gas: number;
    onlineShopping: number;
    streamingServices: number;
    hotel: number;
    airportLounge: number;
  };
}

/**
 * Parse purchases array into category analysis
 */
export function analyzePurchases(purchases: Purchase[]): SpendingProfile {
  // Safety check for undefined or null purchases
  if (!purchases || !Array.isArray(purchases)) {
    return {
      totalSpent: 0,
      categories: [],
      topCategory: { category: '', totalAmount: 0, transactionCount: 0, averageAmount: 0, percentage: 0 },
      spendingPattern: {
        restaurants: 0,
        travel: 0,
        groceries: 0,
        gas: 0,
        onlineShopping: 0,
        streamingServices: 0,
        hotel: 0,
        airportLounge: 0,
      }
    };
  }

  // Group purchases by category
  const categoryMap = new Map<string, Purchase[]>();
  
  purchases.forEach(purchase => {
    const category = purchase.category;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(purchase);
  });

  // Calculate totals and percentages
  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  
  const categories: CategoryAnalysis[] = Array.from(categoryMap.entries()).map(([category, categoryPurchases]) => {
    const totalAmount = categoryPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    return {
      category,
      totalAmount,
      transactionCount: categoryPurchases.length,
      averageAmount: totalAmount / categoryPurchases.length,
      percentage: (totalAmount / totalSpent) * 100
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  // Create spending pattern for radar chart
  const spendingPattern = {
    restaurants: categories.find(c => c.category === 'restaurants')?.percentage || 0,
    travel: categories.find(c => c.category === 'travel')?.percentage || 0,
    groceries: categories.find(c => c.category === 'groceries')?.percentage || 0,
    gas: categories.find(c => c.category === 'gas')?.percentage || 0,
    onlineShopping: categories.find(c => c.category === 'online-shopping')?.percentage || 0,
    streamingServices: categories.find(c => c.category === 'streaming-services')?.percentage || 0,
    hotel: categories.find(c => c.category === 'hotel')?.percentage || 0,
    airportLounge: categories.find(c => c.category === 'airport-lounge')?.percentage || 0,
  };

  return {
    totalSpent,
    categories,
    topCategory: categories[0] || { category: '', totalAmount: 0, transactionCount: 0, averageAmount: 0, percentage: 0 },
    spendingPattern
  };
}

/**
 * Get spending insights for dashboard
 */
export function getSpendingInsights(profile: SpendingProfile): string[] {
  const insights: string[] = [];
  
  // Safety check for empty profile
  if (!profile || !profile.topCategory || !profile.spendingPattern) {
    return ["No spending data available. Complete the survey to see personalized insights!"];
  }
  
  if (profile.topCategory.category === 'restaurants') {
    insights.push("You're a food enthusiast! Consider dining rewards cards.");
  }
  
  if (profile.spendingPattern.travel > 20) {
    insights.push("High travel spending detected. Travel rewards cards could maximize your benefits.");
  }
  
  if (profile.spendingPattern.gas > 15) {
    insights.push("Frequent driver detected. Gas rewards cards could save you money.");
  }
  
  if (profile.spendingPattern.onlineShopping > 25) {
    insights.push("Online shopping enthusiast! Consider cards with online purchase bonuses.");
  }
  
  if (profile.spendingPattern.groceries > 20) {
    insights.push("Grocery rewards cards could help you save on everyday purchases.");
  }
  
  return insights;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}
