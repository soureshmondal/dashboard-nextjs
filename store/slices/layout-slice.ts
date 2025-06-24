import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface LayoutItem {
  id: string
  x: number
  y: number
  w: number
  h: number
  component: string
}

interface LayoutState {
  sidebarOpen: boolean
  layout: LayoutItem[]
}

const initialState: LayoutState = {
  sidebarOpen: true,
  layout: [],
}

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setLayout: (state, action: PayloadAction<LayoutItem[]>) => {
      state.layout = action.payload
    },
    moveWidget: (state, action: PayloadAction<{ fromId: string; toId: string }>) => {
      const { fromId, toId } = action.payload
      const fromIndex = state.layout.findIndex((item) => item.id === fromId)
      const toIndex = state.layout.findIndex((item) => item.id === toId)

      if (fromIndex !== -1 && toIndex !== -1) {
        const [movedItem] = state.layout.splice(fromIndex, 1)
        state.layout.splice(toIndex, 0, movedItem)
      }
    },
  },
})

export const { toggleSidebar, setSidebarOpen, setLayout, moveWidget } = layoutSlice.actions
export default layoutSlice.reducer
