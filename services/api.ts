// Real API service integrations with rate limiting and caching
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY
const FINANCE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY

// Rate limiting and caching for Alpha Vantage
class AlphaVantageRateLimiter {
  private lastCall = 0
  private callCount = 0
  private dailyLimit = 25
  private rateLimitReached = false
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  async makeRequest(url: string, cacheKey: string): Promise<any> {
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log("📦 Using cached data for:", cacheKey)
      return cached.data
    }

    // Check daily limit
    if (this.callCount >= this.dailyLimit) {
      console.warn("🚫 Alpha Vantage daily limit reached. Using mock data.")
      throw new Error("Daily API limit reached (25 calls/day)")
    }

    // Rate limiting: minimum 12 seconds between calls (5 calls/minute)
    const now = Date.now()
    const timeSinceLastCall = now - this.lastCall
    const minInterval = 12000 // 12 seconds

    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before API call`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    try {
      console.log(`📡 Making Alpha Vantage API call (${this.callCount + 1}/${this.dailyLimit})`)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Check for rate limit messages in the response
      if (data["Note"] && data["Note"].includes("rate limit")) {
        console.warn("🚫 Rate limit detected in API response.")
        this.rateLimitReached = true
        throw new Error("API rate limit reached")
      }

      if (data["Information"] && data["Information"].includes("premium")) {
        console.warn("🚫 Premium subscription required.")
        this.rateLimitReached = true
        throw new Error("Premium subscription required")
      }

      this.lastCall = Date.now()
      this.callCount++

      // Cache successful responses
      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (error) {
      if (
        error.message.includes("rate limit") ||
        error.message.includes("premium") ||
        error.message.includes("25 requests")
      ) {
        this.rateLimitReached = true
      }
      throw error
    }
  }

  getCacheStatus() {
    return {
      callCount: this.callCount,
      dailyLimit: this.dailyLimit,
      remainingCalls: this.dailyLimit - this.callCount,
      cacheSize: this.cache.size,
      rateLimitReached: this.rateLimitReached,
    }
  }
}

const alphaVantageRateLimiter = new AlphaVantageRateLimiter()

export const weatherApi = {
  getCurrentWeather: async (params: { city?: string; lat?: number; lon?: number }) => {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === "demo_key") {
      console.warn("⚠️ No OpenWeather API key found. Using mock data.")
      return getMockWeatherData(params)
    }

    try {
      let url = `https://api.openweathermap.org/data/2.5/weather?appid=${WEATHER_API_KEY}&units=metric`

      if (params.city) {
        url += `&q=${encodeURIComponent(params.city)}`
      } else if (params.lat && params.lon) {
        url += `&lat=${params.lat}&lon=${params.lon}`
      } else {
        url += `&q=London`
      }

      console.log("🌤️ Fetching REAL weather data...")

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Weather API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ REAL weather data received:", data.name)
      return data
    } catch (error) {
      console.error("❌ Weather API Error:", error)
      return getMockWeatherData(params)
    }
  },

  getForecast: async (params: { city?: string; lat?: number; lon?: number }) => {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === "demo_key") {
      return getMockForecastData()
    }

    try {
      let url = `https://api.openweathermap.org/data/2.5/forecast?appid=${WEATHER_API_KEY}&units=metric`

      if (params.city) {
        url += `&q=${encodeURIComponent(params.city)}`
      } else if (params.lat && params.lon) {
        url += `&lat=${params.lat}&lon=${params.lon}`
      } else {
        url += `&q=London`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Forecast API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ REAL forecast data received")
      return data
    } catch (error) {
      console.error("❌ Forecast API Error:", error)
      return getMockForecastData()
    }
  },
}

