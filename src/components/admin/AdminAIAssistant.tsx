
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, AlertCircle, CheckCircle, BrainCircuit, Loader2, 
  ArrowRight, MessageSquare, LineChart, FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminAIAssistantProps {
  className?: string;
}

const AdminAIAssistant = ({ className }: AdminAIAssistantProps) => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [mode, setMode] = useState<'assistant' | 'reports' | 'trends'>('assistant');
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a question or issue to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResponse(null);

    try {
      // Build context based on mode
      let contextPrompt = '';
      if (mode === 'assistant') {
        contextPrompt = 'You are an AI assistant for civic administration. Analyze the query and provide actionable insights about civic issues, resource allocation, and community problems.';
      } else if (mode === 'reports') {
        contextPrompt = 'You are an AI assistant specialized in generating comprehensive reports about civic issues. Create detailed reports with key findings, statistics, and recommendations.';
      } else if (mode === 'trends') {
        contextPrompt = 'You are an AI assistant specialized in predictive analysis and trend identification for civic issues. Analyze patterns and predict future issues based on historical data.';
      }

      // Call Gemini-powered AI chat function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: `${contextPrompt}\n\nUser query: ${query}`,
          context: `Mode: ${mode}. User is an admin asking about civic management and community issues.`
        }
      });
      
      if (error) {
        throw error;
      }
      
      setResponse(data?.response || 'I apologize, but I couldn\'t generate a response. Please try again.');

      toast({
        title: "Analysis complete",
        description: "Gemini AI has processed your query successfully",
      });
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        title: "Analysis failed",
        description: "Unable to complete AI analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="mb-4 flex items-center">
        <BrainCircuit className="h-5 w-5 mr-2 text-purple-500" />
        <h3 className="font-medium text-lg">Admin AI Assistant</h3>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'assistant' | 'reports' | 'trends')}>
        <TabsList className="mb-4">
          <TabsTrigger value="assistant" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> Assistant
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" /> Reports
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" /> Trends
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistant">
          <p className="text-sm text-gray-500 mb-2">
            Ask about civic issues, resource allocation, or get insights from reported data.
          </p>
        </TabsContent>
        <TabsContent value="reports">
          <p className="text-sm text-gray-500 mb-2">
            Generate comprehensive reports about civic issues across different regions.
          </p>
        </TabsContent>
        <TabsContent value="trends">
          <p className="text-sm text-gray-500 mb-2">
            Analyze patterns and predict future issues based on historical data.
          </p>
        </TabsContent>
      </Tabs>

      <div className="mb-4">
        <Textarea
          placeholder={mode === 'assistant' ? "Ask something like: 'Analyze recent pothole reports'" : 
            mode === 'reports' ? "Specify report parameters..." : 
            "Describe the trend analysis you need..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              {mode === 'assistant' ? 'Ask AI Assistant' : 
               mode === 'reports' ? 'Generate Report' : 'Analyze Trend'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {response && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-lg">
          <div className="flex items-center mb-2">
            <Bot className="h-5 w-5 mr-2 text-purple-500" />
            <span className="font-medium">AI Response</span>
            <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800">
              {mode === 'assistant' ? 'Insight' : 
               mode === 'reports' ? 'Report' : 'Prediction'}
            </Badge>
          </div>
          <p className="text-sm text-gray-700">{response}</p>
          <div className="mt-3 flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2 text-xs"
            >
              <CheckCircle className="mr-1 h-3 w-3" /> 
              Apply Recommendation
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              <AlertCircle className="mr-1 h-3 w-3" /> 
              Flag for Review
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdminAIAssistant;
