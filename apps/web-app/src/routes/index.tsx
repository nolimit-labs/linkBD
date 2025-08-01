import { createFileRoute, Link } from '@tanstack/react-router'
import MarketingHeader from '@/components/layout/marketing-header'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Simple Task Management <br />
            <span className="text-primary">Made Easy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            TodoApp helps you organize your tasks, boost productivity, and achieve your goals. 
            Simple, fast, and effective task management for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need to stay organized
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Simple & Intuitive</h3>
              <p className="text-muted-foreground">
                Create, edit, and complete tasks with just a few clicks. No complicated features to learn.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Stay Focused</h3>
              <p className="text-muted-foreground">
                Keep track of what's important. Mark tasks as complete and watch your productivity soar.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Access Anywhere</h3>
              <p className="text-muted-foreground">
                Your todos sync across all devices. Access your tasks from anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-muted/30 rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to get organized?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of users who manage their tasks with TodoApp.
          </p>
          <Link to="/sign-up">
            <Button size="lg" className="text-lg px-8">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">
            © 2024 TodoApp. Keep it simple, get things done.
          </p>
        </div>
      </footer>
    </div>
  )
}