export const newsApi = {
  getNews: async (category = "general") => {
    if (!NEWS_API_KEY || NEWS_API_KEY === "demo_key") {
      console.warn("⚠️ No News API key found. Using mock data.")
      return getComprehensiveMockNewsData(category)
    }

    try {
      // Use NewsAPI with proper CORS handling
      const url = `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${NEWS_API_KEY}&pageSize=20`

      console.log("📰 Fetching REAL news data for category:", category)

      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 426) {
          console.warn("⚠️ NewsAPI requires HTTPS upgrade. Using mock data.")
          return getComprehensiveMockNewsData(category)
        }
        throw new Error(`News API failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "error") {
        console.warn("⚠️ NewsAPI error:", data.message)
        return getComprehensiveMockNewsData(category)
      }

      console.log("✅ REAL news data received:", data.articles?.length, "articles")
      return data.articles || []
    } catch (error) {
      console.error("❌ News API Error:", error)
      console.log("📰 Falling back to comprehensive mock news data")
      return getComprehensiveMockNewsData(category)
    }
  },
}

export const financeApi = {
  getStockQuote: async (symbol: string) => {
    if (!FINANCE_API_KEY || FINANCE_API_KEY === "demo_key") {
      console.warn("⚠️ No Alpha Vantage API key found. Using mock data.")
      return getEnhancedMockStockData(symbol)
    }

    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${FINANCE_API_KEY}`
      const cacheKey = `quote-${symbol}`

      console.log("📈 Fetching REAL stock data for:", symbol)

      const data = await alphaVantageRateLimiter.makeRequest(url, cacheKey)

      const quote = data["Global Quote"]
      if (!quote) {
        console.warn("⚠️ No quote data received, using mock data")
        return getEnhancedMockStockData(symbol)
      }

      // Transform Alpha Vantage response to our format
      const result = {
        symbol: quote["01. symbol"],
        name: `${quote["01. symbol"]} Inc.`,
        price: Number.parseFloat(quote["05. price"]),
        change: Number.parseFloat(quote["09. change"]),
        changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
        high: Number.parseFloat(quote["03. high"]),
        low: Number.parseFloat(quote["04. low"]),
        volume: Number.parseInt(quote["06. volume"]),
        previousClose: Number.parseFloat(quote["08. previous close"]),
      }

      console.log("✅ REAL stock data received:", result.symbol, "$" + result.price)
      return result
    } catch (error) {
      console.error("❌ Stock API Error:", error)
      console.log("📈 Falling back to enhanced mock data")
      return getEnhancedMockStockData(symbol)
    }
  },

  getStockChart: async (symbol: string, interval = "1D") => {
    if (!FINANCE_API_KEY || FINANCE_API_KEY === "demo_key") {
      console.warn("⚠️ No Alpha Vantage API key found. Using mock chart data.")
      return getEnhancedMockChartData(symbol, interval)
    }

    try {
      // Use different function based on interval
      let func = "TIME_SERIES_DAILY"
      if (interval === "1D") func = "TIME_SERIES_INTRADAY&interval=60min"

      const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${FINANCE_API_KEY}`
      const cacheKey = `chart-${symbol}-${interval}`

      console.log("📊 Fetching REAL chart data for:", symbol, interval)

      const data = await alphaVantageRateLimiter.makeRequest(url, cacheKey)

      const timeSeries = data["Time Series (Daily)"] || data["Time Series (60min)"] || data["Time Series (1min)"]

      if (!timeSeries) {
        console.warn("⚠️ No time series data received, using mock data")
        return getEnhancedMockChartData(symbol, interval)
      }

      // Transform to our chart format
      const chartData = Object.entries(timeSeries)
        .slice(0, interval === "1D" ? 24 : 30)
        .map(([date, values]: [string, any]) => ({
          date:
            interval === "1D"
              ? new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
              : new Date(date).toLocaleDateString(),
          open: Number.parseFloat(values["1. open"]),
          high: Number.parseFloat(values["2. high"]),
          low: Number.parseFloat(values["3. low"]),
          close: Number.parseFloat(values["4. close"]),
          volume: Number.parseInt(values["5. volume"]),
        }))
        .reverse() // Reverse to show chronological order

      console.log("✅ REAL chart data received:", chartData.length, "points")
      return chartData
    } catch (error) {
      console.error("❌ Chart API Error:", error)
      console.log("📊 Falling back to enhanced mock chart data")
      return getEnhancedMockChartData(symbol, interval)
    }
  },

  getRateLimitStatus: () => {
    return alphaVantageRateLimiter.getCacheStatus()
  },
}

export const githubApi = {
  getUser: async (username: string) => {
    try {
      console.log("👤 Fetching REAL GitHub user data for:", username)
      const response = await fetch(`https://api.github.com/users/${username}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`GitHub user '${username}' not found`)
        }
        throw new Error(`GitHub API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ REAL GitHub user data received:", data.login)
      return data
    } catch (error) {
      console.error("❌ GitHub API Error:", error)
      return getMockGitHubUser(username)
    }
  },

  getUserRepos: async (username: string) => {
    try {
      console.log("📚 Fetching REAL GitHub repos for:", username)
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`)

      if (!response.ok) {
        throw new Error(`GitHub Repos API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ REAL GitHub repos data received:", data.length, "repos")
      return data
    } catch (error) {
      console.error("❌ GitHub Repos API Error:", error)
      return getMockGitHubRepos(username)
    }
  },
}

// Enhanced mock data functions (fallbacks)
function getMockWeatherData(params: { city?: string; lat?: number; lon?: number }) {
  return {
    name: params.city || "Mock City",
    main: {
      temp: Math.round(Math.random() * 30 + 5),
      feels_like: Math.round(Math.random() * 30 + 5),
      humidity: Math.round(Math.random() * 50 + 30),
      pressure: Math.round(Math.random() * 100 + 1000),
    },
    weather: [{ main: "Clear", description: "clear sky" }],
    wind: { speed: Math.round(Math.random() * 10 + 2) },
    visibility: Math.round(Math.random() * 5000 + 5000),
  }
}

function getMockForecastData() {
  const list = Array.from({ length: 8 }, (_, i) => ({
    dt: Date.now() / 1000 + i * 3600 * 3,
    main: {
      temp: Math.round(Math.random() * 25 + 10),
      feels_like: Math.round(Math.random() * 25 + 10),
    },
    weather: [{ main: "Clear", description: "clear sky" }],
  }))
  return { list }
}

function getComprehensiveMockNewsData(category: string) {
  const newsData = {
    general: [
      {
        title: "Global Climate Summit Reaches Historic Agreement",
        description:
          "World leaders unite on ambitious climate targets for 2030, marking a significant step forward in environmental policy.",
        url: "https://example.com/climate-summit",
        urlToImage: "/placeholder.svg?height=64&width=64",
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        source: { name: "Global News Network" },
      },
      {
        title: "Breakthrough in Renewable Energy Storage Technology",
        description:
          "Scientists develop new battery technology that could revolutionize how we store and use renewable energy.",
        url: "https://example.com/energy-breakthrough",
        urlToImage: "/placeholder.svg?height=64&width=64",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Science Today" },
      },
    ],
    technology: [
      {
        title: "AI Revolution: New Language Model Breaks Performance Records",
        description:
          "Latest artificial intelligence breakthrough demonstrates unprecedented capabilities in natural language understanding.",
        url: "https://example.com/ai-breakthrough",
        urlToImage: "/placeholder.svg?height=64&width=64",
        publishedAt: new Date(Date.now() - 1200000).toISOString(),
        source: { name: "Tech Innovation Weekly" },
      },
    ],
    business: [
      {
        title: "Stock Markets Reach New Heights Amid Economic Optimism",
        description:
          "Major indices show strong performance as investors respond positively to recent economic indicators.",
        url: "https://example.com/market-highs",
        urlToImage: "/placeholder.svg?height=64&width=64",
        publishedAt: new Date(Date.now() - 900000).toISOString(),
        source: { name: "Financial Herald" },
      },
    ],
    sports: [
      {
        title: "Championship Finals Set Record Viewership Numbers",
        description:
          "Historic sporting event draws millions of viewers worldwide, breaking previous attendance records.",
        url: "https://example.com/championship-finals",
        urlToImage: "/placeholder.svg?height=64&width=64",
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        source: { name: "Sports Central" },
      },
    ],
    health: [
      {
        title: "Medical Breakthrough: New Treatment Shows Promise",
        description: "Clinical trials reveal encouraging results for innovative therapy targeting chronic conditions.",
        url: "https://example.com/medical-breakthrough",
        urlToImage: "/placeholder.svg?height=64&width=64",
        publishedAt: new Date(Date.now() - 2100000).toISOString(),
        source: { name: "Medical Journal Weekly" },
      },
    ],
  }

  const categoryArticles = newsData[category as keyof typeof newsData] || newsData.general
  const shuffled = [...categoryArticles].sort(() => Math.random() - 0.5)

  const liveArticle = {
    title: `Latest ${category.charAt(0).toUpperCase() + category.slice(1)} Update - Live`,
    description: `Breaking developments in ${category}. This is comprehensive mock data with realistic content and timing.`,
    url: `https://example.com/live-${category}`,
    urlToImage: "/placeholder.svg?height=64&width=64",
    publishedAt: new Date().toISOString(),
    source: { name: "Live News Feed" },
  }

  return [liveArticle, ...shuffled]
}

function getEnhancedMockStockData(symbol: string) {
  const stockPrices: Record<string, number> = {
    AAPL: 175.43,
    GOOGL: 2847.52,
    MSFT: 378.91,
    AMZN: 3342.88,
    TSLA: 248.5,
    NVDA: 875.28,
    META: 331.05,
    NFLX: 445.03,
  }

  const basePrice = stockPrices[symbol] || 100 + Math.random() * 200
  const now = new Date()
  const marketHours = now.getHours()
  const isMarketOpen = marketHours >= 9 && marketHours <= 16
  const isWeekend = now.getDay() === 0 || now.getDay() === 6

  let volatility = 0.008
  if (isMarketOpen && !isWeekend) {
    volatility = 0.015
  } else if (isWeekend) {
    volatility = 0.003
  }

  const trendFactor = Math.sin(Date.now() / (1000 * 60 * 60 * 24)) * 0.01
  const change = (Math.random() - 0.5) * basePrice * volatility + basePrice * trendFactor
  const changePercent = (change / basePrice) * 100
  const currentPrice = basePrice + change

  return {
    symbol,
    name: `${symbol} Inc. [MOCK DATA]`,
    price: Number.parseFloat(currentPrice.toFixed(2)),
    change: Number.parseFloat(change.toFixed(2)),
    changePercent: Number.parseFloat(changePercent.toFixed(2)),
    high: Number.parseFloat((currentPrice + Math.random() * basePrice * 0.008).toFixed(2)),
    low: Number.parseFloat((currentPrice - Math.random() * basePrice * 0.008).toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 1000000,
    previousClose: Number.parseFloat(basePrice.toFixed(2)),
  }
}

function getEnhancedMockChartData(symbol: string, interval: string) {
  const stockPrices: Record<string, number> = {
    AAPL: 175,
    GOOGL: 2850,
    MSFT: 380,
    AMZN: 3350,
    TSLA: 250,
    NVDA: 875,
    META: 330,
    NFLX: 445,
  }

  const basePrice = stockPrices[symbol] || 150
  const dataPoints = interval === "1D" ? 24 : 30

  return Array.from({ length: dataPoints }, (_, i) => {
    const date = new Date()
    if (interval === "1D") {
      date.setHours(date.getHours() - (dataPoints - i))
    } else {
      date.setDate(date.getDate() - (dataPoints - i))
    }

    const trend = Math.sin(i / 8) * basePrice * 0.03
    const dailyVolatility = (Math.random() - 0.5) * basePrice * 0.015
    const marketNoise = (Math.random() - 0.5) * basePrice * 0.005
    const price = basePrice + trend + dailyVolatility + marketNoise

    const open = Number.parseFloat((price + (Math.random() - 0.5) * basePrice * 0.008).toFixed(2))
    const close = Number.parseFloat(price.toFixed(2))
    const high = Number.parseFloat((Math.max(open, close) + Math.random() * basePrice * 0.012).toFixed(2))
    const low = Number.parseFloat((Math.min(open, close) - Math.random() * basePrice * 0.012).toFixed(2))

    return {
      date:
        interval === "1D"
          ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : date.toLocaleDateString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 8000000) + 2000000,
    }
  })
}

function getMockGitHubUser(username: string) {
  return {
    login: username,
    name: `${username} (Mock Data)`,
    avatar_url: "/placeholder.svg?height=64&width=64",
    bio: "This is mock data. Real GitHub data will appear when API is accessible.",
    followers: Math.floor(Math.random() * 1000) + 100,
    following: Math.floor(Math.random() * 100) + 10,
    public_repos: Math.floor(Math.random() * 50) + 5,
    html_url: `https://github.com/${username}`,
    created_at: "2020-01-01T00:00:00Z",
  }
}

function getMockGitHubRepos(username: string) {
  return [
    {
      id: 1,
      name: "mock-repo-1",
      description: "This is mock repository data. Real repos will appear when GitHub API is accessible.",
      html_url: `https://github.com/${username}/mock-repo-1`,
      stargazers_count: Math.floor(Math.random() * 100),
      forks_count: Math.floor(Math.random() * 20),
      language: "JavaScript",
      updated_at: new Date().toISOString(),
      private: false,
    },
  ]
}
