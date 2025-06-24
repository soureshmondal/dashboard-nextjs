"use client"

import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store/store"
import { fetchWeatherData } from "@/store/slices/weather-slice"
import { fetchNews } from "@/store/slices/news-slice"
import { fetchStockData } from "@/store/slices/finance-slice"

export const useRealTimeUpdates = () => {
  const dispatch = useDispatch<AppDispatch>()
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({})

  const startWeatherUpdates = (params: { city?: string; lat?: number; lon?: number }) => {
    // Update weather every 10 minutes
    intervalRefs.current.weather = setInterval(
      () => {
        dispatch(fetchWeatherData(params))
      },
      10 * 60 * 1000,
    )
  }

  const startNewsUpdates = (category: string) => {
    // Update news every 5 minutes
    intervalRefs.current.news = setInterval(
      () => {
        dispatch(fetchNews({ category }))
      },
      5 * 60 * 1000,
    )
  }

  const startFinanceUpdates = (symbols: string[]) => {
    // Update stock data every 2 minutes to respect rate limits
    intervalRefs.current.finance = setInterval(
      () => {
        // Only update one symbol at a time to conserve API calls
        if (symbols.length > 0) {
          const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
          dispatch(fetchStockData({ symbol: randomSymbol }))
        }
      },
      2 * 60 * 1000,
    ) // 2 minutes
  }

  const stopUpdates = (type?: string) => {
    if (type && intervalRefs.current[type]) {
      clearInterval(intervalRefs.current[type])
      delete intervalRefs.current[type]
    } else {
      // Stop all updates
      Object.values(intervalRefs.current).forEach(clearInterval)
      intervalRefs.current = {}
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopUpdates()
    }
  }, [])

  return {
    startWeatherUpdates,
    startNewsUpdates,
    startFinanceUpdates,
    stopUpdates,
  }
}
