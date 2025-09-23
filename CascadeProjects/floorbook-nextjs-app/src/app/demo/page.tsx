import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                Floorbook Approach
              </h1>
              <p className="text-muted-foreground mt-1">
                Design System & Component Demo
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/courses">
                <Button variant="secondary">
                  📚 Back to Courses
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Color Palette Showcase */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground font-serif">
            Custom Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="text-center">
              <div className="w-full h-16 bg-primary rounded-lg mb-2 border"></div>
              <p className="text-sm font-mono">Primary</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-secondary rounded-lg mb-2 border"></div>
              <p className="text-sm font-mono">Secondary</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-accent rounded-lg mb-2 border"></div>
              <p className="text-sm font-mono">Accent</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-muted rounded-lg mb-2 border"></div>
              <p className="text-sm font-mono">Muted</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-destructive rounded-lg mb-2 border"></div>
              <p className="text-sm font-mono">Destructive</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-card border rounded-lg mb-2"></div>
              <p className="text-sm font-mono">Card</p>
            </div>
          </div>
        </section>

        {/* Component Showcase */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground font-serif">
            ShadCN Components
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Buttons Card */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>
                  Various button styles with the custom palette
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </CardContent>
            </Card>

            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
                <CardDescription>
                  Input fields and form controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Enter your message" rows={3} />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Submit</Button>
              </CardFooter>
            </Card>

            {/* Typography Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Typography</CardTitle>
                <CardDescription>
                  Font families and text styles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-sans text-sm text-muted-foreground">Sans-serif (AR One Sans)</p>
                  <p className="font-sans">The quick brown fox jumps over the lazy dog.</p>
                </div>
                <div>
                  <p className="font-serif text-sm text-muted-foreground">Serif (Merriweather)</p>
                  <p className="font-serif">The quick brown fox jumps over the lazy dog.</p>
                </div>
                <div>
                  <p className="font-mono text-sm text-muted-foreground">Monospace (Source Code Pro)</p>
                  <p className="font-mono text-sm">console.log(&quot;Hello, World!&quot;);</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Educational Content Preview */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-foreground font-serif">
            Educational Content Preview
          </h2>
          
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle className="text-xl font-serif">
                Course 1: Foundations of Inquiry-Based Learning
              </CardTitle>
              <CardDescription>
                Embark on a transformative journey that will fundamentally change how you see children and learning.
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-green max-w-none">
              <div className="bg-accent/20 border-l-4 border-primary p-4 rounded-r-lg">
                <h3 className="text-lg font-semibold text-primary mb-2 font-serif">
                  Module 1: Know Your Teaching Style
                </h3>
                <p className="text-foreground">
                  Identify your current teaching approach and understand the difference between traditional and inquiry-based methods. 
                  This foundational module helps you recognize your starting point and envision the transformation ahead.
                </p>
              </div>
              
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-secondary-foreground mb-2">Learning Goals</h4>
                  <ul className="text-sm space-y-1 text-foreground">
                    <li>• Understand inquiry-based learning principles</li>
                    <li>• Assess your current teaching practices</li>
                    <li>• Identify areas for growth and development</li>
                  </ul>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-muted-foreground mb-2">Resources Included</h4>
                  <ul className="text-sm space-y-1 text-foreground">
                    <li>• 12-minute overview video</li>
                    <li>• Self-assessment tool</li>
                    <li>• Comparison charts and handouts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-3">
                <Link href="/courses">
                  <Button>View Live Courses</Button>
                </Link>
                <Link href="/courses?course=course1">
                  <Button variant="outline">Start Course 1</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="font-serif">
              Floorbook Approach Learning Series - Built with Next.js & ShadCN UI
            </p>
            <p className="text-sm mt-2">
              Custom color palette: Warm earth tones with natural green accents
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}