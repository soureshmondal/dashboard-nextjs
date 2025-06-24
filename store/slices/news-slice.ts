import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { newsApi } from "@/services/api"

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
}

interface NewsState {
  articles: NewsArticle[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: NewsState = {
  articles: [],
  loading: false,
  error: null,
  lastUpdated: null,
}

export const fetchNews = createAsyncThunk("news/fetchNews", async (params: { category: string }) => {
  const articles = await newsApi.getNews(params.category)
  return {
    articles,
    timestamp: new Date().toISOString(),
  }
})

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false
        state.articles = action.payload.articles
        state.lastUpdated = action.payload.timestamp
        state.error = null
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch news"
      })
  },
})

export const { clearError } = newsSlice.actions
export default newsSlice.reducer
