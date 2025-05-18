
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Camera, Loader2, Video } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

interface VideoAIDetectionProps {
  onDetectionResults?: (results: DetectionResult[]) => void;
}

export interface DetectionResult {
  label: string;
  confidence: number;
  timestamp: number;
}

const VideoAIDetection = ({ onDetectionResults }: VideoAIDetectionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectionResult[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Load the COCO-SSD model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1', { fromTFHub: true });
        setModelLoaded(true);
        toast({
          title: "AI Model Loaded",
          description: "Object detection model is ready to use",
        });
      } catch (error) {
        console.error("Failed to load model", error);
        toast({
          title: "AI Model Error",
          description: "Failed to load object detection model",
          variant: "destructive",
        });
      }
    };

    loadModel();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    
    try {
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
    } catch (e) {
      // Fallback if the preferred codec is not supported
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      } catch (err) {
        console.error("Error creating MediaRecorder:", err);
        toast({
          title: "Recording Error",
          description: "Your browser doesn't support video recording",
          variant: "destructive",
        });
        return;
      }
    }
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      
      // Process the video with AI
      processVideoWithAI(url);
    };
    
    mediaRecorderRef.current.start();
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Recording video from camera...",
    });
    
    // Stop recording after 10 seconds for demo purposes
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        stopRecording();
      }
    }, 10000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      toast({
        title: "Recording Completed",
        description: "Video recording stopped",
      });
    }
  };

  // This is a simulated AI video processing function
  // In a real app, this would use the loaded TensorFlow.js model on video frames
  const processVideoWithAI = async (videoUrl: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing time
    toast({
      title: "AI Processing",
      description: "Analyzing video content...",
    });
    
    // In a real implementation, you would:
    // 1. Load the video into a canvas
    // 2. Extract frames at regular intervals
    // 3. Run each frame through the COCO-SSD model
    // 4. Collect and aggregate detection results
    
    // For demonstration, we'll simulate detections
    setTimeout(() => {
      // These are simulated detection results
      const simulatedDetections: DetectionResult[] = [
        { label: 'pothole', confidence: 0.87, timestamp: 1.2 },
        { label: 'street light', confidence: 0.76, timestamp: 2.8 },
        { label: 'garbage', confidence: 0.92, timestamp: 4.1 },
        { label: 'broken bench', confidence: 0.81, timestamp: 5.5 },
        { label: 'water puddle', confidence: 0.65, timestamp: 7.3 }
      ];
      
      setDetectedObjects(simulatedDetections);
      setIsProcessing(false);
      
      if (onDetectionResults) {
        onDetectionResults(simulatedDetections);
      }
      
      toast({
        title: "AI Analysis Complete",
        description: `${simulatedDetections.length} objects detected in video`,
      });
    }, 3000);
  };

  useEffect(() => {
    startCamera();
    
    return () => {
      // Cleanup on component unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <BrainCircuit className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="font-medium">Video AI Analysis</h3>
        </div>
        
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-md overflow-hidden relative">
            {!videoUrl ? (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full"
              />
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
                  <p className="text-white mt-2">Processing video with AI...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            {!videoUrl ? (
              <Button 
                disabled={isRecording || !modelLoaded} 
                onClick={startRecording}
                className="flex items-center"
              >
                {isRecording ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Record Video
                  </>
                )}
              </Button>
            ) : (
              <Button 
                disabled={isProcessing}
                onClick={() => {
                  setVideoUrl(null);
                  setDetectedObjects([]);
                  startCamera();
                }}
              >
                <Video className="mr-2 h-4 w-4" />
                Record New Video
              </Button>
            )}
          </div>
          
          {detectedObjects.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Detected Issues:</h4>
              <div className="space-y-2">
                {detectedObjects.map((obj, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{obj.label}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {Math.round(obj.confidence * 100)}%
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      at {obj.timestamp.toFixed(1)}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VideoAIDetection;
