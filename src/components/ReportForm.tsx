import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { issueCategories } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Lightbulb, BrainCircuit, Sparkles, Tags, BadgeCheck } from "lucide-react";
import AIClassifier from './AIClassifier';
import MultiMediaUploader from './MultiMediaUploader';
import AreaSelector from './AreaSelector';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface MediaFile {
  type: 'image' | 'audio' | 'video';
  url: string;
  file: File;
}

interface ReportFormProps {
  onSubmitSuccess?: () => void;
}

interface AIRecommendation {
  category: string;
  confidence: number;
  alternativeCategories?: Record<string, number>;
  keywords?: string[];
  similarIssues?: string[];
  priority?: number;
}

const ReportForm = ({ onSubmitSuccess }: ReportFormProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const { toast } = useToast();

  // Request relevant permissions when the form loads
  useEffect(() => {
    if (!permissionsRequested) {
      // Request notification permission
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            toast({
              description: "Notifications enabled for report updates!"
            });
          }
        });
      }
      setPermissionsRequested(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title || !category || !description || !address || !area) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would call an API to submit the report
    // Simulate a submission process with steps
    toast({
      title: "Processing report...",
      description: "Collecting data and preparing submission",
    });
    
    setTimeout(() => {
      toast({
        title: "Media upload complete",
        description: media ? `${media.type} processed successfully` : "No media attached",
      });
      
      setTimeout(() => {
        toast({
          title: "Location verified",
          description: `${area.charAt(0).toUpperCase() + area.slice(1)} area confirmed`,
        });
        
        setTimeout(() => {
          toast({
            title: "Report submitted!",
            description: "Your civic issue has been reported successfully.",
          });
          
          // Reset form
          setTitle('');
          setCategory('');
          setDescription('');
          setAddress('');
          setArea('');
          setMedia(null);
          setAiTags([]);
          setAiRecommendation(null);
          setIsSubmitting(false);
          
          if (onSubmitSuccess) {
            onSubmitSuccess();
          }
          
          // Show a mock notification
          if ("Notification" in window && Notification.permission === "granted") {
            // In a real app, this would come through a service worker
            setTimeout(() => {
              new Notification("CivicPulse Report Update", {
                body: "Your report has been received and will be reviewed shortly.",
                icon: "/favicon.ico",
              });
            }, 3000);
          }
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleAIClassify = (tags: string[]) => {
    setAiTags(tags);
    
    // If we don't have a category yet, process with enhanced AI
    if (!category) {
      processWithAI(tags);
    }
  };

  const processWithAI = async (tags: string[]) => {
    setIsAiProcessing(true);
    
    try {
      // In a real app, this would call an edge function or API
      // Here we'll simulate AI processing with sophisticated recommendations
      const tagsText = tags.join(' ');
      
      // Simulated AI processing
      setTimeout(() => {
        let recommendedCategory = '';
        let confidence = 0;
        const alternativeCategories = {};
        
        // Simple keyword-based category recommendation logic
        if (tagsText.includes('pothole') || tagsText.includes('asphalt') || tagsText.includes('road')) {
          recommendedCategory = 'Road Damage';
          confidence = 0.89;
          alternativeCategories['Sidewalk Damage'] = 0.42;
          alternativeCategories['Construction'] = 0.31;
        } else if (tagsText.includes('trash') || tagsText.includes('garbage') || tagsText.includes('waste')) {
          recommendedCategory = 'Garbage & Waste';
          confidence = 0.92;
          alternativeCategories['Environmental Hazard'] = 0.38;
        } else if (tagsText.includes('water') || tagsText.includes('leak') || tagsText.includes('pipe')) {
          recommendedCategory = 'Water Leakage';
          confidence = 0.87;
          alternativeCategories['Drainage Blockage'] = 0.45;
        } else if (tagsText.includes('light') || tagsText.includes('lamp') || tagsText.includes('dark')) {
          recommendedCategory = 'Street Light Issue';
          confidence = 0.84;
          alternativeCategories['Electrical Hazard'] = 0.29;
        } else if (tagsText.includes('tree') || tagsText.includes('branch') || tagsText.includes('vegetation')) {
          recommendedCategory = 'Tree Hazard';
          confidence = 0.91;
          alternativeCategories['Park Maintenance'] = 0.36;
        } else {
          // Fallback to a random high-confidence category if no keywords match
          const randomCategories = ['Road Damage', 'Garbage & Waste', 'Water Leakage', 'Street Light Issue'];
          recommendedCategory = randomCategories[Math.floor(Math.random() * randomCategories.length)];
          confidence = 0.75 + (Math.random() * 0.15);
          
          // Add some random alternative categories
          const altCats = issueCategories.filter(cat => cat !== recommendedCategory);
          for (let i = 0; i < 2; i++) {
            if (i < altCats.length) {
              alternativeCategories[altCats[i]] = 0.3 + (Math.random() * 0.3);
            }
          }
        }
        
        // Set category based on AI recommendation
        setCategory(recommendedCategory);
        
        // Set full AI recommendation data
        setAiRecommendation({
          category: recommendedCategory,
          confidence: confidence,
          alternativeCategories: alternativeCategories,
          keywords: tags,
          priority: Math.floor(Math.random() * 3) + 3 // Priority between 3-5
        });
        
        toast({
          title: "AI Analysis Complete",
          description: `Recommended category: ${recommendedCategory}`,
        });
        
        setIsAiProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error processing with AI:", error);
      toast({
        title: "AI Processing Error",
        description: "Could not process image with AI. Using manual categorization.",
        variant: "destructive",
      });
      setIsAiProcessing(false);
    }
  };

  const handleAddressChange = (detectedAddress: string) => {
    setAddress(detectedAddress);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {!permissionsRequested && (
        <Alert className="bg-blue-50 border-blue-200">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertTitle>Permission Request</AlertTitle>
          <AlertDescription>
            CivicPulse works best with location and notification permissions.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder="Brief description of the issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border-civic-blue/30 focus:border-civic-blue"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center">
              Category <span className="text-red-500">*</span>
              {aiRecommendation && (
                <Badge variant="outline" className="ml-2 bg-purple-50">
                  <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                  AI Suggested
                </Badge>
              )}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-civic-blue/30 focus:border-civic-blue">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {issueCategories.map((cat) => (
                  <SelectItem 
                    key={cat} 
                    value={cat}
                    className={aiRecommendation?.category === cat ? 'bg-purple-50' : ''}
                  >
                    <div className="flex items-center">
                      {cat}
                      {aiRecommendation?.category === cat && (
                        <BadgeCheck className="h-4 w-4 ml-2 text-purple-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {aiRecommendation && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>AI Confidence</span>
                  <span>{Math.round(aiRecommendation.confidence * 100)}%</span>
                </div>
                <Progress 
                  value={aiRecommendation.confidence * 100} 
                  className="h-1" 
                  indicatorClassName="bg-purple-500"
                />
              </div>
            )}
          </div>
          
          <AreaSelector 
            value={area} 
            onValueChange={setArea} 
            onAddressChange={handleAddressChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="description"
            placeholder="Please describe the issue in detail"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="border-civic-blue/30 focus:border-civic-blue"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            placeholder="Street address or precise location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="border-civic-blue/30 focus:border-civic-blue"
          />
        </div>
        
        <div className="space-y-2">
          <MultiMediaUploader 
            onMediaChange={setMedia} 
            initialMedia={media}
          />
        </div>
        
        {media?.type === 'image' ? (
          <>
            <Card className="p-4 border-dashed border-2 border-purple-200 bg-purple-50/50">
              <div className="flex items-center mb-3">
                <BrainCircuit className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="font-medium">AI Image Analysis</h3>
              </div>
              
              {isAiProcessing ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-2" />
                  <p className="text-sm text-center text-gray-600">
                    Analyzing image content...
                  </p>
                </div>
              ) : (
                <AIClassifier imageUrl={media.url} onClassify={handleAIClassify} />
              )}
              
              {aiTags.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center mb-1">
                    <Tags className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm font-medium">Detected Elements:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {aiTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {aiRecommendation?.alternativeCategories && Object.keys(aiRecommendation.alternativeCategories).length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-1">Alternative categories:</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(aiRecommendation.alternativeCategories).map(([altCat, confidence]) => (
                      <Badge 
                        key={altCat} 
                        variant="outline" 
                        className="bg-gray-50 text-gray-700"
                        onClick={() => setCategory(altCat)}
                      >
                        {altCat} ({Math.round(confidence * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </>
        ) : null}
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="gradient-header hover:shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              <span>Submit Report</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ReportForm;
