
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface VoteButtonProps {
  issueId: string;
  initialVotes: number;
  onVoteChange?: (newVotes: number) => void;
}

const VoteButton = ({ issueId, initialVotes, onVoteChange }: VoteButtonProps) => {
  const [votes, setVotes] = useState<number>(initialVotes);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Sync votes with initialVotes when it changes
  useEffect(() => {
    setVotes(initialVotes);
  }, [initialVotes]);

  // Check if user has voted on this issue before
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const userVotes = JSON.parse(localStorage.getItem(`civicpulse-votes-${user.email}`) || '{}');
      if (userVotes[issueId]) {
        setHasVoted(true);
      }
    } else if (isAuthenticated) {
      // Fallback: use user ID if email is not available
      const userId = user?.id || 'anonymous';
      const userVotes = JSON.parse(localStorage.getItem(`civicpulse-votes-${userId}`) || '{}');
      if (userVotes[issueId]) {
        setHasVoted(true);
      }
    }
  }, [issueId, isAuthenticated, user]);

  const handleVote = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on issues.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // In a real app with Supabase, this would call an API to record the vote
    const userIdentifier = user?.email || user?.id || 'anonymous';
    
    if (hasVoted) {
      const newVotes = votes - 1;
      setVotes(newVotes);
      setHasVoted(false);
      
      // Remove vote from localStorage
      const userVotes = JSON.parse(localStorage.getItem(`civicpulse-votes-${userIdentifier}`) || '{}');
      delete userVotes[issueId];
      localStorage.setItem(`civicpulse-votes-${userIdentifier}`, JSON.stringify(userVotes));
      
      if (onVoteChange) onVoteChange(newVotes);
      toast({
        description: "Your vote has been removed.",
      });
    } else {
      const newVotes = votes + 1;
      setVotes(newVotes);
      setHasVoted(true);
      
      // Store vote in localStorage
      const userVotes = JSON.parse(localStorage.getItem(`civicpulse-votes-${userIdentifier}`) || '{}');
      userVotes[issueId] = true;
      localStorage.setItem(`civicpulse-votes-${userIdentifier}`, JSON.stringify(userVotes));
      
      if (onVoteChange) onVoteChange(newVotes);
      toast({
        description: "Thank you for voting! This helps prioritize the issue.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex flex-col h-auto py-2 hover:bg-blue-50 transition-colors",
          hasVoted ? "text-civic-blue bg-blue-50" : ""
        )}
        onClick={handleVote}
      >
        <ArrowUp className={cn("h-5 w-5", hasVoted && "fill-civic-blue")} />
        <span className="text-xs font-bold mt-1">{votes}</span>
      </Button>
    </div>
  );
};

export default VoteButton;
