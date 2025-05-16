
import { Badge } from "@/components/ui/badge";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IssueReport, formatTimeAgo } from "@/utils/mockData";
import { MapPin, Clock, Image, Film, AudioLines, Eye } from "lucide-react";
import VoteButton from "../VoteButton";

interface IssueCardSummaryProps {
  issue: IssueReport;
  getStatusClass: (status: string) => string;
  getMediaIcon: () => React.ReactNode;
  getMediaCount: () => number | null;
  onViewDetails: () => void;
}

export const IssueCardSummary = ({ 
  issue, 
  getStatusClass, 
  getMediaIcon, 
  getMediaCount, 
  onViewDetails 
}: IssueCardSummaryProps) => {
  return (
    <div className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{issue.title}</h3>
          <Badge className={getStatusClass(issue.status)}>
            {issue.status.replace('-', ' ')}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          <Badge variant="outline" className="text-xs bg-blue-50">
            {issue.category}
          </Badge>
          {issue.aiTags && issue.aiTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-purple-50">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {issue.description}
        </p>
        <div className="flex items-center text-xs text-muted-foreground mb-1">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="line-clamp-1">
            {typeof issue.location === 'object' ? issue.location.address : issue.location}
          </span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>Reported {formatTimeAgo(issue.reportedAt)}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full items-center">
          <div className="text-xs text-muted-foreground">
            By {issue.reportedBy}
          </div>
          <div className="flex items-center gap-3">
            {getMediaCount() && (
              <div className="flex items-center text-xs text-muted-foreground">
                {getMediaIcon()}
                <span>{getMediaCount()}</span>
              </div>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 px-2 text-xs flex items-center"
              onClick={onViewDetails}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardFooter>
    </div>
  );
};
