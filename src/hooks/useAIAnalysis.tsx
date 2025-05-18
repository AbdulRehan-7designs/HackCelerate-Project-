
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export interface AIAnalysis {
  id: string;
  issue_id: string;
  created_at: string;
  predicted_category: string;
  category_confidence: number;
  alternative_categories: Record<string, number>;
  extracted_keywords: string[];
  similar_issue_ids: string[];
  similarity_scores: Record<string, number>;
  duplicate_score: number;
  priority_score: number;
  impact_assessment: string;
  urgency_level: string;
  assigned_departments: string[];
  estimated_response_time: number;
  resource_requirements: {
    personnel: number;
    estimatedHours: number;
    equipmentNeeded: string[];
  };
  detected_patterns?: Record<string, any>;
  seasonal_factors?: Record<string, any>;
  trend_indicators?: Record<string, any>;
}

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeIssue = async (issueId: string) => {
    setIsAnalyzing(true);
    
    try {
      // First check if we already have an analysis for this issue
      const { data: existingAnalysis, error: fetchError } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('issue_id', issueId)
        .single();
      
      if (!fetchError && existingAnalysis) {
        setAnalysis(existingAnalysis as AIAnalysis);
        return existingAnalysis as AIAnalysis;
      }
      
      // If not, call the edge function to analyze the issue
      const { data, error } = await supabase.functions.invoke('analyze-issue', {
        body: { issueId }
      });
      
      if (error) {
        console.error('Error analyzing issue:', error);
        toast({
          title: "Analysis failed",
          description: error.message || "Could not analyze the issue. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      
      if (data?.analysis) {
        setAnalysis(data.analysis);
        return data.analysis as AIAnalysis;
      }
      
      return null;
    } catch (error) {
      console.error('Error in analyze issue:', error);
      toast({
        title: "Analysis error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during analysis.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchAnalysis = async (issueId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('issue_id', issueId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }
      
      setAnalysis(data as AIAnalysis);
      return data as AIAnalysis;
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast({
        title: "Fetch error",
        description: "Could not retrieve the analysis data.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    analyzeIssue,
    fetchAnalysis,
    analysis,
    isAnalyzing
  };
}
