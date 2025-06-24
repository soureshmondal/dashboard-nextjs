import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { githubApi } from "@/services/api"

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  followers: number
  following: number
  public_repos: number
  html_url: string
  created_at: string
}

interface GitHubRepository {
  id: number
  name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  updated_at: string
  private: boolean
}

interface GitHubState {
  userData: GitHubUser | null
  repositories: GitHubRepository[]
  loading: boolean
  error: string | null
}

const initialState: GitHubState = {
  userData: null,
  repositories: [],
  loading: false,
  error: null,
}

const mockUsers: Record<string, GitHubUser> = {
  octocat: {
    login: "octocat",
    name: "The Octocat",
    avatar_url: "/placeholder.svg?height=64&width=64",
    bio: "GitHub mascot and friendly neighborhood cat",
    followers: 4567,
    following: 123,
    public_repos: 42,
    html_url: "https://github.com/octocat",
    created_at: "2011-01-25T18:44:36Z",
  },
  torvalds: {
    login: "torvalds",
    name: "Linus Torvalds",
    avatar_url: "/placeholder.svg?height=64&width=64",
    bio: "Creator of Linux and Git",
    followers: 156789,
    following: 0,
    public_repos: 6,
    html_url: "https://github.com/torvalds",
    created_at: "2011-09-03T15:26:22Z",
  },
}

const mockRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: "Hello-World",
    description: "My first repository on GitHub!",
    html_url: "https://github.com/octocat/Hello-World",
    stargazers_count: 1892,
    forks_count: 2456,
    language: "JavaScript",
    updated_at: "2023-12-01T10:30:00Z",
    private: false,
  },
  {
    id: 2,
    name: "Spoon-Knife",
    description: "This repo is for demonstration purposes only.",
    html_url: "https://github.com/octocat/Spoon-Knife",
    stargazers_count: 12045,
    forks_count: 143567,
    language: "HTML",
    updated_at: "2023-11-28T14:22:00Z",
    private: false,
  },
  {
    id: 3,
    name: "git-consortium",
    description: "Collaborative development of Git",
    html_url: "https://github.com/octocat/git-consortium",
    stargazers_count: 567,
    forks_count: 89,
    language: "C",
    updated_at: "2023-11-25T09:15:00Z",
    private: false,
  },
  {
    id: 4,
    name: "linguist",
    description: "Language Savant. If your repository language is being reported incorrectly, send us a pull request!",
    html_url: "https://github.com/octocat/linguist",
    stargazers_count: 11234,
    forks_count: 4567,
    language: "Ruby",
    updated_at: "2023-11-20T16:45:00Z",
    private: false,
  },
  {
    id: 5,
    name: "private-repo",
    description: "This is a private repository",
    html_url: "https://github.com/octocat/private-repo",
    stargazers_count: 0,
    forks_count: 0,
    language: "TypeScript",
    updated_at: "2023-12-02T08:30:00Z",
    private: true,
  },
]

export const fetchGitHubData = createAsyncThunk("github/fetchGitHubData", async (params: { username: string }) => {
  const userData = await githubApi.getUser(params.username)
  const repositories = await githubApi.getUserRepos(params.username)
  return { userData, repositories }
})

const githubSlice = createSlice({
  name: "github",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGitHubData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGitHubData.fulfilled, (state, action) => {
        state.loading = false
        state.userData = action.payload.userData
        state.repositories = action.payload.repositories
      })
      .addCase(fetchGitHubData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch GitHub data"
      })
  },
})

export default githubSlice.reducer
