
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

type User = {
  email: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('townreport-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    // Mock login - would connect to actual auth API in production
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate API call
    const isAdmin = email.includes('admin');
    const userData = { email, isAdmin };
    
    // Save to localStorage
    localStorage.setItem('townreport-user', JSON.stringify(userData));
    setUser(userData);
    
    toast({
      title: isAdmin ? "Admin Login Successful" : "Login Successful",
      description: isAdmin ? "Welcome to the admin dashboard." : "Welcome back to TownReport AI.",
    });
    
    // Navigate based on user type
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };
  
  const logout = () => {
    localStorage.removeItem('townreport-user');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
