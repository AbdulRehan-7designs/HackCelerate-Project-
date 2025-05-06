
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { issueCategories } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2 } from "lucide-react";
import AIClassifier from './AIClassifier';

interface ReportFormProps {
  onSubmitSuccess?: () => void;
}

const ReportForm = ({ onSubmitSuccess }: ReportFormProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title || !category || !description || !address) {
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
      setImageUrl(null);
      setAiTags([]);
      setIsSubmitting(false);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }, 1000);
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // In a real app, we would upload the file to storage
      // For now, just create a local object URL
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
    }
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
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder="Brief description of the issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {issueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Photo Evidence</Label>
          <div className="flex flex-col space-y-2">
            {imageUrl ? (
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Issue preview" 
                  className="w-full h-auto rounded-md max-h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <Camera className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Upload a photo</span>
                    <span className="text-xs text-gray-400">Click to browse</span>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        
        {imageUrl && (
          <AIClassifier imageUrl={imageUrl} onClassify={handleAIClassify} />
        )}
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
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
