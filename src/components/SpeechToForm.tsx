import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SpeechToFormProps {
  onFormDataExtracted: (data: {
    title?: string;
    description?: string;
    category?: string;
    address?: string;
    area?: string;
  }) => void;
}

interface ExtractedData {
  title?: string;
  description?: string;
  category?: string;
  address?: string;
  area?: string;
  confidence?: number;
}

const SpeechToForm = ({ onFormDataExtracted }: SpeechToFormProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const transcriptRef = useRef('');

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
          variant: "destructive"
        });
        return;
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak clearly about the civic issue you want to report.",
        });
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        transcriptRef.current = finalTranscript || interimTranscript;
        setTranscript(transcriptRef.current);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          toast({
            title: "No speech detected",
            description: "Please try speaking again.",
            variant: "destructive"
          });
        } else if (event.error === 'not-allowed') {
          toast({
            title: "Microphone permission denied",
            description: "Please allow microphone access to use speech input.",
            variant: "destructive"
          });
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [toast]);

  const startListening = () => {
    if (!recognition) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    try {
      transcriptRef.current = '';
      setTranscript('');
      setExtractedData(null);
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: "Error",
        description: "Failed to start speech recognition.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      
      // Process the transcript if we have one
      if (transcriptRef.current.trim()) {
        processTranscript(transcriptRef.current);
      }
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "No speech detected",
        description: "Please try speaking again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setTranscript(text);

    try {
      // Call Gemini AI to extract structured data from speech
      const { data, error } = await supabase.functions.invoke('ai-speech-to-form', {
        body: { 
          transcript: text
        }
      });

      if (error) {
        throw error;
      }

      if (data?.extractedData) {
        setExtractedData(data.extractedData);
        
        // Auto-fill the form
        onFormDataExtracted(data.extractedData);
        
        toast({
          title: "Form Auto-filled!",
          description: "AI has extracted information from your speech and filled the form.",
        });
      } else {
        throw new Error('No data extracted');
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast({
        title: "Processing Failed",
        description: "Could not extract form data from speech. Please try again or fill manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualProcess = () => {
    if (transcript.trim()) {
      processTranscript(transcript);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setExtractedData(null);
    transcriptRef.current = '';
  };

  return (
    <Card className="p-4 border-2 border-dashed border-purple-200 bg-purple-50/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Mic className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="font-medium">Voice Report</h3>
        </div>
        {extractedData && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Form Filled
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Speech Controls */}
        <div className="flex items-center gap-2">
          {!isListening ? (
            <Button
              type="button"
              onClick={startListening}
              className="gradient-header"
              size="lg"
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Speaking
            </Button>
          ) : (
            <Button
              type="button"
              onClick={stopListening}
              variant="destructive"
              size="lg"
            >
              <MicOff className="h-5 w-5 mr-2" />
              Stop Recording
            </Button>
          )}
          
          {transcript && !isListening && (
            <Button
              type="button"
              onClick={handleManualProcess}
              disabled={isProcessing}
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Text'
              )}
            </Button>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your Speech:</label>
              <Button
                type="button"
                onClick={clearTranscript}
                variant="ghost"
                size="sm"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 bg-white rounded-md border border-gray-200 min-h-[80px] max-h-[200px] overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500 mr-2" />
            <span className="text-sm text-gray-600">
              AI is extracting information from your speech...
            </span>
          </div>
        )}

        {/* Extracted Data Preview */}
        {extractedData && !isProcessing && (
          <div className="space-y-2 p-3 bg-white rounded-md border border-green-200">
            <div className="text-sm font-medium text-green-700 mb-2">
              Extracted Information:
            </div>
            <div className="space-y-1 text-sm">
              {extractedData.title && (
                <div>
                  <span className="font-medium">Title:</span> {extractedData.title}
                </div>
              )}
              {extractedData.category && (
                <div>
                  <span className="font-medium">Category:</span> {extractedData.category}
                </div>
              )}
              {extractedData.address && (
                <div>
                  <span className="font-medium">Location:</span> {extractedData.address}
                </div>
              )}
              {extractedData.description && (
                <div className="mt-2">
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600 mt-1">{extractedData.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Speak naturally about your civic issue. Include:</p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>What the issue is (e.g., "There's a pothole...")</li>
            <li>Where it's located (e.g., "on Main Street near the park")</li>
            <li>Any relevant details</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default SpeechToForm;



