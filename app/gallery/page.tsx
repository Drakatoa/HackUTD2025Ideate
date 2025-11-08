"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Plus, Wand2, Home, Calendar, Trash2 } from "lucide-react"

const mockProjects = [
  {
    id: 1,
    title: "Smart Reading Tracker",
    description: "Mobile app for tracking reading habits with AI recommendations",
    date: "2 days ago",
    status: "completed",
  },
  {
    id: 2,
    title: "Collaborative Task Board",
    description: "Real-time collaboration tool with magical organization features",
    date: "5 days ago",
    status: "completed",
  },
  {
    id: 3,
    title: "Fitness Journey Planner",
    description: "Personalized workout and nutrition planning assistant",
    date: "1 week ago",
    status: "completed",
  },
]

export default function GalleryPage() {
  const [projects] = useState(mockProjects)
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-40 right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm">
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
              <Link href="/whiteboard">
                <Button className="animate-glow-pulse">
                  <Plus className="w-4 h-4 mr-2" />
                  New Creation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-balance">Your Grimoire</h2>
              <p className="text-muted-foreground mt-1">{"A collection of your magical creations"}</p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedProject(project.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated confetti effect on hover */}
                {selectedProject === project.id && (
                  <div className="absolute -top-4 -right-4 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-sparkle"
                        style={{
                          backgroundColor:
                            i % 3 === 0
                              ? "oklch(0.68 0.15 285)"
                              : i % 3 === 1
                                ? "oklch(0.75 0.12 55)"
                                : "oklch(0.72 0.18 295)",
                          left: `${Math.cos(i * 45) * 20}px`,
                          top: `${Math.sin(i * 45) * 20}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Card glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Card */}
                <div className="relative bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                  {/* Card image/preview */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-8 flex items-center justify-center border-b border-border/50">
                    <div className="w-full h-full bg-background/30 rounded-lg border border-primary/20 backdrop-blur-sm p-4 relative overflow-hidden">
                      {/* Gold outline glow */}
                      <div className="absolute inset-0 border-2 border-secondary/30 rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.2)] group-hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all" />

                      {/* Mockup content */}
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded bg-primary/20" />
                          <div className="h-4 flex-1 bg-accent/15 rounded" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="aspect-square bg-secondary/10 rounded" />
                          <div className="aspect-square bg-primary/10 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-serif font-bold text-lg text-foreground leading-snug flex-1 text-balance">
                        {project.title}
                      </h3>
                      <Wand2 className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{project.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{project.date}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>

                        <Link href="/whiteboard" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                            Open
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Completion indicator */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-secondary/50 flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* New Project Card */}
            <Link href="/whiteboard">
              <div className="relative group cursor-pointer h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />

                <div className="relative bg-card/50 backdrop-blur-sm border-2 border-dashed border-border/50 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center p-8 hover:border-primary/50 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-2">New Creation</h3>
                  <p className="text-sm text-muted-foreground text-center">{"Start a new magical project"}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Empty state message */}
          {projects.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3">Your Grimoire is Empty</h3>
              <p className="text-muted-foreground mb-6">{"Start creating magical projects to see them appear here"}</p>
              <Link href="/whiteboard">
                <Button className="animate-glow-pulse">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
