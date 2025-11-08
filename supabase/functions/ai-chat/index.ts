import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    console.log('AI Chat request:', { message, context });

    const systemPrompt = `You are CivicBot, an AI assistant specialized in helping with civic issues and community reporting. 

You can help users with:
- Understanding how to report civic issues
- Providing information about issue categories
- Explaining the reporting process
- Offering tips for effective issue documentation
- General civic engagement guidance

Context about the platform:
- Users can report issues like potholes, broken streetlights, graffiti, etc.
- Issues are categorized (Infrastructure, Safety, Environment, etc.)
- Users can upload photos and videos
- Issues are tracked and can be voted on by community
- Admin dashboard provides analytics and management tools

Be helpful, friendly, and focused on civic engagement. Keep responses concise but informative.
${context ? `Additional context: ${context}` : ''}`;

    const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI response', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});