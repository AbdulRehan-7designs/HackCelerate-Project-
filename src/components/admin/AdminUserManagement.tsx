import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Shield, Plus, Trash2, Mail, User, Search, X } from "lucide-react";
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

interface AdminUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  created_at: string;
  is_admin: boolean;
  role?: string;
}

const AdminUserManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
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
    notes: '',
  });

  // Fetch admin users
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST205') {
        throw error;
      }

      // Filter for admins
      let adminData = data;
      if (data && data.length > 0) {
        const hasIsAdminColumn = 'is_admin' in (data[0] || {});
        if (hasIsAdminColumn) {
          adminData = data.filter((profile: any) => profile.is_admin === true);
        } else {
          adminData = [];
        }
      }

      if (adminData && adminData.length > 0) {
        const adminUsers: AdminUser[] = adminData.map((profile: any) => {
          return {
            id: profile.id,
            email: profile.email || `${profile.username}@example.com`,
            username: profile.username,
            full_name: profile.full_name,
            created_at: profile.created_at || new Date().toISOString(),
            is_admin: true,
            role: 'admin',
          };
        });
        setAdmins(adminUsers);
      } else {
        setAdmins([]);
      }
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users. " + (error.message || ''),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Create admin user
  const createAdminUser = async () => {
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
      // Try to use admin API first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          username: formData.username,
          full_name: formData.fullName,
          role: 'admin',
          is_admin: true,
          notes: formData.notes,
        },
      });

      if (authError) {
        // Fallback to regular signUp
        if (authError.message.includes('admin') || authError.message.includes('permission')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                username: formData.username,
                full_name: formData.fullName,
                role: 'admin',
                is_admin: true,
                notes: formData.notes,
              },
              emailRedirectTo: `${window.location.origin}/admin`,
            },
          });

          if (signUpError) {
            throw signUpError;
          }

          if (signUpData.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: signUpData.user.id,
                username: formData.username,
                full_name: formData.fullName,
                is_admin: true,
                email: formData.email,
              });

            if (profileError && profileError.code !== 'PGRST205') {
              console.error('Error creating profile:', profileError);
            }

            toast({
              title: "Admin User Created",
              description: "User account created. They will receive an email verification link.",
            });
          }
        } else {
          throw authError;
        }
      } else if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: formData.username,
            full_name: formData.fullName,
            is_admin: true,
            email: formData.email,
          });

        if (profileError && profileError.code !== 'PGRST205') {
          console.error('Error creating profile:', profileError);
        }

        toast({
          title: "Admin User Created",
          description: `Admin account created for ${formData.fullName}.`,
        });
      }

      setFormData({
        email: '',
        password: '',
        fullName: '',
        username: '',
        notes: '',
      });
      setIsDialogOpen(false);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Remove admin status
  const removeAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove admin privileges from ${userName}?`)) {
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', userId);

      if (profileError && profileError.code !== 'PGRST205') {
        throw profileError;
      }

      try {
        const { error: metadataError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              role: 'citizen',
              is_admin: false,
            }
          }
        );
        if (metadataError && !metadataError.message.includes('admin')) {
          console.warn('Could not update user metadata:', metadataError);
        }
      } catch (metaErr) {
        console.log('Metadata update skipped:', metaErr);
      }

      toast({
        title: "Admin Removed",
        description: `${userName} has been removed as an admin.`,
      });

      fetchAdmins();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin privileges.",
        variant: "destructive",
      });
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-500" />
            Admin User Management
          </h2>
          <p className="text-gray-500 mt-1">Create and manage administrator accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Admin User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Admin User</DialogTitle>
              <DialogDescription>
                Create an administrator account with full system access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password <span className="text-red-500">*</span></Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-fullName">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="admin-fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username <span className="text-red-500">*</span></Label>
                  <Input
                    id="admin-username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Notes (Optional)</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Additional information about this admin"
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
              <Button onClick={createAdminUser} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Admin User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                {filteredAdmins.length} administrator{filteredAdmins.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search admins..."
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
            <div className="text-center py-8 text-gray-500">Loading administrators...</div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No administrators found matching your search.' : 'No administrators yet. Create one to get started.'}
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
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {admin.full_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {admin.email}
                      </div>
                    </TableCell>
                    <TableCell>@{admin.username}</TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Admin
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdmin(admin.id, admin.full_name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={admins.length === 1}
                        title={admins.length === 1 ? "Cannot remove the last admin" : "Remove admin privileges"}
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

export default AdminUserManagement;



