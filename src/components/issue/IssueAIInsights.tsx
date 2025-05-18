
import { useState } from 'react';
import { AIAnalysis, useAIAnalysis } from '@/hooks/useAIAnalysis';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertTriangle, CheckCircle2, 
         BrainCircuit, Tags, PieChart, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { IssueReport } from "@/utils/mockData";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IssueAIInsightsProps {
  issue: IssueReport;
}

export const IssueAIInsights = ({ issue }: IssueAIInsightsProps) => {
  const { analyzeIssue, fetchAnalysis, analysis, isAnalyzing } = useAIAnalysis();
  const [similarIssues, setSimilarIssues] = useState<IssueReport[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    const result = await analyzeIssue(issue.id);
    
    if (result?.similar_issue_ids?.length) {
      await fetchSimilarIssues(result.similar_issue_ids);
    }
  };

  const fetchSimilarIssues = async (issueIds: string[]) => {
    if (!issueIds || issueIds.length === 0) return;
    
    setLoadingSimilar(true);
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .in('id', issueIds);
        
      if (error) throw error;
      
      // Convert Supabase data to match IssueReport interface
      const convertedData = data.map(item => ({
        ...item,
        images: item.image_url ? [item.image_url] : [],
        reportedBy: item.user_id || 'Anonymous',
        reportedAt: item.created_at || new Date().toISOString(),
        updatedAt: item.created_at || new Date().toISOString(),
      })) as IssueReport[];
      
      setSimilarIssues(convertedData);
    } catch (error) {
      console.error('Error fetching similar issues:', error);
      toast({
        title: "Error",
        description: "Could not load similar issues.",
        variant: "destructive"
      });
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Load existing analysis if available
  useState(() => {
    const loadAnalysis = async () => {
      const result = await fetchAnalysis(issue.id);
      if (result?.similar_issue_ids?.length) {
        await fetchSimilarIssues(result.similar_issue_ids);
      }
    };
    
    loadAnalysis();
  });

  if (!analysis && !isAnalyzing) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <BrainCircuit className="mx-auto h-12 w-12 text-purple-500 opacity-70" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <p className="text-gray-500 text-sm">
            Generate AI-powered insights and analysis for this issue.
          </p>
          <Button onClick={handleAnalyze} className="mt-2">
            <Sparkles className="mr-2 h-4 w-4" /> 
            Analyze with AI
          </Button>
        </div>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin mx-auto h-8 w-8 text-purple-500" />
          <h3 className="text-lg font-semibold">Analyzing Issue</h3>
          <p className="text-gray-500 text-sm">
            Our AI is analyzing the issue details to provide insights...
          </p>
          <Progress value={65} className="h-2 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-3 border-b flex justify-between items-center">
        <div className="flex items-center">
          <BrainCircuit className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          AI Powered
        </Badge>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Category Prediction */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <Tags className="h-4 w-4 mr-1 text-purple-500" /> 
            Category Analysis
          </h4>
          
          <div className="rounded-md bg-slate-50 p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Predicted: <strong>{analysis?.predicted_category}</strong></span>
              <Badge variant={analysis?.predicted_category === issue.category ? "default" : "outline"}>
                {analysis?.predicted_category === issue.category ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Match
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" /> Mismatch
                  </>
                )}
              </Badge>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Confidence</span>
                <span>{Math.round((analysis?.category_confidence || 0) * 100)}%</span>
              </div>
              <Progress 
                value={(analysis?.category_confidence || 0) * 100} 
                className="h-1.5" 
                indicatorClassName="bg-purple-500"
              />
            </div>
            
            {analysis?.alternative_categories && Object.keys(analysis.alternative_categories).length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Alternative categories:</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(analysis.alternative_categories).map(([category, score]) => (
                    <Badge 
                      key={category} 
                      variant="outline" 
                      className="text-xs bg-slate-100"
                    >
                      {category} ({Math.round(Number(score) * 100)}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Keywords */}
        {analysis?.extracted_keywords && analysis.extracted_keywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Terms Identified</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.extracted_keywords.map(keyword => (
                <Badge 
                  key={keyword} 
                  variant="secondary" 
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Priority Analysis */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <PieChart className="h-4 w-4 mr-1 text-purple-500" /> 
            Priority Assessment
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-3 rounded-md text-center">
              <div className="text-2xl font-bold text-purple-700">{analysis?.priority_score}</div>
              <div className="text-xs text-gray-500">Priority Score</div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-md text-center">
              <div className="text-sm font-semibold text-amber-600">{analysis?.urgency_level}</div>
              <div className="text-xs text-gray-500">Urgency</div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-md text-center">
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-semibold">{analysis?.estimated_response_time}h</span>
              </div>
              <div className="text-xs text-gray-500">Est. Response</div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-xs text-gray-500 mb-1">Impact Assessment:</div>
            <div className="text-sm">{analysis?.impact_assessment}</div>
          </div>
        </div>
        
        {/* Department Assignment */}
        {analysis?.assigned_departments && analysis.assigned_departments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommended Departments</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.assigned_departments.map(dept => (
                <Badge key={dept} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {dept}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Similar Issues */}
        {similarIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center">
              Similar Issues
              {loadingSimilar && <Loader2 className="animate-spin ml-2 h-3 w-3" />}
            </h4>
            
            <div className="space-y-2">
              {similarIssues.map(similarIssue => {
                const score = analysis?.similarity_scores?.[similarIssue.id] || 0;
                return (
                  <div key={similarIssue.id} className="bg-slate-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{similarIssue.title}</span>
                      <Badge variant="outline" className="bg-blue-50">
                        {Math.round(Number(score) * 100)}% similar
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {typeof similarIssue.location === 'object' ? 
                        similarIssue.location.address : 
                        similarIssue.location
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Resource Requirements */}
        {analysis?.resource_requirements && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Resource Requirements</h4>
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-xs text-gray-500">Personnel:</div>
                  <div className="font-medium">{analysis.resource_requirements.personnel} people</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Est. Hours:</div>
                  <div className="font-medium">{analysis.resource_requirements.estimatedHours} hours</div>
                </div>
              </div>
              
              {analysis.resource_requirements.equipmentNeeded?.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Equipment Needed:</div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.resource_requirements.equipmentNeeded.map(item => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Generated at timestamp */}
        <div className="text-xs text-gray-400 text-center pt-2">
          Analysis generated: {new Date(analysis?.created_at || Date.now()).toLocaleString()}
        </div>
      </div>
    </Card>
  );
};
