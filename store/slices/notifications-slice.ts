import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  timestamp: string
}

interface NotificationsState {
  notifications: Notification[]
}

const initialState: NotificationsState = {
  notifications: [
    {
      id: "1",
      title: "Weather Alert",
      message: "Heavy rain expected in your area",
      type: "warning",
      read: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Stock Update",
      message: "AAPL reached a new high",
      type: "success",
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      title: "News Alert",
      message: "Breaking: Major tech announcement",
      type: "info",
      read: true,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
}

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, "id" | "timestamp">>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }
      state.notifications.unshift(notification)
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true))
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
  },
})

export const { addNotification, markAsRead, markAllAsRead, removeNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
