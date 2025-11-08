
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, LogIn } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  // If already logged in, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" />;
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
      const { error } = await login(email, password);
      
      if (error) {
        // Error already handled in auth context
        return;
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred.",
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
              <MapPin className="h-8 w-8 text-civic-blue" />
              <span className="font-bold text-2xl">CivicPulse</span>
              <span className="rounded bg-civic-blue text-white px-2 py-0.5 text-xs font-semibold">AI</span>
            </div>
            <CardTitle className="text-2xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="name@example.com" 
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
                  <Link to="/forgot-password" className="text-xs text-civic-blue hover:underline hover:text-civic-blue/80 transition-colors">
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
                    <LogIn className="h-4 w-4" /> Sign In
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <div className="flex justify-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-civic-blue hover:underline hover:text-civic-blue/80 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex-1 border-t"></div>
              <span>OR</span>
              <div className="flex-1 border-t"></div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Link to="/officials/login">
                <Button variant="outline" className="w-full" size="sm">
                  Login as Official
                </Button>
              </Link>
              <Link to="/setup-admin">
                <Button variant="ghost" className="w-full text-xs" size="sm">
                  Setup Admin Account
                </Button>
              </Link>
            </div>
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

export default Login;
