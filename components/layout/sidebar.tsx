"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cloud, Newspaper, TrendingUp, Github, Home, Settings, BarChart3, Users } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "#", icon: Home, current: true },
  { name: "Weather", href: "#weather", icon: Cloud },
  { name: "News", href: "#news", icon: Newspaper, badge: "New" },
  { name: "Finance", href: "#finance", icon: TrendingUp },
  { name: "GitHub", href: "#github", icon: Github },
  { name: "Analytics", href: "#analytics", icon: BarChart3 },
  { name: "Team", href: "#team", icon: Users },
  { name: "Settings", href: "#settings", icon: Settings },
]

export default function Sidebar() {
  const { sidebarOpen } = useSelector((state: RootState) => state.layout)

  return (
    <div className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
      <div className="flex h-full flex-col bg-card border-r">
        <div className="flex h-16 items-center px-4 border-b">
          <div className={`flex items-center ${sidebarOpen ? "space-x-2" : "justify-center"}`}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && <span className="text-lg font-semibold">Dashboard</span>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.name}
                variant={item.current ? "secondary" : "ghost"}
                className={`w-full justify-start ${sidebarOpen ? "px-3" : "px-0 justify-center"}`}
                asChild
              >
                <a href={item.href}>
                  <Icon className={`h-5 w-5 ${sidebarOpen ? "mr-3" : ""}`} />
                  {sidebarOpen && (
                    <>
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </a>
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
