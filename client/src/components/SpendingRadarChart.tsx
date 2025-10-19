import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

interface SpendingRadarChartProps {
  spendingPattern: {
    restaurants: number;
    travel: number;
    groceries: number;
    gas: number;
    onlineShopping: number;
  };
  topCategory: {
    category: string;
    percentage: number;
  };
}

const chartConfig = {
  spending: {
    label: "Spending %",
    color: "#D2A0F0",
  },
} satisfies ChartConfig

export function SpendingRadarChart({ spendingPattern, topCategory }: SpendingRadarChartProps) {
  // Transform spending pattern data for the chart
  const chartData = [
    { category: "Restaurants", spending: Math.round(spendingPattern.restaurants) },
    { category: "Travel", spending: Math.round(spendingPattern.travel) },
    { category: "Groceries", spending: Math.round(spendingPattern.groceries) },
    { category: "Gas", spending: Math.round(spendingPattern.gas) },
    { category: "Shopping", spending: Math.round(spendingPattern.onlineShopping) },
  ]

  // Find the highest spending category
  const maxSpending = Math.max(...chartData.map(d => d.spending))
  const topSpendingItem = chartData.find(d => d.spending === maxSpending)

  return (
    <Card className="bg-white border-0 shadow-lg">
      <CardHeader className="items-center">
        <CardTitle>Your Spending Style</CardTitle>
        <CardDescription>
          Based on your spending patterns across categories
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              dataKey="spending"
              fill="var(--color-spending)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Top category: {topSpendingItem?.category || topCategory.category} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          {topCategory.percentage.toFixed(1)}% of total spending
        </div>
      </CardFooter>
    </Card>
  )
}

