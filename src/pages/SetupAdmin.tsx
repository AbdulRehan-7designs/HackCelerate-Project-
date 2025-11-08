import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";

const SetupAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if admin already exists
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_admin', true)
          .limit(1);

        if (error && error.code !== 'PGRST205') {
          console.error('Error checking admin:', error);
        }

        setHasAdmin(data && data.length > 0);
      } catch (error) {
        console.error('Error:', error);
        setHasAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminExists();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !fullName || !username) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if email confirmation is required by trying signup first
      let signUpData = null;
      let signUpError = null;
      
      try {
        const result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: fullName,
              role: 'admin',
              is_admin: true,
            },
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        signUpData = result.data;
        signUpError = result.error;
      } catch (err: any) {
        signUpError = err;
      }

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          throw new Error('An account with this email already exists. Please use a different email or log in.');
        }
        
        if (signUpError.message.includes('not allowed') || signUpError.message.includes('User not allowed')) {
          // This usually means email confirmation is required or signups are disabled
          // Provide helpful instructions
          throw new Error(
            'Signup is restricted. This usually means:\n' +
            '1. Email confirmation is required - Check your Supabase dashboard settings\n' +
            '2. Signups might be disabled - Enable them in Authentication > Settings\n' +
            '3. Try using the Supabase dashboard to create the admin user manually\n\n' +
            'Alternatively, you can:\n' +
            '- Register as a regular user first, then manually set is_admin=true in the profiles table\n' +
            '- Or disable email confirmation temporarily in Supabase settings'
          );
        }
        
        // For other errors, try to provide more context
        throw new Error(`Signup failed: ${signUpError.message}. Please check your Supabase configuration.`);
      }

      if (signUpData?.user) {
        // Check if email confirmation is required
        const needsConfirmation = !signUpData.session;
        
        // Wait a bit for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update profile to set is_admin (trigger might have created it)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_admin: true,
            username,
            full_name: fullName,
          })
          .eq('id', signUpData.user.id);

        if (updateError && updateError.code !== 'PGRST205') {
          // If update fails, try insert (might not exist yet)
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              username,
              full_name: fullName,
              is_admin: true,
            });

          if (insertError && insertError.code !== 'PGRST205' && insertError.code !== '23505') {
            console.error('Error creating/updating profile:', insertError);
            // Don't throw - account is created, profile can be fixed later
            toast({
              title: "Account Created",
              description: needsConfirmation 
                ? "Account created. Please verify your email, then log in. After logging in, you may need to manually set is_admin=true in the database."
                : "Account created but profile setup had issues.",
              variant: "default",
            });
          } else {
            toast({
              title: "Admin Account Created",
              description: needsConfirmation
                ? "Please check your email for verification link. After verifying, you can log in."
                : "You can now log in with your credentials.",
            });
          }
        } else {
          toast({
            title: "Admin Account Created",
            description: needsConfirmation
              ? "Please check your email for verification link. After verifying, you can log in."
              : "You can now log in with your credentials.",
          });
        }

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error('User account was not created. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      const errorMessage = error.message || error.toString() || "Failed to create admin account. Please check your connection and try again.";
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Checking system status...</p>
          </div>
        </main>
      </div>
    );
  }

  if (hasAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Admin Already Exists</CardTitle>
              <CardDescription>
                An administrator account has already been set up.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Please log in with an existing admin account or contact the system administrator.
              </p>
              <Button 
                className="w-full" 
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md gradient-card animate-scale-in">
          <CardHeader className="space-y-1 flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
            <CardTitle className="text-2xl">Setup Administrator Account</CardTitle>
            <CardDescription>
              Create the first administrator account for the system
            </CardDescription>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  This page is only accessible when no admin account exists. After creating the first admin, 
                  additional admins can be created from the admin dashboard.
                </p>
              </div>
            </div>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> If setup fails, check the browser console for detailed error messages. 
                  You may need to verify your email before the account is fully activated.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-civic-blue/30 focus:border-civic-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="johndoe" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-civic-blue/30 focus:border-civic-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="admin@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-civic-blue/30 focus:border-civic-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  className="border-civic-blue/30 focus:border-civic-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required
                  className="border-civic-blue/30 focus:border-civic-blue"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-header hover:opacity-90 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SetupAdmin;

