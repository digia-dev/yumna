"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { cn } from "@/lib/utils"

interface ChartData {
  name: string
  total: number
}

interface FinancialAreaChartProps {
  data: ChartData[]
  className?: string
}

export function FinancialAreaChart({ data, className }: FinancialAreaChartProps) {
  return (
    <div className={cn("h-[240px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#064e3b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
            opacity={0.5}
          />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Rp ${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "4px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{ fontWeight: "bold", color: "#064e3b" }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#064e3b"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
