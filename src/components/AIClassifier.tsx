
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

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

  const analyzeImage = async () => {
    if (!imageUrl) return;
    
    setIsAnalyzing(true);
    
    try {
      // Fetch image and convert to base64 for Gemini Vision API
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        
        try {
          // Call Gemini Vision API via Supabase function
          const { data, error } = await supabase.functions.invoke('ai-image-analysis', {
            body: { 
              image: base64Image,
              mimeType: blob.type || 'image/jpeg'
            }
          });
          
          if (error) {
            throw error;
          }
          
          if (data?.tags && Array.isArray(data.tags)) {
            setTags(data.tags);
            onClassify(data.tags);
          } else {
            // Fallback to default tags if API doesn't return expected format
            const defaultTags = ['civic issue', 'needs attention'];
            setTags(defaultTags);
            onClassify(defaultTags);
          }
        } catch (error) {
          console.error('Error analyzing image:', error);
          // Fallback to default tags
          const defaultTags = ['civic issue', 'needs attention'];
          setTags(defaultTags);
          onClassify(defaultTags);
        } finally {
          setIsAnalyzing(false);
          setAnalysisComplete(true);
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
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
