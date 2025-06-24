"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store/store"
import { setLayout } from "@/store/slices/layout-slice"
import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import WeatherWidget from "@/components/widgets/weather-widget"
import NewsWidget from "@/components/widgets/news-widget"
import FinanceWidget from "@/components/widgets/finance-widget"
import GitHubWidget from "@/components/widgets/github-widget"
import DraggableWidget from "@/components/widgets/draggable-widget"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Plus, Cloud, Newspaper, TrendingUp, Github, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const defaultLayout = [
  { id: "weather", x: 0, y: 0, w: 6, h: 4, component: "weather" },
  { id: "news", x: 6, y: 0, w: 6, h: 4, component: "news" },
  { id: "finance", x: 0, y: 4, w: 6, h: 4, component: "finance" },
  { id: "github", x: 6, y: 4, w: 6, h: 4, component: "github" },
]

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { layout, sidebarOpen } = useSelector((state: RootState) => state.layout)
  const [isCustomizing, setIsCustomizing] = useState(false)

  useEffect(() => {
    if (layout.length === 0) {
      dispatch(setLayout(defaultLayout))
    }
  }, [dispatch, layout.length])

  const resetLayout = () => {
    dispatch(setLayout(defaultLayout))
    setIsCustomizing(false)
  }

  const renderWidget = (component: string, id: string) => {
    switch (component) {
      case "weather":
        return <WeatherWidget />
      case "news":
        return <NewsWidget />
      case "finance":
        return <FinanceWidget />
      case "github":
        return <GitHubWidget />
      default:
        return <div>Unknown widget</div>
    }
  }

  const addWidget = (type: string) => {
    const newWidget = {
      id: `${type}-${Date.now()}`,
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      component: type,
    }
    dispatch(setLayout([...layout, newWidget]))
  }

  const removeWidget = (id: string) => {
    dispatch(setLayout(layout.filter((widget) => widget.id !== id)))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome to your personalized dashboard</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={isCustomizing ? "default" : "outline"}
                    onClick={() => setIsCustomizing(!isCustomizing)}
                  >
                    {isCustomizing ? "Done" : "Customize"}
                  </Button>
                  {isCustomizing && (
                    <>
                      <Button variant="outline" onClick={resetLayout}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Widget
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => addWidget("weather")}>
                            <Cloud className="w-4 h-4 mr-2" />
                            Weather
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addWidget("news")}>
                            <Newspaper className="w-4 h-4 mr-2" />
                            News
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addWidget("finance")}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Finance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addWidget("github")}>
                            <Github className="w-4 h-4 mr-2" />
                            GitHub
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 auto-rows-min">
                {layout.map((item) => (
                  <div
                    key={item.id}
                    className={`col-span-${item.w} row-span-${item.h}`}
                    style={{
                      gridColumn: `span ${item.w}`,
                      minHeight: `${item.h * 100}px`,
                    }}
                  >
                    {isCustomizing ? (
                      <DraggableWidget id={item.id}>
                        <Card className="h-full p-4 border-dashed border-2 hover:border-primary transition-colors relative">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => removeWidget(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          {renderWidget(item.component, item.id)}
                        </Card>
                      </DraggableWidget>
                    ) : (
                      <Card className="h-full p-4 animate-in fade-in-50 duration-500">
                        {renderWidget(item.component, item.id)}
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  )
}
