import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  area: string;
  coordinates: [number, number];
  votes: number;
  image_url?: string;
  media_url?: string;
  user_id: string;
  created_at: string;
  time_uploaded: string;
  severity: number;
  resolved_at?: string;
  resolved_by?: string;
  blockchain_hash?: string;
}

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedIssues: Issue[] = data.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        status: issue.status,
        location: issue.location,
        area: issue.area || '',
        coordinates: issue.coordinates ? 
          (typeof issue.coordinates === 'object' && issue.coordinates !== null && 'x' in issue.coordinates && 'y' in issue.coordinates
            ? [(issue.coordinates as any).x, (issue.coordinates as any).y] 
            : [0, 0]) 
          : [0, 0],
        votes: issue.votes,
        image_url: issue.image_url,
        media_url: issue.media_url,
        user_id: issue.user_id,
        created_at: issue.created_at,
        time_uploaded: issue.time_uploaded,
        severity: issue.severity,
        resolved_at: issue.resolved_at,
        resolved_by: issue.resolved_by,
        blockchain_hash: issue.blockchain_hash,
      }));

      setIssues(formattedIssues);
    } catch (error: any) {
      console.error('Error fetching issues:', error);
      toast({
        title: "Error",
        description: "Failed to load issues. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issueData: {
    title: string;
    description: string;
    category: string;
    location: string;
    area: string;
    coordinates: [number, number];
    image_url?: string;
    media_url?: string;
    severity?: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to create issues');
      }

      const { data, error } = await supabase
        .from('issues')
        .insert({
          ...issueData,
          coordinates: `(${issueData.coordinates[0]}, ${issueData.coordinates[1]})`,
          severity: issueData.severity || 3,
          status: 'reported',
          votes: 0,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Trigger AI analysis
      try {
        await supabase.functions.invoke('ai-analysis', {
          body: {
            issueId: data.id,
            title: issueData.title,
            description: issueData.description,
            category: issueData.category,
            location: issueData.location
          }
        });
      } catch (aiError) {
        console.warn('AI analysis failed, but issue was created:', aiError);
      }

      await fetchIssues(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Issue reported successfully!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create issue. Please try again.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const voteOnIssue = async (issueId: string) => {
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('issue_id', issueId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingVote) {
        toast({
          title: "Already Voted",
          description: "You have already voted on this issue.",
          variant: "default",
        });
        return;
      }

      // Add vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert([{
          issue_id: issueId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (voteError) {
        throw voteError;
      }

      // Increment vote count
      const { error: incrementError } = await supabase.rpc('increment_votes', {
        issue_id: issueId
      });

      if (incrementError) {
        throw incrementError;
      }

      await fetchIssues(); // Refresh the list
      
      toast({
        title: "Vote Recorded",
        description: "Thank you for voting on this issue!",
      });
    } catch (error: any) {
      console.error('Error voting on issue:', error);
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIssues();
    
    // Set up real-time updates
    const channel = supabase
      .channel('issues_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'issues'
      }, () => {
        fetchIssues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    issues,
    loading,
    fetchIssues,
    createIssue,
    voteOnIssue,
  };
};