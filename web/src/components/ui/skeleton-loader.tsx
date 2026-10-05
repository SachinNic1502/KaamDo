"use client"

import * as React from "react"
import { cn } from "cn"

type SkeletonType = "text" | "paragraph" | "button" | "avatar" | "icon" | "line" | "card" | "image" | "shimmer"

const skeletonVariants = {
  text: "h-4 w-rounded bg-muted/40 rounded-md animate-shimmer",
  paragraph: "h-5 w-full bg-muted/40 rounded-md animate-shimmer my-2",
  button: "h-8 w-full bg-muted/40 rounded-lg animate-shimmer my-2",
  avatar: "h-8 w-8 bg-muted/40 rounded-full animate-shimmer",
  icon: "h-4 w-4 bg-muted/40 rounded-md animate-shimmer",
  line: "h-px w-24 bg-muted/40 rounded-md animate-shimmer my-1",
  card: "h-44 w-full bg-muted/40 rounded-xl animate-shimmer my-2",
  image: "h-24 w-full bg-muted/40 rounded-md animate-shimmer my-2",
  shimmer: "h-6 w-48 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 animate-shimmer",
}

type SkeletonProps = {
  type?: SkeletonType
  className?: string
  width?: string | number
  height?: string | number
  rounds?: boolean
}

function SkeletonLoader({ type = "text", className, width, height, rounds = true }: SkeletonProps) {
  const sizeClass = rounds ? "rounded" : ""

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === "number" ? `${width}px` : width
  if (height) style.height = typeof height === "number" ? `${height}px` : height

  return (
    <div
      className={cn(
        "animate-shimmer",
        skeletonVariants[type as keyof typeof skeletonVariants],
        className
      )}
      style={style}
    />
  )
}

SkeletonLoader.defaultProps = {
  type: "text",
}

export { SkeletonLoader }