
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoteButtonProps {
  issueId: string;
  initialVotes: number;
  onVoteChange?: (newVotes: number) => void;
}

const VoteButton = ({ issueId, initialVotes, onVoteChange }: VoteButtonProps) => {
  const [votes, setVotes] = useState<number>(initialVotes);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const { toast } = useToast();

  const handleVote = () => {
    // In a real app, this would call an API to record the vote
    if (hasVoted) {
      const newVotes = votes - 1;
      setVotes(newVotes);
      setHasVoted(false);
      if (onVoteChange) onVoteChange(newVotes);
      toast({
        description: "Your vote has been removed.",
      });
    } else {
      const newVotes = votes + 1;
      setVotes(newVotes);
      setHasVoted(true);
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
          "flex flex-col h-auto py-2 hover-lift",
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
