"use client"

import type React from "react"

import { useDrag, useDrop } from "react-dnd"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store/store"
import { moveWidget } from "@/store/slices/layout-slice"

interface DraggableWidgetProps {
  id: string
  children: React.ReactNode
}

export default function DraggableWidget({ id, children }: DraggableWidgetProps) {
  const dispatch = useDispatch<AppDispatch>()

  const [{ isDragging }, drag] = useDrag({
    type: "widget",
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "widget",
    hover: (item: { id: string }) => {
      if (item.id !== id) {
        dispatch(moveWidget({ fromId: item.id, toId: id }))
      }
    },
  })

  return (
    <div ref={(node) => drag(drop(node))} className={`cursor-move ${isDragging ? "opacity-50" : ""}`}>
      {children}
    </div>
  )
}
