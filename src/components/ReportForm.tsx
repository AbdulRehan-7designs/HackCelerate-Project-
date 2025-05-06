
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { issueCategories } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import AIClassifier from './AIClassifier';
import MultiMediaUploader from './MultiMediaUploader';
import AreaSelector from './AreaSelector';

interface MediaFile {
  type: 'image' | 'audio' | 'video';
  url: string;
  file: File;
}

interface ReportFormProps {
  onSubmitSuccess?: () => void;
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
  const { toast } = useToast();

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
      setIsSubmitting(false);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }, 1000);
  };

  const handleAIClassify = (tags: string[]) => {
    setAiTags(tags);
    
    // If we don't have a category yet, try to determine one based on AI tags
    if (!category) {
      const categoryMap: Record<string, string[]> = {
        'Road Damage': ['pothole', 'road', 'asphalt', 'crack'],
        'Garbage Overflow': ['trash', 'garbage', 'waste', 'litter'],
        'Water Leakage': ['water', 'leak', 'pipe', 'flooding'],
        'Street Light': ['light', 'lamp', 'street', 'dark'],
        'Drainage Blockage': ['drain', 'block', 'flooding', 'water'],
        'Tree Hazard': ['tree', 'branch', 'fallen'],
      };
      
      for (const [cat, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(keyword => tags.some(tag => tag.includes(keyword)))) {
          setCategory(cat);
          break;
        }
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-civic-blue/30 focus:border-civic-blue">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {issueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <AreaSelector value={area} onValueChange={setArea} />
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
        
        {media?.type === 'image' && (
          <AIClassifier imageUrl={media.url} onClassify={handleAIClassify} />
        )}
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
