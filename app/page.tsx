import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2, BookOpen, Lightbulb } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-36 h-36 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />

        {/* Sparkle elements */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-secondary rounded-full animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-secondary" />
              <h1 className="text-2xl font-serif font-bold text-foreground">AID8</h1>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/whiteboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Whiteboard
              </Link>
              <Link href="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Gallery
              </Link>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Enchanted by AI</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-serif font-bold text-balance mb-6 leading-tight">
            Turn your sketches into{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-glow-pulse">
              stories
            </span>
            , your ideas into{" "}
            <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              worlds
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 text-balance leading-relaxed max-w-2xl mx-auto">
            {
              "AID8 is your AI-powered whiteboard that transforms rough sketches and text ideas into polished product concepts. Like a magical book that brings your imagination to life."
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/whiteboard">
              <Button size="lg" className="text-lg px-8 py-6 animate-glow-pulse">
                <Sparkles className="w-5 h-5 mr-2" />
                Try the Magic
              </Button>
            </Link>
            <Link href="/whiteboard">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary/30 hover:border-primary/50 bg-transparent"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Enter the Whiteboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-serif font-bold mb-4">See the Magic in Action</h3>
          <p className="text-lg text-muted-foreground">{"Watch ideas transform into reality"}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-serif font-bold mb-3">Sketch to Diagram</h4>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Upload rough sketches and watch them materialize into polished diagrams with magical animations
              </p>
              <div className="aspect-video bg-muted/30 rounded-lg border border-border/30 flex items-center justify-center">
                <img
                  src="/product-diagram-wireframe-sketch.jpg"
                  alt="Diagram example"
                  className="w-full h-full object-cover rounded-lg opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-secondary/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="text-xl font-serif font-bold mb-3">AI-Powered Pitch</h4>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Generate compelling pitch summaries and roadmaps that captivate your audience
              </p>
              <div className="aspect-video bg-muted/30 rounded-lg border border-border/30 p-4 text-left">
                <div className="space-y-2">
                  <div className="h-3 bg-primary/20 rounded w-3/4" />
                  <div className="h-3 bg-primary/15 rounded w-full" />
                  <div className="h-3 bg-primary/10 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-accent/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h4 className="text-xl font-serif font-bold mb-3">Social Ready</h4>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {"Get AI-generated tweets and content ready to share your vision with the world"}
              </p>
              <div className="aspect-video bg-muted/30 rounded-lg border border-border/30 p-4 text-left">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/30" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-accent/20 rounded w-3/4" />
                      <div className="h-2 bg-accent/15 rounded w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-2xl" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-primary/30 rounded-3xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-secondary mx-auto mb-6 animate-glow-pulse" />
              <h3 className="text-4xl font-serif font-bold mb-4">Ready to bring your ideas to life?</h3>
              <p className="text-lg text-muted-foreground mb-8">
                {"Join the enchanted workspace where creativity meets productivity"}
              </p>
              <Link href="/whiteboard">
                <Button size="lg" className="text-lg px-10 py-6">
                  <Wand2 className="w-5 h-5 mr-2" />
                  Start Creating Magic
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground">{"Made with ✨ for dreamers and builders"}</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
