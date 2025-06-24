"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { financeApi } from "@/services/api"
import { AlertCircle, CheckCircle, XCircle, Clock, Database } from "lucide-react"

export default function ApiDebug() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [testing, setTesting] = useState(false)
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null)

  useEffect(() => {
    // Update rate limit status
    const updateStatus = () => {
      const status = financeApi.getRateLimitStatus()
      setRateLimitStatus(status)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const testFinanceApi = async () => {
    setTesting(true)
    try {
      console.log("🧪 Testing Finance API...")
      const result = await financeApi.getStockQuote("AAPL")
      setTestResults((prev) => ({
        ...prev,
        finance: { success: true, data: result },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        finance: { success: false, error: error.message },
      }))
    }
    setTesting(false)
  }

  const apiKeys = {
    weather:
      !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY && process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY !== "demo_key",
    news: !!process.env.NEXT_PUBLIC_NEWS_API_KEY && process.env.NEXT_PUBLIC_NEWS_API_KEY !== "demo_key",
    finance:
      !!process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY && process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY !== "demo_key",
  }

  const usagePercentage = rateLimitStatus ? (rateLimitStatus.callCount / rateLimitStatus.dailyLimit) * 100 : 0

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          API Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">API Key Status:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(apiKeys).map(([api, hasKey]) => (
              <Badge key={api} variant={hasKey ? "default" : "secondary"}>
                {hasKey ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {api.toUpperCase()}: {hasKey ? "Configured" : "Missing"}
              </Badge>
            ))}
          </div>
        </div>

        {rateLimitStatus && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Alpha Vantage Rate Limits:
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Usage:</span>
                <span>
                  {rateLimitStatus.callCount} / {rateLimitStatus.dailyLimit}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Cached: {rateLimitStatus.cacheSize} items
                </span>
                <span>Remaining: {rateLimitStatus.remainingCalls}</span>
              </div>
              {rateLimitStatus.rateLimitReached && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span>Rate limit reached - using mock data only</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Test APIs:</h4>
          <div className="flex gap-2">
            <Button onClick={testFinanceApi} disabled={testing}>
              {testing ? "Testing..." : "Test Finance API"}
            </Button>
            {rateLimitStatus?.rateLimitReached && (
              <Button
                variant="outline"
                onClick={() => {
                  // This would reset for testing - in production you'd wait 24 hours
                  financeApi.getRateLimitStatus = () => ({ ...rateLimitStatus, rateLimitReached: false })
                  window.location.reload()
                }}
              >
                Reset for Testing
              </Button>
            )}
          </div>
        </div>

        {testResults.finance && (
          <div>
            <h4 className="font-medium mb-2">Finance API Test Result:</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-40">
              {JSON.stringify(testResults.finance, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Current API Strategy:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>✅ Weather: Real API (OpenWeather - generous free tier)</li>
            <li>🟡 Finance: Enhanced mock data (Alpha Vantage requires premium)</li>
            <li>🟡 News: Comprehensive mock data (NewsAPI has CORS/subscription limits)</li>
            <li>✅ GitHub: Real API (GitHub - reliable free tier)</li>
            <li>📊 Charts: Enhanced mock data (preserves API quota)</li>
          </ul>
          <p className="mt-3">
            <strong>Mock Data Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Market-aware volatility (higher during trading hours)</li>
            <li>Realistic price movements with trending behavior</li>
            <li>Time-based variations (weekends vs weekdays)</li>
            <li>Category-specific news content with live updates</li>
            <li>Dynamic chart data with proper OHLC relationships</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
