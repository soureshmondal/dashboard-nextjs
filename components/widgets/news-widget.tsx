"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store/store"
import { fetchNews } from "@/store/slices/news-slice"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Clock, User } from "lucide-react"
import Image from "next/image"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"

const categories = [
  { id: "general", label: "General" },
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business" },
  { id: "sports", label: "Sports" },
  { id: "health", label: "Health" },
]

export default function NewsWidget() {
  const dispatch = useDispatch<AppDispatch>()
  const { articles, loading, error } = useSelector((state: RootState) => state.news)
  const [activeCategory, setActiveCategory] = useState("general")

  useEffect(() => {
    dispatch(fetchNews({ category: activeCategory }))
  }, [dispatch, activeCategory])

  const { startNewsUpdates, stopUpdates } = useRealTimeUpdates()

  useEffect(() => {
    startNewsUpdates(activeCategory)
    return () => stopUpdates("news")
  }, [activeCategory, startNewsUpdates, stopUpdates])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Failed to load news</p>
        <Button onClick={() => dispatch(fetchNews({ category: activeCategory }))}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Latest News</h3>
        <Badge variant="outline">{articles.length} articles</Badge>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {articles.slice(0, 10).map((article, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {article.urlToImage && (
                          <div className="flex-shrink-0">
                            <Image
                              src={article.urlToImage || "/placeholder.svg"}
                              alt={article.title}
                              width={64}
                              height={64}
                              className="rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-2">{article.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <User className="h-3 w-3" />
                              <span>{article.source.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-xs" asChild>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1"
                            >
                              <span>Read more</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
