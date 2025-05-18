
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Video, Check, Play, Pause, AlertTriangle, 
  Camera, Tag, Map, Calendar, Clock, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoAnalyticsInsightsProps {
  className?: string;
}

interface Detection {
  label: string;
  confidence: number;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

const VideoAnalyticsInsights = ({ className }: VideoAnalyticsInsightsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detections, setDetections] = useState<Detection[]>([]);
  const { toast } = useToast();

  const mockDetections: Detection[] = [
    { label: 'pothole', confidence: 0.92, timestamp: 1.4, priority: 'high' },
    { label: 'broken streetlight', confidence: 0.78, timestamp: 3.7, priority: 'medium' },
    { label: 'water leak', confidence: 0.85, timestamp: 6.2, priority: 'high' },
    { label: 'graffiti', confidence: 0.81, timestamp: 8.9, priority: 'low' },
    { label: 'fallen tree branch', confidence: 0.76, timestamp: 12.3, priority: 'medium' }
  ];

  const processVideo = () => {
    setIsProcessing(true);
    setProgress(0);
    setDetections([]);
    
    // Simulate video processing with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        
        // Add detections at specific progress points
        if (newProgress === 15) {
          setDetections([mockDetections[0]]);
        } else if (newProgress === 40) {
          setDetections(prev => [...prev, mockDetections[1]]);
        } else if (newProgress === 65) {
          setDetections(prev => [...prev, mockDetections[2]]);
        } else if (newProgress === 85) {
          setDetections(prev => [...prev, mockDetections[3], mockDetections[4]]);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          toast({
            title: "Video Analysis Complete",
            description: `Detected ${mockDetections.length} issues in the video`,
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100';
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center">
          <Video className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="font-medium text-lg">Video Analytics</h3>
        </div>
      </div>

      <div className="aspect-video bg-gray-900 relative">
        {/* Video player placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isProcessing ? (
            <div className="text-center text-white">
              <div className="animate-pulse mb-4">Processing Video</div>
              <Progress value={progress} className="w-64 h-2" />
              <div className="mt-2 text-sm">{progress}% Complete</div>
            </div>
          ) : detections.length > 0 ? (
            <div className="w-full h-full bg-gradient-to-t from-black to-transparent flex items-end">
              <div className="p-4 text-white w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm">{isPlaying ? "Now playing" : "Paused"}</span>
                    <h4 className="font-medium">Issue Report Video #1285</h4>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white/20 hover:bg-white/40 text-white"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex space-x-2 mt-2 text-xs">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> 2023-06-15
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> 14:23
                  </span>
                  <span className="flex items-center">
                    <Map className="h-3 w-3 mr-1" /> Downtown District
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white">
              <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-70">No video processed</p>
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700" 
                onClick={processVideo}
                disabled={isProcessing}
              >
                <Play className="mr-2 h-4 w-4" /> 
                Process Example Video
              </Button>
            </div>
          )}
        </div>
        
        {/* Detection markers overlay */}
        {detections.map((detection, idx) => (
          <div 
            key={idx}
            style={{
              position: 'absolute',
              left: `${25 + (idx * 12)}%`,
              top: `${30 + (idx * 10)}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-12 h-12 rounded-full border-2 border-red-500 animate-ping absolute opacity-25" />
            <div className="w-12 h-12 rounded-full border-2 border-red-500 absolute" />
            <div className="absolute -bottom-16 -left-16 bg-black/70 text-white p-1.5 rounded text-xs w-32">
              {detection.label} ({Math.round(detection.confidence * 100)}%)
            </div>
          </div>
        ))}
      </div>

      {detections.length > 0 && (
        <div className="p-4">
          <h4 className="font-medium mb-3">Detected Issues</h4>
          <div className="space-y-2">
            {detections.map((detection, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{detection.label}</span>
                      <Badge className="ml-2 text-xs">
                        {Math.round(detection.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      at {detection.timestamp.toFixed(1)}s
                    </div>
                  </div>
                </div>
                <Badge className={`${getPriorityColor(detection.priority)}`}>
                  {detection.priority} priority
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {detections.length > 0 && (
        <div className="p-4 bg-blue-50 border-t">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">AI Analysis Summary</h4>
              <p className="text-xs text-gray-600 mt-1">
                The video shows multiple infrastructure issues within a 0.5 mile radius. 
                Based on priority scoring, the pothole and water leak require immediate attention.
                Recommended action: Dispatch repair team to coordinates 34.052235, -118.243683.
              </p>
              <div className="flex space-x-2 mt-2">
                <Button size="sm" variant="outline" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Create Work Order
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Mark as Reviewed
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VideoAnalyticsInsights;
