
import { useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Welcome toast on initial load - only show once per session
  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('shown-welcome');
    if (!hasShownWelcome) {
      setTimeout(() => {
        toast({
          title: user ? `Welcome back, ${user.email.split('@')[0]}!` : "Welcome to TownReport AI",
          description: "Help improve your community by reporting and tracking local issues.",
        });
        sessionStorage.setItem('shown-welcome', 'true');
      }, 1000);
    }
  }, [toast, user]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-12 md:py-20 animate-fade-in">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Make Your Community Better
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Report local issues, track their resolution, and see the impact in your neighborhood.
                </p>
              </div>
              <div className="space-x-4">
                <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 animate-scale-in">
                  Get Started
                </button>
                <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      
        <section className="py-12 md:py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 stagger-children">
              <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mb-2 text-lg font-semibold">Report Issues</div>
                <p className="text-sm text-gray-500">
                  Easily report problems in your community using our intuitive interface.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mb-2 text-lg font-semibold">Track Progress</div>
                <p className="text-sm text-gray-500">
                  Follow the status of reported issues from submission to resolution.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mb-2 text-lg font-semibold">Upvote Issues</div>
                <p className="text-sm text-gray-500">
                  Support important issues by upvoting them to increase visibility.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mb-2 text-lg font-semibold">AI-Powered</div>
                <p className="text-sm text-gray-500">
                  Our AI technology helps classify and route issues to the right departments.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} TownReport AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with community in mind. Version 1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
