
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AIClassifierProps {
  imageUrl?: string | null;
  onClassify: (tags: string[]) => void;
}

const AIClassifier = ({ imageUrl, onClassify }: AIClassifierProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  // Reset when image changes
  useEffect(() => {
    setTags([]);
  }, [imageUrl]);

  const analyzeImage = () => {
    if (!imageUrl) return;
    
    setIsAnalyzing(true);
    
    // In a real app, this would call an actual AI service API
    // Here we're simulating an analysis with mock data
    setTimeout(() => {
      const mockTags = [
        'pothole',
        'road',
        'hazard',
        'medium severity',
        'needs repair',
      ].sort(() => Math.random() - 0.5).slice(0, 3);
      
      setTags(mockTags);
      onClassify(mockTags);
      setIsAnalyzing(false);
    }, 1500);
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">AI Image Analysis</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={analyzeImage}
          disabled={isAnalyzing || !imageUrl}
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
        </div>
      )}
      
      {!isAnalyzing && tags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm">Detected issues:</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-purple-50">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIClassifier;
