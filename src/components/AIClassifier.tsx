
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";

interface AIClassifierProps {
  imageUrl?: string | null;
  onClassify: (tags: string[]) => void;
}

const AIClassifier = ({ imageUrl, onClassify }: AIClassifierProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Reset when image changes
  useEffect(() => {
    setTags([]);
    setAnalysisComplete(false);
  }, [imageUrl]);

  const analyzeImage = () => {
    if (!imageUrl) return;
    
    setIsAnalyzing(true);
    
    // In a real app, this would call an actual AI service API
    // Here we're simulating an analysis with improved mock data
    setTimeout(() => {
      // More comprehensive and varied tags for different issues
      const possibleTags = {
        infrastructure: ['pothole', 'road damage', 'sidewalk crack', 'broken pavement', 'sinkhole', 'road hazard'],
        lighting: ['street light out', 'dim lighting', 'broken lamp', 'dark area', 'light pole damage'],
        waste: ['garbage overflow', 'illegal dumping', 'littering', 'waste pile', 'recycling issue'],
        water: ['water leak', 'flooding', 'drainage issue', 'standing water', 'sewer problem'],
        nature: ['fallen tree', 'overgrown vegetation', 'dead tree', 'landscaping issue', 'invasive species'],
        safety: ['missing sign', 'damaged guardrail', 'road marking faded', 'missing manhole cover'],
        severity: ['low severity', 'medium severity', 'high severity', 'urgent', 'needs attention']
      };
      
      // Select a few tags from different categories
      const selectedTags = [
        possibleTags.infrastructure[Math.floor(Math.random() * possibleTags.infrastructure.length)],
        possibleTags.severity[Math.floor(Math.random() * possibleTags.severity.length)]
      ];
      
      // Add 1-2 more random tags
      const categories = Object.keys(possibleTags);
      const randomCategory = categories[Math.floor(Math.random() * (categories.length - 1))]; // exclude severity which we already added
      
      if (randomCategory !== 'infrastructure') { // avoid duplicate from the same category
        const categoryTags = possibleTags[randomCategory as keyof typeof possibleTags];
        selectedTags.push(categoryTags[Math.floor(Math.random() * categoryTags.length)]);
      }
      
      setTags(selectedTags);
      onClassify(selectedTags);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  useEffect(() => {
    // Auto-analyze image when it's first loaded
    if (imageUrl && !analysisComplete && !isAnalyzing && tags.length === 0) {
      analyzeImage();
    }
  }, [imageUrl, analysisComplete]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="mt-4 border rounded-md p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium flex items-center">
          <div className="flex items-center">
            AI Image Analysis
            {analysisComplete && !isAnalyzing && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 flex items-center gap-1">
                <Check className="h-3 w-3" /> Complete
              </Badge>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={analyzeImage}
          disabled={isAnalyzing}
          className="h-8"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : tags.length > 0 ? (
            "Re-analyze"
          ) : (
            "Analyze Image"
          )}
        </Button>
      </div>
      
      {isAnalyzing && (
        <div className="flex flex-col items-center py-6 space-y-2 text-center text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p>AI is analyzing your image...</p>
          <div className="text-xs text-muted-foreground">Detecting issues, assessing severity, and categorizing...</div>
        </div>
      )}
      
      {!isAnalyzing && tags.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm">Detected issues:</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-purple-50 text-purple-800 capitalize">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            These AI-detected issues help categorize and prioritize this report.
          </div>
        </div>
      )}
    </div>
  );
};

export default AIClassifier;
