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
    const { image, mimeType } = await req.json();

    console.log('AI Image Analysis request received');

    const prompt = `Analyze this civic issue image and identify:
1. The type of civic issue (e.g., pothole, broken streetlight, garbage, water leak, fallen tree, graffiti, etc.)
2. The severity level (low, medium, high, urgent)
3. Any safety concerns
4. Relevant tags/keywords that describe the issue

Return your response as a JSON object with this structure:
{
  "tags": ["tag1", "tag2", "tag3"],
  "category": "category name",
  "severity": "severity level",
  "description": "brief description"
}

Focus on civic infrastructure issues and community problems.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      result = JSON.parse(jsonText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      result = {
        tags: ['civic issue', 'needs attention'],
        category: 'General',
        severity: 'medium',
        description: 'Civic issue detected in image'
      };
    }

    console.log('AI image analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        tags: result.tags || ['civic issue'],
        category: result.category,
        severity: result.severity,
        description: result.description,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-image-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze image', 
        details: error.message,
        tags: ['civic issue', 'needs attention'] // Fallback tags
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});



