import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { financeApi } from "@/services/api"

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  volume: number
  previousClose: number
}

interface ChartDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface FinanceState {
  stockData: Record<string, StockData>
  chartData: ChartDataPoint[]
  loading: boolean
  error: string | null
}

const initialState: FinanceState = {
  stockData: {},
  chartData: [],
  loading: false,
  error: null,
}

export const fetchStockData = createAsyncThunk("finance/fetchStockData", async (params: { symbol: string }) => {
  console.log("🔄 Fetching stock data for:", params.symbol)
  const result = await financeApi.getStockQuote(params.symbol)
  console.log("✅ Stock data received:", result)
  return result
})

export const fetchStockChart = createAsyncThunk(
  "finance/fetchStockChart",
  async (params: { symbol: string; interval: string }) => {
    console.log("📊 Fetching chart data for:", params.symbol, params.interval)
    const result = await financeApi.getStockChart(params.symbol, params.interval)
    console.log("✅ Chart data received:", result?.length, "points")
    return result
  },
)

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStockData.fulfilled, (state, action) => {
        state.loading = false
        state.stockData[action.payload.symbol] = action.payload
        console.log("📦 Stock data stored in Redux:", action.payload.symbol)
      })
      .addCase(fetchStockData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch stock data"
        console.error("❌ Stock data fetch failed:", action.error.message)
      })
      .addCase(fetchStockChart.pending, (state) => {
        console.log("⏳ Chart data fetch pending...")
      })
      .addCase(fetchStockChart.fulfilled, (state, action) => {
        state.chartData = action.payload
        console.log("📦 Chart data stored in Redux:", action.payload?.length, "points")
        console.log("📊 First chart point:", action.payload?.[0])
      })
      .addCase(fetchStockChart.rejected, (state, action) => {
        console.error("❌ Chart data fetch failed:", action.error.message)
        state.error = action.error.message || "Failed to fetch chart data"
      })
  },
})

export default financeSlice.reducer
