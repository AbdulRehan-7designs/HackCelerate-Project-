
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { IssueReport, formatTimeAgo } from "@/utils/mockData";
import { MapPin, Clock, Image } from "lucide-react";
import VoteButton from "./VoteButton";

interface IssueCardProps {
  issue: IssueReport;
}

const IssueCard = ({ issue }: IssueCardProps) => {
  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  return (
    <Card className="issue-card-shadow overflow-hidden">
      <div className="flex">
        <div className="flex items-start pt-6 pl-4">
          <VoteButton issueId={issue.id} initialVotes={issue.votes} />
        </div>
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
              <span className="line-clamp-1">{issue.location.address}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Reported {formatTimeAgo(issue.reportedAt)}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex justify-between w-full">
              <div className="text-xs text-muted-foreground">
                By {issue.reportedBy}
              </div>
              {issue.images && issue.images.length > 0 && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Image className="h-3 w-3 mr-1" />
                  <span>{issue.images.length}</span>
                </div>
              )}
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default IssueCard;
