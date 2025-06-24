"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store/store"
import { fetchGitHubData } from "@/store/slices/github-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, Star, GitFork, Calendar, ExternalLink, Search, Users, Book } from "lucide-react"

export default function GitHubWidget() {
  const dispatch = useDispatch<AppDispatch>()
  const { userData, repositories, loading, error } = useSelector((state: RootState) => state.github)
  const [searchUser, setSearchUser] = useState("")
  const [activeUser, setActiveUser] = useState("octocat")

  useEffect(() => {
    dispatch(fetchGitHubData({ username: activeUser }))
  }, [dispatch, activeUser])

  const handleSearch = () => {
    if (searchUser.trim()) {
      setActiveUser(searchUser.toLowerCase())
      setSearchUser("")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Failed to load GitHub data</p>
        <Button onClick={() => dispatch(fetchGitHubData({ username: activeUser }))}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">GitHub Profile</h3>
        <div className="flex space-x-2">
          <Input
            placeholder="Username..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-32"
          />
          <Button size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {userData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userData.avatar_url || "/placeholder.svg"} alt={userData.login} />
                <AvatarFallback>{userData.login.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-semibold">{userData.name || userData.login}</h4>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={userData.html_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">@{userData.login}</p>
                {userData.bio && <p className="text-sm mb-3">{userData.bio}</p>}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{userData.followers} followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{userData.following} following</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Book className="h-4 w-4" />
                    <span>{userData.public_repos} repos</span>
                  </div>
                </div>
                {userData.created_at && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(userData.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Github className="h-5 w-5" />
            <span>Popular Repositories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {repositories.slice(0, 10).map((repo) => (
                <Card key={repo.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-medium text-sm">{repo.name}</h5>
                        {repo.private && (
                          <Badge variant="secondary" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{repo.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {repo.language && (
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span>{repo.language}</span>
                          </span>
                        )}
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork className="h-3 w-3" />
                          <span>{repo.forks_count}</span>
                        </div>
                        {repo.updated_at && <span>Updated {formatDate(repo.updated_at)}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
