
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Welcome toast on initial load - only show once per session
  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('shown-welcome');
    if (!hasShownWelcome) {
      setTimeout(() => {
        toast({
          title: user ? `Welcome back, ${user.email.split('@')[0]}!` : "Welcome to CivicPulse AI",
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
        {/* Hero Section */}
        <section className="py-12 md:py-16 animate-fade-in">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-blue-600">
                Make Your Community Better
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Report local issues, track their resolution, and see the impact in your neighborhood.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 mt-4">
                <Link to="/reports">
                  <Button size="lg" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 animate-scale-in w-full sm:w-auto">
                    Get Started <span className="ml-2">→</span>
                  </Button>
                </Link>
                <Link to="/officials/login">
                  <Button variant="outline" size="lg" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70 animate-scale-in w-full sm:w-auto" style={{ animationDelay: '0.2s' }}>
                    Officials Login <span className="ml-2">→</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      
        {/* AI Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Powered by Advanced AI</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Our platform combines artificial intelligence with user-friendly design to make community improvement effortless.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">AI Feature</span>
                <h3 className="text-lg font-semibold mt-2 mb-2">AI-Powered Classification</h3>
                <p className="text-gray-600 text-sm">
                  Smart issue categorization and routing using advanced machine learning algorithms.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">AI Feature</span>
                <h3 className="text-lg font-semibold mt-2 mb-2">Smart Location Analysis</h3>
                <p className="text-gray-600 text-sm">
                  AI-powered location clustering to identify problem hotspots in your community.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 9H16M8 13H16M8 17H12M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">AI Feature</span>
                <h3 className="text-lg font-semibold mt-2 mb-2">Intelligent Updates</h3>
                <p className="text-gray-600 text-sm">
                  Get AI-generated progress updates and estimated resolution times.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 10V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V10M5 10V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V10M5 10H19M12 15V17M10 15H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">AI Feature</span>
                <h3 className="text-lg font-semibold mt-2 mb-2">Automated Verification</h3>
                <p className="text-gray-600 text-sm">
                  AI-powered verification system to prevent duplicate reports and ensure accuracy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} CivicPulse AI. All rights reserved.
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
