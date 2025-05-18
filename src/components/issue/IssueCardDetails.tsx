
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IssueReport } from "@/utils/mockData";
import { MapPin, Clock } from "lucide-react";
import VoteButton from "../VoteButton";
import { IssueMedia } from "./IssueMedia";
import { IssueTagList } from "./IssueTagList";
import { IssueAIInsights } from "./IssueAIInsights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useState, useEffect } from "react";

interface IssueCardDetailsProps {
  issue: IssueReport;
  onClose: () => void;
  getStatusClass: (status: string) => string;
}

export const IssueCardDetails = ({ 
  issue, 
  onClose, 
  getStatusClass 
}: IssueCardDetailsProps) => {
  const { analyzeIssue, fetchAnalysis, analysis, isAnalyzing } = useAIAnalysis();
  const [hasCheckedAnalysis, setHasCheckedAnalysis] = useState(false);

  useEffect(() => {
    // Check if there's an existing analysis when the modal opens
    const checkAnalysis = async () => {
      if (!hasCheckedAnalysis) {
        await fetchAnalysis(issue.id);
        setHasCheckedAnalysis(true);
      }
    };
    
    checkAnalysis();
  }, [issue.id, fetchAnalysis, hasCheckedAnalysis]);

  const handleAnalyze = async () => {
    await analyzeIssue(issue.id);
  };
  
  return (
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
          {issue.votes >= 10 && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              High Priority
            </Badge>
          )}
          {issue.votes >= 5 && issue.votes < 10 && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              Medium Priority
            </Badge>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <IssueMedia issue={issue} />
          
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
            <IssueTagList tags={issue.aiTags} />
          )}
        </TabsContent>
        
        <TabsContent value="ai-insights">
          <IssueAIInsights issue={issue} />
          {!analysis && !isAnalyzing && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleAnalyze} className="bg-purple-600 hover:bg-purple-700">
                Generate AI Analysis
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center">
          <VoteButton issueId={issue.id} initialVotes={issue.votes} />
          <span className="ml-2 text-sm text-gray-500">
            {issue.votes} {issue.votes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
