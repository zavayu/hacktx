import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Filter } from "lucide-react"
import { formatCurrency } from "../utils/purchaseAnalysis"
import type { CategoryAnalysis, Purchase } from "../utils/purchaseAnalysis"

interface FinancialInsightsProps {
  categories: CategoryAnalysis[]
  totalSpent: number
  annualIncome?: string
  purchases?: Purchase[]
}

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
  restaurants: "🍔",
  travel: "✈️",
  hotel: "🏨",
  "streaming-services": "📺",
  groceries: "🛒",
  gas: "⛽",
  "online-shopping": "🛍️",
  "airport-lounge": "🛫",
  entertainment: "🎬",
  utilities: "💡",
  healthcare: "🏥",
  fitness: "💪",
  education: "📚",
  "personal-care": "💅",
  other: "📦",
}

export function FinancialInsights({
  categories,
  totalSpent,
  annualIncome,
  purchases = [],
}: FinancialInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"expenses" | "income">("expenses")
  const [sortAscending, setSortAscending] = useState(false)
  // Parse income range and calculate average monthly income
  const parseIncomeRange = (incomeLabel?: string): number => {
    if (!incomeLabel) return 0
    
    // Handle "< $25,000" format
    if (incomeLabel.includes("<")) {
      const amount = parseFloat(incomeLabel.replace(/[^0-9]/g, ""))
      return amount / 12 // Return monthly
    }
    
    // Handle "$25,000 - $50,000" format
    const matches = incomeLabel.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/)
    if (matches) {
      const min = parseFloat(matches[1].replace(/,/g, ""))
      const max = parseFloat(matches[2].replace(/,/g, ""))
      const average = (min + max) / 2
      return average / 12 // Return monthly
    }
    
    return 0
  }

  const monthlyIncome = parseIncomeRange(annualIncome)

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Pastel colors for category cards
  const pastelColors = [
    "bg-pink-100",
    "bg-purple-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-orange-100",
    "bg-red-100",
    "bg-indigo-100",
    "bg-rose-100",
    "bg-cyan-100",
  ]
  
  // Ensure we always have at least "personal-care" and "other" categories
  const displayCategories = [...categories]
  
  // Add personal-care if not present
  if (!displayCategories.find(c => c.category === "personal-care")) {
    displayCategories.push({
      category: "personal-care",
      totalAmount: 0,
      transactionCount: 0,
      averageAmount: 0,
      percentage: 0,
    })
  }
  
  // Add other if not present
  if (!displayCategories.find(c => c.category === "other")) {
    displayCategories.push({
      category: "other",
      totalAmount: 0,
      transactionCount: 0,
      averageAmount: 0,
      percentage: 0,
    })
  }
  
  // Take first 10 categories (2 columns x 5 rows) and sort based on filter
  const categoryDisplay = [...displayCategories]
    .sort((a, b) => {
      if (sortAscending) {
        return a.totalAmount - b.totalAmount // Low to high
      }
      return b.totalAmount - a.totalAmount // High to low (default)
    })
    .slice(0, 10)

  // Get transactions for selected category
  const getCategoryTransactions = (categoryName: string) => {
    return purchases.filter((p) => p.category === categoryName)
  }

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setIsDialogOpen(true)
  }

  const selectedCategoryData = categoryDisplay.find(
    (c) => c.category === selectedCategory
  )
  const categoryTransactions = selectedCategory
    ? getCategoryTransactions(selectedCategory)
    : []

  return (
    <>
      <Card className="bg-white border-0 h-full flex flex-col">
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {viewMode === "expenses" && (
            <div className="space-y-3">
            {/* Total Spending with Dropdown and Filter */}
            <div className="flex items-start justify-between py-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Total Spending</p>
                <p className="text-2xl font-bold text-gray-900 font-manrope">
                  {formatCurrency(totalSpent)}
                </p>
                {monthlyIncome > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {((totalSpent / monthlyIncome) * 100).toFixed(1)}% of monthly
                    income
                  </p>
                )}
              </div>
              
              {/* View Selector and Filter */}
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={(value: "expenses" | "income") => setViewMode(value)}>
                  <SelectTrigger className="w-[140px] bg-white border-0 shadow-sm text-gray-700 text-sm focus:ring-1 focus:ring-purple-200">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="expenses">💸 Expenses</SelectItem>
                    <SelectItem value="income">💰 Income</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={() => setSortAscending(!sortAscending)}
                  className="p-2 rounded-md border-0 shadow-sm hover:bg-purple-50 transition-all duration-200 group"
                  aria-label={sortAscending ? "Sort high to low" : "Sort low to high"}
                  title={sortAscending ? "Sort high to low" : "Sort low to high"}
                >
                  <Filter className={`h-4 w-4 text-gray-600 group-hover:text-purple-600 transition-all duration-300 ${sortAscending ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </div>
            </div>

            {/* Category Breakdown - 2 Column Grid */}
            <div>
              {/* <p className="text-xs text-gray-500 mb-2 font-medium">
                Spending by Category
              </p> */}
              <div className="grid grid-cols-2 gap-2">
                {categoryDisplay.map((category, index) => {
                  const emoji =
                    categoryEmojis[category.category] || categoryEmojis.other
                  const colorClass = pastelColors[index % pastelColors.length]
                  return (
                    <div
                      key={category.category}
                      onClick={() => handleCategoryClick(category.category)}
                      className={`${colorClass} rounded-lg p-3 transition-all duration-500 hover:scale-105 cursor-pointer animate-in fade-in slide-in-from-bottom-2`}
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'backwards'
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xl flex-shrink-0">{emoji}</span>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="font-semibold text-gray-900 text-xs truncate">
                            {formatCategoryName(category.category)}
                          </p>
                          <p className="font-bold text-gray-900 text-sm">
                            {formatCurrency(category.totalAmount)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {category.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            </div>
          )}

          {viewMode === "income" && (
            <div className="space-y-3">
            {/* Monthly Income with Dropdown and Filter */}
            <div className="flex items-start justify-between py-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">
                  Monthly Income {annualIncome && "(Estimated)"}
                </p>
                <p className="text-2xl font-bold text-gray-900 font-manrope">
                  {monthlyIncome > 0
                    ? formatCurrency(monthlyIncome)
                    : "Not provided"}
                </p>
                {annualIncome && (
                  <>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Based on range: {annualIncome}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 italic">
                      ⓘ Calculated as average of income range
                    </p>
                </>
              )}
            </div>
              
              {/* View Selector and Filter */}
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={(value: "expenses" | "income") => setViewMode(value)}>
                  <SelectTrigger className="w-[140px] bg-white border-0 shadow-sm text-gray-700 text-sm focus:ring-1 focus:ring-purple-200">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="expenses">💸 Expenses</SelectItem>
                    <SelectItem value="income">💰 Income</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={() => setSortAscending(!sortAscending)}
                  className="p-2 rounded-md border-0 shadow-sm hover:bg-purple-50 transition-all duration-200 group"
                  aria-label={sortAscending ? "Sort high to low" : "Sort low to high"}
                  title={sortAscending ? "Sort high to low" : "Sort low to high"}
                >
                  <Filter className={`h-4 w-4 text-gray-600 group-hover:text-purple-600 transition-all duration-300 ${sortAscending ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </div>
            </div>

            {/* Income vs Expenses */}
            {monthlyIncome > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">
                  Financial Overview
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600">💰 Income</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(monthlyIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600">💸 Expenses</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-xs font-medium text-gray-900">
                      💵 Net
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        monthlyIncome - totalSpent >= 0
                          ? "text-purple-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(monthlyIncome - totalSpent)}
                    </span>
                  </div>
                </div>

                {/* Savings Rate */}
                <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-600">Savings Rate</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {(((monthlyIncome - totalSpent) / monthlyIncome) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((monthlyIncome - totalSpent) / monthlyIncome) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!annualIncome && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No income data available</p>
                <p className="text-xs mt-1">
                  Income information helps us provide better insights
                </p>
              </div>
            )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <span className="text-3xl">
                {selectedCategory
                  ? categoryEmojis[selectedCategory] || categoryEmojis.other
                  : ""}
              </span>
              {selectedCategory && formatCategoryName(selectedCategory)}
            </DialogTitle>
            <DialogDescription>
              {selectedCategoryData && (
                <div className="mt-2 space-y-1">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedCategoryData.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedCategoryData.transactionCount} transaction
                    {selectedCategoryData.transactionCount !== 1 ? "s" : ""} •{" "}
                    {selectedCategoryData.percentage.toFixed(1)}% of spending
                  </p>
                  <p className="text-sm text-gray-600">
                    Average: {formatCurrency(selectedCategoryData.averageAmount)}{" "}
                    per transaction
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Transaction List */}
          <div className="mt-4">
            {categoryTransactions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Recent Transactions
                </p>
                {categoryTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {transaction.merchant_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.purchase_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No transactions in this category yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

