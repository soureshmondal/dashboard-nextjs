import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface WeatherData {
  name: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
  }>
  wind: {
    speed: number
  }
  visibility: number
}

interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
    }
    weather: Array<{
      main: string
      description: string
    }>
  }>
}

interface WeatherState {
  currentWeather: WeatherData | null
  forecast: ForecastData | null
  loading: boolean
  error: string | null
}

const initialState: WeatherState = {
  currentWeather: null,
  forecast: null,
  loading: false,
  error: null,
}

// Mock API calls - replace with real API integration
export const fetchWeatherData = createAsyncThunk(
  "weather/fetchWeatherData",
  async (params: { city?: string; lat?: number; lon?: number }) => {
    // Replace with your mock data or actual API call
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
    const mockWeatherData: WeatherData = {
      name: params.city || "Mock City",
      main: {
        temp: 25,
        feels_like: 27,
        humidity: 70,
        pressure: 1012,
      },
      weather: [
        {
          main: "Clouds",
          description: "scattered clouds",
        },
      ],
      wind: {
        speed: 5,
      },
      visibility: 10000,
    }
    return mockWeatherData
  },
)

export const fetchForecastData = createAsyncThunk(
  "weather/fetchForecastData",
  async (params: { city?: string; lat?: number; lon?: number }) => {
    // Replace with your mock data or actual API call
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
    const mockForecastData: ForecastData = {
      list: [
        {
          dt: Date.now() / 1000,
          main: {
            temp: 26,
            feels_like: 28,
          },
          weather: [
            {
              main: "Clouds",
              description: "broken clouds",
            },
          ],
        },
        {
          dt: Date.now() / 1000 + 86400,
          main: {
            temp: 24,
            feels_like: 26,
          },
          weather: [
            {
              main: "Rain",
              description: "light rain",
            },
          ],
        },
      ],
    }
    return mockForecastData
  },
)

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false
        state.currentWeather = action.payload
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch weather data"
      })
      .addCase(fetchForecastData.fulfilled, (state, action) => {
        state.forecast = action.payload
      })
  },
})

export default weatherSlice.reducer
