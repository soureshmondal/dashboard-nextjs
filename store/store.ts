import { configureStore } from "@reduxjs/toolkit"
import layoutReducer from "./slices/layout-slice"
import weatherReducer from "./slices/weather-slice"
import newsReducer from "./slices/news-slice"
import financeReducer from "./slices/finance-slice"
import githubReducer from "./slices/github-slice"
import notificationsReducer from "./slices/notifications-slice"

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    weather: weatherReducer,
    news: newsReducer,
    finance: financeReducer,
    github: githubReducer,
    notifications: notificationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
