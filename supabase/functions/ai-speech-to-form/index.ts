import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

// Available categories for civic issues
const availableCategories = [
  'Road Damage',
  'Water Leakage',
  'Garbage & Waste',
  'Street Light Issue',
  'Tree Hazard',
  'Graffiti',
  'Park Maintenance',
  'Sidewalk Damage',
  'Drainage Blockage',
  'Electrical Hazard',
  'Environmental Hazard',
  'Construction',
  'Traffic Sign Issue',
  'Public Safety'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Transcript is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing speech transcript:', transcript.substring(0, 100) + '...');

    const prompt = `You are an AI assistant that extracts structured information from speech transcripts about civic issues.

Available categories: ${availableCategories.join(', ')}

From the following speech transcript, extract and return ONLY a JSON object with these exact keys:
- title: A brief, clear title for the issue (max 100 characters)
- description: A detailed description of the issue (2-4 sentences)
- category: One of the available categories listed above (must match exactly)
- address: The location/address mentioned in the speech (if any)
- area: The general area or neighborhood mentioned (if any)

Speech transcript:
"${transcript}"

Rules:
1. Extract the title from what the person is reporting
2. Use the description to provide context and details
3. Match the category to one of the available categories exactly
4. Extract location information if mentioned
5. If location is not clear, leave address and area empty
6. Return ONLY valid JSON, no additional text or markdown

Return your response as a JSON object with this exact structure:
{
  "title": "string",
  "description": "string",
  "category": "string (must match one of the available categories)",
  "address": "string or empty",
  "area": "string or empty"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : cleanedText;
      extractedData = JSON.parse(jsonText);
      
      // Validate and clean the extracted data
      if (!extractedData.title) {
        extractedData.title = transcript.substring(0, 100);
      }
      
      if (!extractedData.description) {
        extractedData.description = transcript;
      }
      
      // Ensure category matches available categories
      if (extractedData.category && !availableCategories.includes(extractedData.category)) {
        // Try to find a close match
        const categoryLower = extractedData.category.toLowerCase();
        const matchedCategory = availableCategories.find(cat => 
          cat.toLowerCase().includes(categoryLower) || categoryLower.includes(cat.toLowerCase())
        );
        extractedData.category = matchedCategory || 'Road Damage'; // Default fallback
      } else if (!extractedData.category) {
        extractedData.category = 'Road Damage'; // Default fallback
      }
      
      // Clean up empty strings
      if (!extractedData.address) extractedData.address = '';
      if (!extractedData.area) extractedData.area = '';
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: create basic structure from transcript
      extractedData = {
        title: transcript.substring(0, 100).trim() || 'Civic Issue Report',
        description: transcript,
        category: 'Road Damage',
        address: '',
        area: ''
      };
    }

    console.log('Successfully extracted form data');

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-speech-to-form function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process speech transcript', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});



