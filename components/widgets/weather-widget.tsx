"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store/store"
import { fetchWeatherData, fetchForecastData } from "@/store/slices/weather-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Cloud, Sun, CloudRain, CloudSnow, MapPin, Thermometer, Droplets, Wind, Eye, Search } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"

const weatherIcons = {
  clear: Sun,
  clouds: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  default: Cloud,
}

export default function WeatherWidget() {
  const dispatch = useDispatch<AppDispatch>()
  const { currentWeather, forecast, loading, error } = useSelector((state: RootState) => state.weather)
  const [searchCity, setSearchCity] = useState("")

  useEffect(() => {
    // Get user's location or default to London
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch(
            fetchWeatherData({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            }),
          )
          dispatch(
            fetchForecastData({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            }),
          )
        },
        () => {
          // Fallback to London
          dispatch(fetchWeatherData({ city: "London" }))
          dispatch(fetchForecastData({ city: "London" }))
        },
      )
    } else {
      dispatch(fetchWeatherData({ city: "London" }))
      dispatch(fetchForecastData({ city: "London" }))
    }
  }, [dispatch])

  const { startWeatherUpdates, stopUpdates } = useRealTimeUpdates()

  useEffect(() => {
    if (currentWeather) {
      startWeatherUpdates({ city: currentWeather.name })
    }
    return () => stopUpdates("weather")
  }, [currentWeather, currentWeather?.name, startWeatherUpdates, stopUpdates])

  const handleSearch = () => {
    if (searchCity.trim()) {
      dispatch(fetchWeatherData({ city: searchCity }))
      dispatch(fetchForecastData({ city: searchCity }))
      setSearchCity("")
    }
  }

  const getWeatherIcon = (condition: string) => {
    const IconComponent = weatherIcons[condition as keyof typeof weatherIcons] || weatherIcons.default
    return <IconComponent className="h-8 w-8" />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Failed to load weather data</p>
        <Button onClick={() => dispatch(fetchWeatherData({ city: "London" }))}>Retry</Button>
      </div>
    )
  }

  const chartData =
    forecast?.list?.slice(0, 8).map((item, index) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temp: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
    })) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weather</h3>
        <div className="flex space-x-2">
          <Input
            placeholder="Search city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-32"
          />
          <Button size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {currentWeather && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{currentWeather.name}</span>
              </div>
              <Badge variant="secondary">{currentWeather.weather[0].description}</Badge>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {getWeatherIcon(currentWeather.weather[0].main.toLowerCase())}
                <div>
                  <div className="text-3xl font-bold">{Math.round(currentWeather.main.temp)}°C</div>
                  <div className="text-sm text-muted-foreground">
                    Feels like {Math.round(currentWeather.main.feels_like)}°C
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Humidity: {currentWeather.main.humidity}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <span>Wind: {currentWeather.wind.speed} m/s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span>Pressure: {currentWeather.main.pressure} hPa</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span>Visibility: {(currentWeather.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">24-Hour Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={2} name="Temperature" />
                <Line
                  type="monotone"
                  dataKey="feels_like"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Feels Like"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
