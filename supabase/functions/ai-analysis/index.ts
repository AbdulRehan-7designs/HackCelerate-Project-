import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { issueId, title, description, category, location } = await req.json();

    console.log('Analyzing issue:', { issueId, title, category });

    // AI Analysis using Gemini
    const prompt = `Analyze this civic issue report and provide detailed insights:

Title: ${title}
Description: ${description}
Category: ${category}
Location: ${location}

Please provide:
1. Predicted category (if different from current)
2. Priority score (1-10)
3. Urgency level (low, medium, high, critical)
4. Impact assessment (brief description)
5. Estimated response time (hours)
6. Resource requirements (list)
7. Extracted keywords (array)
8. Assigned departments (array)
9. Category confidence (0-1)
10. Duplicate score assessment (0-1)

Format your response as a JSON object with these exact keys:
predicted_category, priority_score, urgency_level, impact_assessment, estimated_response_time, resource_requirements, extracted_keywords, assigned_departments, category_confidence, duplicate_score

You are an AI assistant specialized in analyzing civic issues and infrastructure problems. Provide structured, actionable insights.`;

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
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    let analysis;
    
    try {
      const responseText = data.candidates[0].content.parts[0].text;
      // Extract JSON from response (handle markdown code blocks if present)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response, using fallback');
      analysis = {
        predicted_category: category,
        priority_score: 5,
        urgency_level: 'medium',
        impact_assessment: 'Standard civic issue requiring attention',
        estimated_response_time: 72,
        resource_requirements: ['Standard maintenance crew'],
        extracted_keywords: [category, 'civic', 'infrastructure'],
        assigned_departments: ['Public Works'],
        category_confidence: 0.8,
        duplicate_score: 0.1
      };
    }

    // Store analysis in database
    const { data: analysisData, error: analysisError } = await supabase
      .from('ai_analyses')
      .insert([{
        issue_id: issueId,
        predicted_category: analysis.predicted_category,
        priority_score: analysis.priority_score,
        urgency_level: analysis.urgency_level,
        impact_assessment: analysis.impact_assessment,
        estimated_response_time: analysis.estimated_response_time,
        resource_requirements: analysis.resource_requirements,
        extracted_keywords: analysis.extracted_keywords,
        assigned_departments: analysis.assigned_departments,
        category_confidence: analysis.category_confidence,
        duplicate_score: analysis.duplicate_score,
        alternative_categories: [category],
        similar_issue_ids: [],
        similarity_scores: {},
        detected_patterns: {},
        seasonal_factors: {},
        trend_indicators: {}
      }])
      .select()
      .single();

    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      throw new Error('Failed to store analysis');
    }

    console.log('Analysis completed and stored:', analysisData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisData,
        message: 'AI analysis completed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze issue', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});