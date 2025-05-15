
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, User, Shield, Settings } from "lucide-react";

const SettingsPanel = () => {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [webNotifications, setWebNotifications] = useState(true);
  const [autoAssign, setAutoAssign] = useState(false);
  const [apiKey, setApiKey] = useState("sk_live_TownReport_123456789abcdefghijklmnopqrstuvwxyz");
  
  const handleSaveGeneral = () => {
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSaveIntegration = () => {
    toast({
      title: "Integration settings saved",
      description: "Your API integration settings have been updated.",
    });
  };
  
  const regenerateApiKey = () => {
    const newKey = "sk_live_TownReport_" + Math.random().toString(36).substring(2);
    setApiKey(newKey);
    toast({
      title: "API Key regenerated",
      description: "Your new API key has been generated. Be sure to save it.",
    });
  };
  
  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="grid grid-cols-4 w-full md:w-auto md:inline-flex">
        <TabsTrigger value="general">
          <Settings className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">General</span>
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="users">
          <User className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Users</span>
        </TabsTrigger>
        <TabsTrigger value="integration">
          <Shield className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Integration</span>
        </TabsTrigger>
      </TabsList>
      
      {/* General Settings */}
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your application-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">Application Name</Label>
              <Input id="app-name" defaultValue="TownReport" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-description">Application Description</Label>
              <Textarea 
                id="app-description" 
                defaultValue="A platform for citizens to report civic issues in their community." 
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto-assign">Auto-assign reports to officials</Label>
              <Switch 
                id="auto-assign" 
                checked={autoAssign} 
                onCheckedChange={setAutoAssign} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-area">Default Area</Label>
              <Select defaultValue="downtown">
                <SelectTrigger id="default-area">
                  <SelectValue placeholder="Select default area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downtown">Downtown</SelectItem>
                  <SelectItem value="north">North Side</SelectItem>
                  <SelectItem value="east">East Side</SelectItem>
                  <SelectItem value="south">South Side</SelectItem>
                  <SelectItem value="west">West Side</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveGeneral}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      {/* Notification Settings */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how and when notifications are sent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch 
                id="email-notifications" 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications} 
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="web-notifications">Web Notifications</Label>
              <Switch 
                id="web-notifications" 
                checked={webNotifications} 
                onCheckedChange={setWebNotifications} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="digest-frequency">Digest Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger id="digest-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-templates">Notification Templates</Label>
              <Select defaultValue="standard">
                <SelectTrigger id="notification-templates">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveNotifications}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      {/* User Management */}
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage officials and administrators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">John Smith</p>
                    <p className="text-sm text-gray-500">john.smith@example.com</p>
                    <p className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1">Administrator</p>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Jane Doe</p>
                    <p className="text-sm text-gray-500">jane.doe@example.com</p>
                    <p className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">Official</p>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alex Johnson</p>
                    <p className="text-sm text-gray-500">alex.johnson@example.com</p>
                    <p className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">Official</p>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <Button variant="outline">
                <span>Add New User</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* API/Integrations */}
      <TabsContent value="integration">
        <Card>
          <CardHeader>
            <CardTitle>API & Integrations</CardTitle>
            <CardDescription>Manage external integrations and API settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex space-x-2">
                <Input id="api-key" value={apiKey} readOnly className="font-mono text-xs" />
                <Button variant="outline" onClick={regenerateApiKey}>Regenerate</Button>
              </div>
              <p className="text-xs text-muted-foreground">Keep this key secret. It provides full access to the API.</p>
            </div>
            <div className="space-y-2 pt-4">
              <Label>Connected Services</Label>
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">M</span>
                    </div>
                    <span className="font-medium">Maps API</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Connected</span>
                  </div>
                </div>
              </div>
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">N</span>
                    </div>
                    <span className="font-medium">Notification Service</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Connected</span>
                  </div>
                </div>
              </div>
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-bold">A</span>
                    </div>
                    <span className="font-medium">Analytics Service</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Disconnected</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveIntegration}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsPanel;
