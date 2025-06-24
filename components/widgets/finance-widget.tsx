"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store/store"
import { fetchStockData, fetchStockChart } from "@/store/slices/finance-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Search } from "lucide-react"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"

const popularStocks = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
const timeRanges = [
  { id: "1D", label: "1D" },
  { id: "1W", label: "1W" },
  { id: "1M", label: "1M" },
  { id: "3M", label: "3M" },
  { id: "1Y", label: "1Y" },
]

// Simple SVG Chart Component
function SimpleChart({ data, isPositive }: { data: any[]; isPositive: boolean }) {
  if (!data || data.length === 0) return null

  const width = 400
  const height = 200
  const padding = 40

  const prices = data.map((d) => d.close)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const points = data
    .map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((d.close - minPrice) / priceRange) * (height - 2 * padding)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="w-full h-[200px] flex items-center justify-center bg-background border rounded">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Price line */}
        <polyline fill="none" stroke={isPositive ? "#10b981" : "#ef4444"} strokeWidth="2" points={points} />

        {/* Y-axis labels */}
        <text x="10" y="50" fontSize="12" fill="hsl(var(--muted-foreground))">
          ${maxPrice.toFixed(0)}
        </text>
        <text x="10" y={height - 30} fontSize="12" fill="hsl(var(--muted-foreground))">
          ${minPrice.toFixed(0)}
        </text>

        {/* X-axis labels */}
        <text x={padding} y={height - 10} fontSize="12" fill="hsl(var(--muted-foreground))">
          {data[0]?.date}
        </text>
        <text x={width - padding - 40} y={height - 10} fontSize="12" fill="hsl(var(--muted-foreground))">
          {data[data.length - 1]?.date}
        </text>
      </svg>
    </div>
  )
}

export default function FinanceWidget() {
  const dispatch = useDispatch<AppDispatch>()
  const { stockData, chartData, loading, error } = useSelector((state: RootState) => state.finance)
  const [searchSymbol, setSearchSymbol] = useState("")
  const [activeSymbol, setActiveSymbol] = useState("AAPL")
  const [timeRange, setTimeRange] = useState("1M")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const currentStock = stockData[activeSymbol]

  // Debug logging
  console.log("🔍 Finance Widget Debug:", {
    chartData,
    chartDataLength: chartData?.length,
    activeSymbol,
    timeRange,
    loading,
    error,
  })

  useEffect(() => {
    console.log("🚀 Dispatching stock data and chart for:", activeSymbol, timeRange)
    dispatch(fetchStockData({ symbol: activeSymbol }))
    dispatch(fetchStockChart({ symbol: activeSymbol, interval: timeRange }))
  }, [dispatch, activeSymbol, timeRange])

  const { startFinanceUpdates, stopUpdates } = useRealTimeUpdates()

  useEffect(() => {
    startFinanceUpdates([activeSymbol])
    return () => stopUpdates("finance")
  }, [activeSymbol, startFinanceUpdates, stopUpdates])

  useEffect(() => {
    if (currentStock) {
      setLastUpdate(new Date())
    }
  }, [currentStock])

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      setActiveSymbol(searchSymbol.toUpperCase())
      setSearchSymbol("")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Failed to load stock data</p>
        <Button onClick={() => dispatch(fetchStockData({ symbol: activeSymbol }))}>Retry</Button>
      </div>
    )
  }

  const isPositive = currentStock?.changePercent >= 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stock Market</h3>
        <div className="flex space-x-2">
          <Input
            placeholder="Symbol..."
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-24"
          />
          <Button size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {popularStocks.map((symbol) => (
          <Button
            key={symbol}
            variant={activeSymbol === symbol ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSymbol(symbol)}
          >
            {symbol}
          </Button>
        ))}
      </div>

      {currentStock && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold">{activeSymbol}</h4>
                <p className="text-sm text-muted-foreground">{currentStock.name}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatPrice(currentStock.price)}</div>
                <div className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-medium">{formatPercentage(currentStock.changePercent)}</span>
                </div>
                <div className="text-xs text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span>High: {formatPrice(currentStock.high)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-red-500" />
                <span>Low: {formatPrice(currentStock.low)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span>Volume: {currentStock.volume.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-purple-500" />
                <span>Prev: {formatPrice(currentStock.previousClose)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Price Chart</CardTitle>
            <div className="flex space-x-1">
              {timeRanges.map((range) => (
                <Button
                  key={range.id}
                  variant={timeRange === range.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range.id)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Debug info - remove this once chart works */}
          <div className="mb-4 p-2 bg-muted rounded text-xs">
            <p>Chart Data Points: {chartData?.length || 0}</p>
            <p>Active Symbol: {activeSymbol}</p>
            <p>Time Range: {timeRange}</p>
            {chartData?.length > 0 && <p>Sample Data: {JSON.stringify(chartData[0])}</p>}
          </div>

          {chartData && chartData.length > 0 ? (
            <SimpleChart data={chartData} isPositive={isPositive} />
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-muted rounded">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No chart data available</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => dispatch(fetchStockChart({ symbol: activeSymbol, interval: timeRange }))}
                >
                  Reload Chart
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
