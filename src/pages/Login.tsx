
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    
    // In a real app, this would be replaced with an actual auth API call
    setTimeout(() => {
      if (email.includes('admin')) {
        // Admin login will redirect to admin dashboard
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard.",
        });
        // In a real app with proper auth: navigate('/admin')
      } else {
        // Regular user login
        toast({
          title: "Login Successful",
          description: "Welcome back to TownReport AI.",
        });
        // In a real app with proper auth: navigate('/')
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md gradient-card">
          <CardHeader className="space-y-1 flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-8 w-8 text-civic-blue" />
              <span className="font-bold text-2xl">TownReport</span>
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
                  className="border-civic-blue/30 focus:border-civic-blue"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-civic-blue hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  className="border-civic-blue/30 focus:border-civic-blue"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-header" 
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
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-civic-blue hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
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

export default Login;
