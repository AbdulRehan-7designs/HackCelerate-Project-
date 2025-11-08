import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Building2, Plus, Trash2, Edit, Mail, User, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface OfficialUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  created_at: string;
  is_official: boolean;
  role?: string;
}

const OfficialUserManagement = () => {
  const [officials, setOfficials] = useState<OfficialUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    department: '',
    notes: '',
  });

  // Fetch official users
  const fetchOfficials = async () => {
    setIsLoading(true);
    try {
      // Fetch from profiles table where is_official is true
      // If is_official column doesn't exist, we'll handle it gracefully
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST205') {
        throw error;
      }

      // Filter for officials if column exists, otherwise check user_metadata
      let officialData = data;
      if (data && data.length > 0) {
        // Check if is_official column exists by checking first item
        const hasIsOfficialColumn = 'is_official' in (data[0] || {});
        if (hasIsOfficialColumn) {
          officialData = data.filter((profile: any) => profile.is_official === true);
        } else {
          // Fallback: if column doesn't exist, return empty array
          // In production, you'd want to run the migration first
          officialData = [];
        }
      }

      if (officialData && officialData.length > 0) {
        // Map profiles to official users
        const officialUsers: OfficialUser[] = officialData.map((profile: any) => {
          return {
            id: profile.id,
            email: profile.email || `${profile.username}@example.com`,
            username: profile.username,
            full_name: profile.full_name,
            created_at: profile.created_at || new Date().toISOString(),
            is_official: profile.is_official !== undefined ? profile.is_official : true,
            role: 'official',
          };
        });
        setOfficials(officialUsers);
      } else {
        setOfficials([]);
      }
    } catch (error: any) {
      console.error('Error fetching officials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch official users. " + (error.message || ''),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  // Create official user
  const createOfficialUser = async () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.username) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          username: formData.username,
          full_name: formData.fullName,
          role: 'official',
          is_official: true,
          department: formData.department,
          notes: formData.notes,
        },
      });

      if (authError) {
        // If admin API is not available, use regular signUp
        if (authError.message.includes('admin') || authError.message.includes('permission')) {
          // Fallback: Use regular signUp (user will need to verify email)
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                username: formData.username,
                full_name: formData.fullName,
                role: 'official',
                is_official: true,
                department: formData.department,
                notes: formData.notes,
              },
              emailRedirectTo: `${window.location.origin}/official`,
            },
          });

          if (signUpError) {
            throw signUpError;
          }

          if (signUpData.user) {
            // Create profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: signUpData.user.id,
                username: formData.username,
                full_name: formData.fullName,
                is_official: true,
                email: formData.email,
              });

            if (profileError && profileError.code !== 'PGRST205') {
              console.error('Error creating profile:', profileError);
            }

            toast({
              title: "Official User Created",
              description: "User account created. They will receive an email verification link.",
            });
          }
        } else {
          throw authError;
        }
      } else if (authData.user) {
        // Create profile for admin-created user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: formData.username,
            full_name: formData.fullName,
            is_official: true,
            email: formData.email,
          });

        if (profileError && profileError.code !== 'PGRST205') {
          console.error('Error creating profile:', profileError);
        }

        toast({
          title: "Official User Created",
          description: `Official account created for ${formData.fullName}.`,
        });
      }

      // Reset form and close dialog
      setFormData({
        email: '',
        password: '',
        fullName: '',
        username: '',
        department: '',
        notes: '',
      });
      setIsDialogOpen(false);
      fetchOfficials(); // Refresh list
    } catch (error: any) {
      console.error('Error creating official user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create official user.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Delete official user (remove official status)
  const deleteOfficial = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} as an official?`)) {
      return;
    }

    try {
      // Update profile to remove official status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_official: false })
        .eq('id', userId);

      if (profileError && profileError.code !== 'PGRST205') {
        throw profileError;
      }

      // Also update user metadata
      try {
        const { error: metadataError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              role: 'citizen',
              is_official: false,
            }
          }
        );
        if (metadataError && !metadataError.message.includes('admin')) {
          console.warn('Could not update user metadata:', metadataError);
        }
      } catch (metaErr) {
        // Metadata update is optional
        console.log('Metadata update skipped:', metaErr);
      }

      toast({
        title: "Official Removed",
        description: `${userName} has been removed as an official.`,
      });

      fetchOfficials(); // Refresh list
    } catch (error: any) {
      console.error('Error removing official:', error);
      toast({
        title: "Error",
        description: "Failed to remove official user.",
        variant: "destructive",
      });
    }
  };

  const filteredOfficials = officials.filter(official =>
    official.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    official.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    official.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-500" />
            Official User Management
          </h2>
          <p className="text-gray-500 mt-1">Create and manage official user accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Official User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Official User</DialogTitle>
              <DialogDescription>
                Create an account for a government official or authorized personnel.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="official@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  placeholder="e.g., Public Works, Transportation"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this official"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createOfficialUser} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Official User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Official Users</CardTitle>
              <CardDescription>
                {filteredOfficials.length} official user{filteredOfficials.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search officials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading officials...</div>
          ) : filteredOfficials.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No officials found matching your search.' : 'No official users yet. Create one to get started.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOfficials.map((official) => (
                  <TableRow key={official.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {official.full_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {official.email}
                      </div>
                    </TableCell>
                    <TableCell>@{official.username}</TableCell>
                    <TableCell>
                      {new Date(official.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Official
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOfficial(official.id, official.full_name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficialUserManagement;

