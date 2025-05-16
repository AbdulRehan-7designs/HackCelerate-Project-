
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IssueReport, formatTimeAgo } from "@/utils/mockData";
import { MapPin, Clock, Image, Film, AudioLines, Eye } from "lucide-react";
import VoteButton from "./VoteButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{issue.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getStatusClass(issue.status)}>
                  {issue.status.replace('-', ' ')}
                </Badge>
                <Badge variant="outline" className="bg-blue-50">
                  {issue.category}
                </Badge>
              </div>
            </div>
            
            {/* Media section */}
            <div className="space-y-4">
              {issue.images && issue.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {issue.images.map((image, i) => (
                      <img 
                        key={i} 
                        src={image} 
                        alt={`Issue ${issue.id} image ${i+1}`} 
                        className="rounded-md w-full aspect-square object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {issue.videos && issue.videos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Videos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {issue.videos.map((video, i) => (
                      <video 
                        key={i}
                        controls
                        className="rounded-md w-full"
                        poster={issue.images?.[0]}
                      >
                        <source src={video} />
                        Your browser does not support video playback.
                      </video>
                    ))}
                  </div>
                </div>
              )}
              
              {issue.audio && issue.audio.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Audio</h3>
                  <div className="space-y-2">
                    {issue.audio.map((audioFile, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-md">
                        <audio controls className="w-full">
                          <source src={audioFile} />
                          Your browser does not support audio playback.
                        </audio>
                        <div className="text-xs text-gray-500 mt-1">Audio recording {i+1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-gray-700">{issue.description}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Location</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {typeof issue.location === 'object' ? issue.location.address : issue.location}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Reported</h3>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(issue.reportedAt).toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  By {issue.reportedBy}
                </div>
              </div>
            </div>
            
            {issue.aiTags && issue.aiTags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">AI Analysis Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {issue.aiTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-purple-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center">
                <VoteButton issueId={issue.id} initialVotes={issue.votes} />
                <span className="ml-2 text-sm text-gray-500">
                  {issue.votes} {issue.votes === 1 ? 'vote' : 'votes'}
                </span>
              </div>
              <Button onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueCard;
