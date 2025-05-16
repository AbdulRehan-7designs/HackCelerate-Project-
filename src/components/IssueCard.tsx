
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { IssueReport } from "@/utils/mockData";
import { Image, Film, AudioLines } from "lucide-react";
import VoteButton from "./VoteButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IssueCardSummary } from './issue/IssueCardSummary';
import { IssueCardDetails } from './issue/IssueCardDetails';

interface IssueCardProps {
  issue: IssueReport;
}

const IssueCard = ({ issue }: IssueCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  const getMediaIcon = () => {
    if (issue.images && issue.images.length > 0) {
      return <Image className="h-3 w-3 mr-1" />;
    } else if (issue.videos && issue.videos.length > 0) {
      return <Film className="h-3 w-3 mr-1" />;
    } else if (issue.audio && issue.audio.length > 0) {
      return <AudioLines className="h-3 w-3 mr-1" />;
    }
    return null;
  };

  const getMediaCount = () => {
    const imageCount = issue.images?.length || 0;
    const videoCount = issue.videos?.length || 0;
    const audioCount = issue.audio?.length || 0;
    const total = imageCount + videoCount + audioCount;
    return total > 0 ? total : null;
  };

  return (
    <>
      <Card className="issue-card-shadow overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="flex">
          <div className="flex items-start pt-6 pl-4">
            <VoteButton issueId={issue.id} initialVotes={issue.votes} />
          </div>
          <IssueCardSummary 
            issue={issue}
            getStatusClass={getStatusClass}
            getMediaIcon={getMediaIcon}
            getMediaCount={getMediaCount}
            onViewDetails={() => setIsDialogOpen(true)}
          />
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
          </DialogHeader>
          
          <IssueCardDetails
            issue={issue}
            onClose={() => setIsDialogOpen(false)}
            getStatusClass={getStatusClass}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueCard;
