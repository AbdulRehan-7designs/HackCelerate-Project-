
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'citizen' | 'admin' | 'official';

type UserProfile = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  is_admin: boolean; // Keep for backward compatibility
  is_official: boolean;
  issues_reported: number;
  issues_voted: number;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData: { username: string; full_name: string; role: UserRole }) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  userRole: UserRole | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      // First, try to get profile from profiles table
      let profileData = null;
      let profileError = null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(); // Use maybeSingle to avoid errors if profile doesn't exist
        
        profileData = data;
        profileError = error;
        
        // Only treat as error if it's not a "not found" error
        if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
          console.warn('Error fetching profile:', error.message);
        }
      } catch (err: any) {
        profileError = err;
        // Don't log if it's just a table not found error
        if (err.code !== 'PGRST205' && err.code !== 'PGRST116') {
          console.warn('Exception fetching profile:', err.message);
        }
      }

      // Also check users table for role (if it exists)
      // Skip if there are RLS policy issues (infinite recursion errors)
      let userRoleData = null;
      let skipUsersTable = false;
      
      try {
        // First try by ID
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, role, full_name, email')
          .eq('id', userId)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors if not found
        
        // Check for infinite recursion or policy errors
        if (userError && (
          userError.message?.includes('infinite recursion') ||
          userError.message?.includes('policy') ||
          userError.code === 'PGRST301' ||
          userError.status === 500
        )) {
          console.warn('Skipping users table query due to RLS policy issue:', userError.message);
          skipUsersTable = true;
        }
        // If not found by ID and no policy error, try by email
        else if ((userError || !userData) && user?.email && !skipUsersTable) {
          const { data: emailData, error: emailError } = await supabase
            .from('users')
            .select('id, role, full_name, email')
            .eq('email', user.email)
            .maybeSingle();
          
          if (!emailError && emailData) {
            userData = emailData;
            userError = null;
          } else if (emailError && (
            emailError.message?.includes('infinite recursion') ||
            emailError.message?.includes('policy') ||
            emailError.code === 'PGRST301'
          )) {
            skipUsersTable = true;
          }
        }
        
        // Only set userRoleData if we have valid data and no critical errors
        if (!userError && userData && !skipUsersTable) {
          userRoleData = userData;
        }
      } catch (err: any) {
        // Skip users table if there are policy issues
        if (err.message?.includes('infinite recursion') || err.message?.includes('policy')) {
          skipUsersTable = true;
          console.warn('Skipping users table due to policy error');
        }
      }

      // Determine role - prioritize user metadata (most reliable), then users table, then profile
      let role: UserRole = 'citizen';
      let isAdmin = false;
      let isOfficial = false;
      let fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
      let username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'user';

      // Check user metadata FIRST (most reliable, no database queries needed)
      if (user?.user_metadata?.role) {
        const metadataRole = user.user_metadata.role as UserRole;
        role = metadataRole;
        isAdmin = role === 'admin';
        isOfficial = role === 'official';
        if (user.user_metadata.full_name) fullName = user.user_metadata.full_name;
        if (user.user_metadata.username) username = user.user_metadata.username;
      }
      // Then check users table (if no policy issues)
      else if (userRoleData?.role && !skipUsersTable) {
        role = userRoleData.role as UserRole;
        isAdmin = role === 'admin';
        isOfficial = role === 'official';
        if (userRoleData.full_name) fullName = userRoleData.full_name;
      }
      // Then check profile data
      else if (profileData) {
        if (profileData.is_admin) {
          role = 'admin';
          isAdmin = true;
        } else if (profileData.is_official !== undefined && profileData.is_official) {
          role = 'official';
          isOfficial = true;
        } else if (profileData.role) {
          role = profileData.role as UserRole;
          isAdmin = role === 'admin';
          isOfficial = role === 'official';
        }
        if (profileData.full_name) fullName = profileData.full_name;
        if (profileData.username) username = profileData.username;
      }

      // If we found user role data but no profile, try to create/update profile
      if (userRoleData && !profileData) {
        // Try to create or update profile based on role
        try {
          const isAdmin = userRoleData.role === 'admin';
          const isOfficial = userRoleData.role === 'official';
          
          await supabase
            .from('profiles')
            .upsert({
              id: userId,
              username: username,
              full_name: fullName,
              is_admin: isAdmin,
              is_official: isOfficial,
            }, {
              onConflict: 'id'
            });
        } catch (err: any) {
          // Ignore errors - profile creation is optional
          // Only log if it's not a table not found error
          if (err.code !== 'PGRST205') {
            console.warn('Could not create/update profile:', err.message);
          }
        }
      }

      return {
        id: userId,
        email: user?.email || userRoleData?.email || '',
        username: username,
        full_name: fullName,
        avatar_url: profileData?.avatar_url || null,
        role: role,
        is_admin: isAdmin,
        is_official: isOfficial,
        issues_reported: profileData?.issues_reported || 0,
        issues_voted: profileData?.issues_voted || 0,
      };
    } catch (error: any) {
      // Silently handle all errors and return default profile
      // Don't log errors to console to prevent spam
      const role = (user?.user_metadata?.role as UserRole) || 'citizen';
      return {
        id: userId,
        email: user?.email || '',
        username: user?.email?.split('@')[0] || 'user',
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
        avatar_url: null,
        role: role,
        is_admin: role === 'admin',
        is_official: role === 'official',
        issues_reported: 0,
        issues_voted: 0,
      };
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch with setTimeout to prevent deadlock
          setTimeout(async () => {
            try {
              const userProfile = await fetchProfile(session.user.id);
              setProfile(userProfile);
              
              // Auto-redirect based on role after login
              if (event === 'SIGNED_IN' && userProfile) {
                const role = userProfile.role;
                // Small delay to ensure navigation happens after state is set
                setTimeout(() => {
                  if (role === 'admin') {
                    navigate('/admin', { replace: true });
                  } else if (role === 'official') {
                    navigate('/official', { replace: true });
                  }
                }, 200);
              }
            } catch (error) {
              console.error('Error fetching profile after auth change:', error);
              // Even on error, try to determine role from metadata
              const metadataRole = session.user.user_metadata?.role;
              if (event === 'SIGNED_IN' && metadataRole) {
                setTimeout(() => {
                  if (metadataRole === 'admin') {
                    navigate('/admin', { replace: true });
                  } else if (metadataRole === 'official') {
                    navigate('/official', { replace: true });
                  }
                }, 200);
              }
            } finally {
              setLoading(false);
            }
          }, 100);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
            
            // Check current path and redirect if needed
            const currentPath = window.location.pathname;
            if (userProfile) {
              const role = userProfile.role;
              if (role === 'admin' && currentPath !== '/admin' && !currentPath.startsWith('/admin')) {
                navigate('/admin');
              } else if (role === 'official' && currentPath !== '/official' && !currentPath.startsWith('/official')) {
                navigate('/official');
              }
            }
          } catch (error) {
            console.error('Error fetching profile on session check:', error);
          } finally {
            setLoading(false);
          }
        }, 100);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        
        // Determine role-based navigation
        const role = userProfile?.role || 'citizen';
        let redirectPath = '/';
        let welcomeMessage = "Welcome back to CivicPulse AI.";
        
        if (role === 'admin') {
          redirectPath = '/admin';
          welcomeMessage = "Welcome to the admin dashboard.";
        } else if (role === 'official') {
          redirectPath = '/official';
          welcomeMessage = "Welcome to the official dashboard.";
        }
        
        toast({
          title: role === 'admin' ? "Admin Login Successful" : role === 'official' ? "Official Login Successful" : "Login Successful",
          description: welcomeMessage,
        });
        
        navigate(redirectPath);
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { username: string; full_name: string; role: UserRole }) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      // Determine role flags for backward compatibility
      const is_admin = userData.role === 'admin';
      const is_official = userData.role === 'official';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role,
            is_admin: is_admin,
            is_official: is_official,
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        // Create profile in database with role
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: userData.username,
              full_name: userData.full_name,
              is_admin: is_admin,
              is_official: is_official,
            });

          if (profileError && profileError.code !== 'PGRST205') {
            console.error('Error creating profile:', profileError);
          }
        } catch (profileErr) {
          // Profile creation is optional if table doesn't exist
          console.log('Profile creation skipped:', profileErr);
        }

        toast({
          title: "Registration Successful",
          description: "Please check your email for verification link.",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      login,
      signUp,
      logout,
      isAuthenticated: !!user,
      loading,
      userRole: profile?.role || null
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
