
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, MapPin, Bell, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user) {
      // Set initial values based on user data
      setEmail(user.email);
      setName(user.email.split('@')[0]); // Mock data, would come from profile API
      setNeighborhood('Downtown'); // Mock data, would come from profile API
    }
  }, [user]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleSaveProfile = () => {
    setIsLoading(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      setIsLoading(false);
    }, 800);
  };

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    
    toast({
      title: notifications ? "Notifications Disabled" : "Notifications Enabled",
      description: notifications 
        ? "You will no longer receive notifications" 
        : "You will now receive notifications about updates",
    });
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Navbar />
      
      <main className="flex-1 container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-civic-blue/30 focus:border-civic-blue"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-civic-blue/30 focus:border-civic-blue"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Neighborhood</Label>
                    <Input 
                      id="neighborhood" 
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="border-civic-blue/30 focus:border-civic-blue"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="gradient-header hover:opacity-90 transition-all"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how you receive notifications about reports and community updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <Button 
                      variant={notifications ? "default" : "outline"}
                      onClick={handleNotificationToggle}
                      className={notifications ? "gradient-header" : ""}
                    >
                      {notifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Report Updates</h4>
                      <p className="text-sm text-gray-500">Get notified when your reported issues change status</p>
                    </div>
                    <Button variant="default" className="gradient-header">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Community Alerts</h4>
                      <p className="text-sm text-gray-500">Receive alerts about issues in your neighborhood</p>
                    </div>
                    <Button variant="default" className="gradient-header">
                      Enabled
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-gray-500">Update your account password</p>
                    </div>
                    <Button variant="outline">
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">
                      Enable
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-600">Delete Account</h4>
                      <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
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

export default Profile;
