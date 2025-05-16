
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, File, Mic, Video, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type MediaType = 'image' | 'audio' | 'video';

interface MediaFile {
  type: MediaType;
  url: string;
  file: File;
}

interface MultiMediaUploaderProps {
  onMediaChange: (media: MediaFile | null) => void;
  initialMedia?: MediaFile | null;
}

const MultiMediaUploader = ({ onMediaChange, initialMedia }: MultiMediaUploaderProps) => {
  const [media, setMedia] = useState<MediaFile | null>(initialMedia || null);
  const [activeTab, setActiveTab] = useState<MediaType>('image');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      const file = files[0];
      
      // Create object URL for immediate preview
      const url = URL.createObjectURL(file);
      const newMedia: MediaFile = { type, url, file };
      
      // Simulate upload with a small delay to show the upload process
      setTimeout(() => {
        setMedia(newMedia);
        onMediaChange(newMedia);
        setIsUploading(false);
        
        toast({
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully.`,
        });
      }, 800);
    }
  };

  const clearMedia = () => {
    if (media?.url) {
      URL.revokeObjectURL(media.url);
    }
    setMedia(null);
    onMediaChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Evidence Upload</div>
      
      {!media && (
        <div className="flex space-x-2 mb-2">
          <Button
            type="button"
            variant={activeTab === 'image' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab('image')}
            className="flex items-center"
          >
            <Camera className="h-4 w-4 mr-1" />
            Photo
          </Button>
          <Button
            type="button"
            variant={activeTab === 'audio' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab('audio')}
            className="flex items-center"
          >
            <Mic className="h-4 w-4 mr-1" />
            Audio
          </Button>
          <Button
            type="button"
            variant={activeTab === 'video' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab('video')}
            className="flex items-center"
          >
            <Video className="h-4 w-4 mr-1" />
            Video
          </Button>
        </div>
      )}
      
      {!media && (
        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
          <label htmlFor="file-upload" className="cursor-pointer w-full">
            <div className="flex flex-col items-center space-y-2">
              {activeTab === 'image' && <Camera className="h-8 w-8 text-gray-400" />}
              {activeTab === 'audio' && <Mic className="h-8 w-8 text-gray-400" />}
              {activeTab === 'video' && <Video className="h-8 w-8 text-gray-400" />}
              
              <span className="text-sm font-medium text-gray-600">
                {activeTab === 'image' && 'Upload a photo'}
                {activeTab === 'audio' && 'Upload an audio recording'}
                {activeTab === 'video' && 'Upload a video'}
              </span>
              <span className="text-xs text-gray-400">Click to browse</span>
            </div>
            <Input
              id="file-upload"
              type="file"
              accept={
                activeTab === 'image' ? 'image/*' : 
                activeTab === 'audio' ? 'audio/*' : 
                'video/*'
              }
              onChange={(e) => handleFileUpload(e, activeTab)}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      )}
      
      {isUploading && (
        <div className="border rounded-md p-6 bg-gray-50">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-pulse flex space-x-2 items-center">
              <div className="h-2 w-2 bg-civic-blue rounded-full"></div>
              <div className="h-2 w-2 bg-civic-blue rounded-full"></div>
              <div className="h-2 w-2 bg-civic-blue rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600">Uploading {activeTab}...</span>
          </div>
        </div>
      )}
      
      {media && !isUploading && (
        <div className="relative border rounded-md p-2 bg-gray-50">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={clearMedia}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {media.type === 'image' && (
            <img 
              src={media.url} 
              alt="Uploaded image" 
              className="w-full h-auto rounded-md max-h-48 object-cover mt-2"
            />
          )}
          
          {media.type === 'audio' && (
            <div className="pt-6 pb-2">
              <audio controls className="w-full">
                <source src={media.url} type={media.file.type} />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
          
          {media.type === 'video' && (
            <div className="pt-6 pb-2">
              <video controls className="w-full max-h-48 object-contain">
                <source src={media.url} type={media.file.type} />
                Your browser does not support video playback.
              </video>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            {media.file.name} ({(media.file.size / 1024).toFixed(1)} KB)
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiMediaUploader;
