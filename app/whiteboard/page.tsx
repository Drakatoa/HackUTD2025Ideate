"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Upload,
  Wand2,
  Save,
  Home,
  Pencil,
  Square,
  Circle,
  Type,
  StickyNote,
  MousePointer,
  Eraser,
  Trash2,
  Download,
  Undo2,
  Redo2,
} from "lucide-react"
import { getStroke } from "perfect-freehand"

type Tool = "select" | "pencil" | "rectangle" | "circle" | "text" | "sticky" | "eraser"

interface DrawnElement {
  id: string
  type: "path" | "rectangle" | "circle" | "text" | "sticky"
  points?: { x: number; y: number }[]
  x?: number
  y?: number
  width?: number
  height?: number
  text?: string
  color: string
}

interface TextInput {
  id: string
  type: "sticky" | "text"
  x: number
  y: number
  width: number
  height: number
  text: string
  color: string
}

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>("pencil")
  const [isDrawing, setIsDrawing] = useState(false)
  const [elements, setElements] = useState<DrawnElement[]>([])
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [selectedColor, setSelectedColor] = useState("#8b5cf6")
  const [showUploadModal, setShowUploadModal] = useState(false)

  const [history, setHistory] = useState<DrawnElement[][]>([[]])
  const [historyStep, setHistoryStep] = useState(0)

  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [previewShape, setPreviewShape] = useState<{
    type: "rectangle" | "circle"
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const [activeTextInput, setActiveTextInput] = useState<TextInput | null>(null)

  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)

  const [hasInteracted, setHasInteracted] = useState(false)

  const colors = [
    { name: "Purple", value: "#8b5cf6" },
    { name: "Lavender", value: "#a78bfa" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Sky", value: "#0ea5e9" },
    { name: "Pink", value: "#ec4899" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Gold", value: "#f59e0b" },
    { name: "Yellow", value: "#eab308" },
    { name: "Green", value: "#10b981" },
    { name: "Emerald", value: "#059669" },
    { name: "Midnight", value: "#1e293b" },
    { name: "Silver", value: "#94a3b8" },
  ]

  useEffect(() => {
    const savedElements = localStorage.getItem("aid8-whiteboard-elements")
    const savedHistory = localStorage.getItem("aid8-whiteboard-history")
    const savedHistoryStep = localStorage.getItem("aid8-whiteboard-history-step")
    const savedHasInteracted = localStorage.getItem("aid8-whiteboard-has-interacted")

    if (savedElements) {
      try {
        const parsedElements = JSON.parse(savedElements)
        setElements(parsedElements)
      } catch (e) {
        console.error("Failed to load saved elements:", e)
      }
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setHistory(parsedHistory)
      } catch (e) {
        console.error("Failed to load saved history:", e)
      }
    }

    if (savedHistoryStep) {
      try {
        const parsedStep = JSON.parse(savedHistoryStep)
        setHistoryStep(parsedStep)
      } catch (e) {
        console.error("Failed to load saved history step:", e)
      }
    }

    if (savedHasInteracted) {
      setHasInteracted(savedHasInteracted === "true")
    }
  }, [])

  useEffect(() => {
    if (elements.length > 0 || hasInteracted) {
      localStorage.setItem("aid8-whiteboard-elements", JSON.stringify(elements))
    }
  }, [elements, hasInteracted])

  useEffect(() => {
    if (history.length > 1) {
      localStorage.setItem("aid8-whiteboard-history", JSON.stringify(history))
      localStorage.setItem("aid8-whiteboard-history-step", JSON.stringify(historyStep))
    }
  }, [history, historyStep])

  useEffect(() => {
    localStorage.setItem("aid8-whiteboard-has-interacted", hasInteracted.toString())
  }, [hasInteracted])

  const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return ""

    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length]
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
        return acc
      },
      ["M", ...stroke[0], "Q"],
    )

    d.push("Z")
    return d.join(" ")
  }

  const isPointInElement = (x: number, y: number, element: DrawnElement, ctx?: CanvasRenderingContext2D): boolean => {
    if (element.type === "path" && element.points) {
      return element.points.some((point) => Math.hypot(point.x - x, point.y - y) < 10)
    } else if (element.type === "rectangle" && element.x && element.y && element.width && element.height) {
      return x >= element.x && x <= element.x + element.width && y >= element.y && y <= element.y + element.height
    } else if (element.type === "circle" && element.x && element.y && element.width) {
      return Math.hypot(element.x - x, element.y - y) < element.width / 2
    } else if (element.type === "sticky" && element.x && element.y) {
      return x >= element.x && x <= element.x + 180 && y >= element.y && y <= element.y + 180
    } else if (element.type === "text" && element.x && element.y && element.text && ctx) {
      ctx.font = "bold 18px Inter"
      const metrics = ctx.measureText(element.text)
      return x >= element.x && x <= element.x + metrics.width && y >= element.y - 18 && y <= element.y
    }
    return false
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    elements.forEach((element) => {
      const isSelected = selectedElement === element.id

      ctx.strokeStyle = element.color
      ctx.fillStyle = element.color
      ctx.lineWidth = isSelected ? 4 : 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (element.type === "path" && element.points) {
        const stroke = getStroke(element.points, {
          size: 4,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        })

        const pathData = getSvgPathFromStroke(stroke)
        const path = new Path2D(pathData)
        ctx.fillStyle = element.color
        ctx.fill(path)

        if (isSelected && element.points.length > 0) {
          const xs = element.points.map((p) => p.x)
          const ys = element.points.map((p) => p.y)
          const minX = Math.min(...xs)
          const maxX = Math.max(...xs)
          const minY = Math.min(...ys)
          const maxY = Math.max(...ys)
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10)
          ctx.setLineDash([])
        }
      } else if (element.type === "rectangle" && element.x && element.y && element.width && element.height) {
        ctx.fillStyle = element.color + "40"
        ctx.fillRect(element.x, element.y, element.width, element.height)
        ctx.strokeRect(element.x, element.y, element.width, element.height)

        if (isSelected) {
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(element.x - 3, element.y - 3, element.width + 6, element.height + 6)
          ctx.setLineDash([])
        }
      } else if (element.type === "circle" && element.x && element.y && element.width) {
        ctx.beginPath()
        ctx.arc(element.x, element.y, element.width / 2, 0, Math.PI * 2)
        ctx.fillStyle = element.color + "40"
        ctx.fill()
        ctx.stroke()

        if (isSelected) {
          ctx.beginPath()
          ctx.arc(element.x, element.y, element.width / 2 + 5, 0, Math.PI * 2)
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.stroke()
          ctx.setLineDash([])
        }
      } else if (element.type === "sticky" && element.x && element.y && element.text) {
        const width = 180
        const height = 180
        ctx.fillStyle = element.color + "dd"
        ctx.fillRect(element.x, element.y, width, height)
        ctx.strokeStyle = element.color
        ctx.lineWidth = 2
        ctx.strokeRect(element.x, element.y, width, height)

        ctx.fillStyle = "#1a1a1a"
        ctx.font = "14px Inter"
        const lines = wrapText(ctx, element.text, width - 30)
        lines.forEach((line, i) => {
          ctx.fillText(line, element.x + 15, element.y + 30 + i * 20, width - 30)
        })

        if (isSelected) {
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(element.x - 3, element.y - 3, width + 6, height + 6)
          ctx.setLineDash([])
        }
      } else if (element.type === "text" && element.x && element.y && element.text) {
        ctx.fillStyle = element.color
        ctx.font = "bold 18px Inter"
        ctx.fillText(element.text, element.x, element.y)

        if (isSelected) {
          const metrics = ctx.measureText(element.text)
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(element.x - 3, element.y - 20, metrics.width + 6, 24)
          ctx.setLineDash([])
        }
      }
    })

    if (isDrawing && currentPath.length > 0 && tool === "pencil") {
      const stroke = getStroke(currentPath, {
        size: 4,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      })

      const pathData = getSvgPathFromStroke(stroke)
      const path = new Path2D(pathData)
      ctx.fillStyle = selectedColor
      ctx.fill(path)
    }

    if (previewShape) {
      ctx.strokeStyle = selectedColor
      ctx.fillStyle = selectedColor + "40"
      ctx.lineWidth = 3

      if (previewShape.type === "rectangle") {
        ctx.fillRect(previewShape.x, previewShape.y, previewShape.width, previewShape.height)
        ctx.strokeRect(previewShape.x, previewShape.y, previewShape.width, previewShape.height)
      } else if (previewShape.type === "circle") {
        ctx.beginPath()
        ctx.arc(previewShape.x, previewShape.y, previewShape.width / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }
  }, [elements, currentPath, isDrawing, tool, selectedColor, previewShape, selectedElement])

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = ""

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? " " : "") + word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [historyStep, history])

  const saveToHistory = (newElements: DrawnElement[]) => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(newElements)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
    setElements(newElements)
  }

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1
      setHistoryStep(newStep)
      setElements(history[newStep])
    }
  }

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1
      setHistoryStep(newStep)
      setElements(history[newStep])
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ctx = canvas.getContext("2d")

    if (tool === "select") {
      const clickedElement = elements.find((el) => isPointInElement(x, y, el, ctx || undefined))
      if (clickedElement) {
        setSelectedElement(clickedElement.id)
        setIsDrawing(true)
        // Calculate offset from element's origin
        if (clickedElement.type === "path" && clickedElement.points && clickedElement.points.length > 0) {
          const xs = clickedElement.points.map((p) => p.x)
          const ys = clickedElement.points.map((p) => p.y)
          const minX = Math.min(...xs)
          const minY = Math.min(...ys)
          setDragOffset({ x: x - minX, y: y - minY })
        } else if (clickedElement.x !== undefined && clickedElement.y !== undefined) {
          setDragOffset({ x: x - clickedElement.x, y: y - clickedElement.y })
        }
      } else {
        setSelectedElement(null)
      }
      return
    }

    if (tool === "eraser") {
      setIsDrawing(true)
      setCurrentPath([{ x, y }])
      return
    }

    if (tool === "pencil" || tool === "rectangle" || tool === "circle") {
      setIsDrawing(true)
    }

    if (tool === "pencil") {
      setCurrentPath([{ x, y }])
    } else if (tool === "rectangle" || tool === "circle") {
      setStartPoint({ x, y })
    } else if (tool === "sticky") {
      setActiveTextInput({
        id: Date.now().toString(),
        type: "sticky",
        x,
        y,
        width: 180,
        height: 180,
        text: "",
        color: selectedColor,
      })
    } else if (tool === "text") {
      setActiveTextInput({
        id: Date.now().toString(),
        type: "text",
        x,
        y,
        width: 300,
        height: 40,
        text: "",
        color: selectedColor,
      })
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ctx = canvas.getContext("2d")

    if (tool === "select" && selectedElement && dragOffset) {
      const newElements = elements.map((el) => {
        if (el.id !== selectedElement) return el

        if (el.type === "path" && el.points) {
          const xs = el.points.map((p) => p.x)
          const ys = el.points.map((p) => p.y)
          const minX = Math.min(...xs)
          const minY = Math.min(...ys)
          const deltaX = x - dragOffset.x - minX
          const deltaY = y - dragOffset.y - minY
          return {
            ...el,
            points: el.points.map((p) => ({ x: p.x + deltaX, y: p.y + deltaY })),
          }
        } else if (el.x !== undefined && el.y !== undefined) {
          return {
            ...el,
            x: x - dragOffset.x,
            y: y - dragOffset.y,
          }
        }
        return el
      })
      setElements(newElements)
      return
    }

    if (tool === "eraser") {
      setCurrentPath((prev) => [...prev, { x, y }])
      // Check all points in current eraser path for intersections
      const elementsToDelete = new Set<string>()
      currentPath.forEach((point) => {
        elements.forEach((el) => {
          if (isPointInElement(point.x, point.y, el, ctx || undefined)) {
            elementsToDelete.add(el.id)
          }
        })
      })
      if (elementsToDelete.size > 0) {
        const newElements = elements.filter((el) => !elementsToDelete.has(el.id))
        setElements(newElements)
      }
      return
    }

    if (tool === "pencil") {
      setCurrentPath((prev) => [...prev, { x, y }])
    } else if ((tool === "rectangle" || tool === "circle") && startPoint) {
      const width = x - startPoint.x
      const height = y - startPoint.y

      if (tool === "rectangle") {
        setPreviewShape({
          type: "rectangle",
          x: width > 0 ? startPoint.x : x,
          y: height > 0 ? startPoint.y : y,
          width: Math.abs(width),
          height: Math.abs(height),
        })
      } else if (tool === "circle") {
        const radius = Math.hypot(width, height)
        setPreviewShape({
          type: "circle",
          x: startPoint.x,
          y: startPoint.y,
          width: radius * 2,
          height: radius * 2,
        })
      }
    }
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    if (tool === "select" && selectedElement) {
      saveToHistory(elements)
      setDragOffset(null)
      setIsDrawing(false)
      return
    }

    if (tool === "eraser") {
      saveToHistory(elements)
      setCurrentPath([])
      setIsDrawing(false)
      return
    }

    if (tool === "pencil" && currentPath.length > 0) {
      saveToHistory([
        ...elements,
        {
          id: Date.now().toString(),
          type: "path",
          points: currentPath,
          color: selectedColor,
        },
      ])
      setCurrentPath([])
    } else if ((tool === "rectangle" || tool === "circle") && previewShape) {
      if (tool === "rectangle") {
        saveToHistory([
          ...elements,
          {
            id: Date.now().toString(),
            type: "rectangle",
            x: previewShape.x,
            y: previewShape.y,
            width: previewShape.width,
            height: previewShape.height,
            color: selectedColor,
          },
        ])
      } else if (tool === "circle") {
        saveToHistory([
          ...elements,
          {
            id: Date.now().toString(),
            type: "circle",
            x: previewShape.x,
            y: previewShape.y,
            width: previewShape.width,
            color: selectedColor,
          },
        ])
      }
      setPreviewShape(null)
      setStartPoint(null)
    }

    setIsDrawing(false)
  }

  const handleTextInputComplete = () => {
    if (activeTextInput) {
      const newElement: DrawnElement = {
        id: activeTextInput.id,
        type: activeTextInput.type,
        x: activeTextInput.x,
        y: activeTextInput.y,
        text: activeTextInput.text,
        color: activeTextInput.color,
      }

      if (activeTextInput.type === "sticky") {
        newElement.width = activeTextInput.width
        newElement.height = activeTextInput.height
      }

      saveToHistory([...elements, newElement])
      setActiveTextInput(null)
    }
  }

  const handleTextInputCancel = () => {
    setActiveTextInput(null)
  }

  const handleGenerateAI = () => {
    alert("AI generation will transform your whiteboard sketches into product concepts!")
  }

  const clearCanvas = () => {
    if (confirm("Clear the entire canvas?")) {
      saveToHistory([])
      localStorage.removeItem("aid8-whiteboard-elements")
      localStorage.removeItem("aid8-whiteboard-history")
      localStorage.removeItem("aid8-whiteboard-history-step")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Subtle background effects */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-secondary" />
              <h1 className="text-2xl font-serif font-bold text-foreground">AID8</h1>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save to Grimoire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Toolbar */}
        <aside className="w-20 border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col items-center py-6 gap-2 overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex-shrink-0"
            onClick={handleUndo}
            disabled={historyStep === 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex-shrink-0"
            onClick={handleRedo}
            disabled={historyStep === history.length - 1}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-5 h-5" />
          </Button>

          <div className="h-px w-8 bg-border/50 my-2 flex-shrink-0" />

          <Button
            variant={tool === "select" ? "default" : "ghost"}
            size="icon"
            className="w-12 h-12 flex-shrink-0"
            onClick={() => setTool("select")}
            title="Select"
          >
            <MousePointer className="w-5 h-5" />
          </Button>

          <Button
            variant={tool === "pencil" ? "default" : "ghost"}
            size="icon"
            className="w-12 h-12 flex-shrink-0"
            onClick={() => setTool("pencil")}
            title="Draw"
          >
            <Pencil className="w-5 h-5" />
          </Button>

          <Button
            variant={tool === "rectangle" ? "default" : "ghost"}
            size="icon"
            className="w-12 h-12 flex-shrink-0"
            onClick={() => setTool("rectangle")}
            title="Rectangle"
          >
            <Square className="w-5 h-5" />
          </Button>

          <Button
            variant={tool === "circle" ? "default" : "ghost"}
            size="icon"
            className="w-12 h-12 flex-shrink-0"
            onClick={() => setTool("circle")}
            title="Circle"
          >
            <Circle className="w-5 h-5" />
          </Button>

          <Button
            variant={tool === "sticky" ? "default" : "ghost"}
            size="icon"
            className="w-12 h-12 flex-shrink-0"
            onClick={() => setTool("sticky")}
            title="Sticky Note"
          >
            <StickyNote className="w-5 h-5" />
          </Button>

          <Button
            variant={tool === "text" ? "default" : "ghost"}
            size="icon"
            className="w-12 h-12 flex-shrink-0"
            onClick={() => setTool("text")}
            title="Text"
          >
            <Type className="w-5 h-5" />
          </Button>

          <Button
            variant={tool === "eraser" ? "default" : "ghost"}
            size="icon"
            className="w-12 h-12 flex-shrink-0 text-destructive hover:text-destructive"
            onClick={() => setTool("eraser")}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </Button>

          <div className="h-px w-8 bg-border/50 my-2 flex-shrink-0" />

          {/* Color Palette */}
          <div className="flex flex-col gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0 ${
                  selectedColor === color.value ? "border-foreground scale-110" : "border-border/50"
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
              />
            ))}
          </div>

          <div className="h-px w-8 bg-border/50 my-2 flex-shrink-0" />

          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex-shrink-0 text-destructive hover:text-destructive"
            onClick={clearCanvas}
            title="Clear Canvas"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair bg-background/50"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* Floating action buttons */}
          <div className="absolute top-6 right-6 flex gap-3 z-10">
            <Button
              variant="outline"
              size="sm"
              className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>

            <Button size="sm" className="animate-glow-pulse" onClick={handleGenerateAI}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </div>

          {activeTextInput && (
            <div
              className="absolute z-20"
              style={{
                left: activeTextInput.x,
                top: activeTextInput.y,
                width: activeTextInput.width,
                height: activeTextInput.height,
              }}
            >
              {activeTextInput.type === "sticky" ? (
                <div
                  className="w-full h-full rounded-lg shadow-xl border-2 p-4 relative"
                  style={{
                    backgroundColor: activeTextInput.color + "dd",
                    borderColor: activeTextInput.color,
                  }}
                >
                  <textarea
                    autoFocus
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-gray-900 placeholder-gray-600"
                    placeholder="Type your note..."
                    value={activeTextInput.text}
                    onChange={(e) =>
                      setActiveTextInput({
                        ...activeTextInput,
                        text: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault()
                        handleTextInputCancel()
                      }
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault()
                        handleTextInputComplete()
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button
                      className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                      onClick={handleTextInputComplete}
                    >
                      Done
                    </button>
                    <button
                      className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                      onClick={handleTextInputCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    className="w-full h-full bg-transparent border-b-2 outline-none text-lg font-bold px-2"
                    style={{
                      color: activeTextInput.color,
                      borderColor: activeTextInput.color,
                    }}
                    placeholder="Type text..."
                    value={activeTextInput.text}
                    onChange={(e) =>
                      setActiveTextInput({
                        ...activeTextInput,
                        text: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleTextInputComplete()
                      } else if (e.key === "Escape") {
                        e.preventDefault()
                        handleTextInputCancel()
                      }
                    }}
                  />
                  <div className="absolute top-full mt-2 left-0 flex gap-2">
                    <button
                      className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                      onClick={handleTextInputComplete}
                    >
                      Done
                    </button>
                    <button
                      className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                      onClick={handleTextInputCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help text */}
          {elements.length === 0 && !hasInteracted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-3 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-foreground">Your Magical Canvas</h3>
                <p className="text-muted-foreground max-w-md">
                  Start sketching your ideas with the drawing tools on the left. Add sticky notes, shapes, and text to
                  bring your vision to life.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - AI Insights */}
        <aside className="w-80 border-l border-border/50 bg-card/50 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg">AI Insights</h3>
                <Wand2 className="w-5 h-5 text-primary animate-sparkle" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Draw your product concept on the canvas. When ready, click "Generate with AI" to transform your sketches
                into detailed product insights.
              </p>
            </div>

            <div className="bg-background/50 rounded-xl border border-primary/20 p-4">
              <h4 className="font-semibold text-sm mb-3 text-foreground">Quick Tips</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Use sticky notes to organize ideas into categories</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Draw rough wireframes of your product interface</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Add text labels to clarify your concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Upload reference images for additional context</span>
                </li>
              </ul>
            </div>

            <div className="bg-background/50 rounded-xl border border-accent/20 p-4">
              <h4 className="font-semibold text-sm mb-3 text-foreground">AI Will Generate</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Product pitch summary</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Feature roadmap timeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Market analysis insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Social media content</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Polished diagrams</span>
                </li>
              </ul>
            </div>

            <Button variant="outline" className="w-full border-secondary/30 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Canvas
            </Button>
          </div>
        </aside>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-md w-full mx-4 animate-materialize">
            <h3 className="text-xl font-serif font-bold mb-4">Upload Reference Image</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a sketch or reference image to add to your canvas
            </p>
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center mb-6 hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG or PDF up to 10MB</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowUploadModal(false)
                  alert("Image upload functionality will be integrated!")
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
