// components/PerformanceChart.tsx
'use client'

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "./ui/chart"

// Your performance data
const performanceData = [
  { attempt: 'Quiz 1', bestScore: 65, avgScore: 45, percentile: 75 },
  { attempt: 'Quiz 2', bestScore: 72, avgScore: 58, percentile: 82 },
  
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const PerformanceChart = () => {
  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Performance Analytics</CardTitle>
            <CardDescription className="text-gray-400">
              Your quiz performance over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">+12.5% growth</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
      
        <div className="h-[300px] w-full"><ChartContainer config={chartConfig}>
          
            <AreaChart
              data={performanceData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              {/* Define gradients */}
              <defs>
                <linearGradient id="bestScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="avgScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="percentile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0.2} />
                </linearGradient>
              </defs>

              {/* Grid and Axes */}
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="attempt" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              />

              {/* Area Components */}
              <Area
                type="monotone"
                dataKey="bestScore"
                stroke="#818cf8"
                fill="url(#bestScore)"
                name="Best Score"
              />
              <Area
                type="monotone"
                dataKey="avgScore"
                stroke="#34d399"
                fill="url(#avgScore)"
                name="Average Score"
              />
              <Area
                type="monotone"
                dataKey="percentile"
                stroke="#f472b6"
                fill="url(#percentile)"
                name="Percentile"
              />
            </AreaChart>
          </ChartContainer>
        </div>
        
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-gray-400">
        <div>Last 6 quiz attempts</div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
            <span>Best Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Average Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-400"></div>
            <span>Percentile</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default PerformanceChart

