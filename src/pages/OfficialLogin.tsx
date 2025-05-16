
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, LogIn, ShieldCheck } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useAuth } from '@/context/AuthContext';

const OfficialLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  // If already logged in, redirect to admin
  if (isAuthenticated) {
    return <Navigate to="/admin" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For officials, we'll automatically treat them as admins
      // In a real app, this would verify against a database of official accounts
      await login(email, password);
      
      toast({
        title: "Official Login Successful",
        description: "Welcome to the admin dashboard.",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md gradient-card animate-scale-in hover:shadow-xl transition-all duration-300">
          <CardHeader className="space-y-1 flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-2 hover:scale-105 transition-transform">
              <ShieldCheck className="h-8 w-8 text-civic-blue" />
              <span className="font-bold text-2xl">CivicPulse</span>
              <span className="rounded bg-civic-blue text-white px-2 py-0.5 text-xs font-semibold">OFFICIALS</span>
            </div>
            <CardTitle className="text-2xl">Official Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the official administration panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input 
                  id="email" 
                  placeholder="official@civicpulse.gov" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-civic-blue/30 focus:border-civic-blue hover:border-civic-blue/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/officials/forgot-password" className="text-xs text-civic-blue hover:underline hover:text-civic-blue/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  className="border-civic-blue/30 focus:border-civic-blue hover:border-civic-blue/50 transition-all"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-header hover:opacity-90 transition-all hover:shadow-md" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" /> Official Sign In
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Regular user?{" "}
              <Link to="/login" className="text-civic-blue hover:underline hover:text-civic-blue/80 transition-colors">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
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

export default OfficialLogin;
