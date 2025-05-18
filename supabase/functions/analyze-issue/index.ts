
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Parse request body
    const { issueId } = await req.json();
    
    if (!issueId) {
      return new Response(
        JSON.stringify({ error: 'Issue ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch issue details
    const { data: issueData, error: issueError } = await supabaseClient
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single();

    if (issueError) {
      console.error('Error fetching issue:', issueError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch issue details' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch similar issues
    const { data: similarIssues, error: similarError } = await supabaseClient
      .from('issues')
      .select('id, title, description, category')
      .eq('category', issueData.category)
      .neq('id', issueId)
      .limit(3);

    // Generate simulated AI analysis
    const analysis = {
      issue_id: issueId,
      predicted_category: issueData.category,
      category_confidence: 0.85 + (Math.random() * 0.15),
      alternative_categories: generateAlternativeCategories(issueData.category),
      extracted_keywords: extractKeywords(issueData.description),
      similar_issue_ids: similarIssues?.map(issue => issue.id) || [],
      similarity_scores: generateSimilarityScores(similarIssues),
      duplicate_score: 0.15 + (Math.random() * 0.25),
      priority_score: calculatePriorityScore(issueData),
      impact_assessment: generateImpactAssessment(issueData),
      urgency_level: determineUrgencyLevel(issueData),
      assigned_departments: assignDepartments(issueData.category),
      estimated_response_time: estimateResponseTime(issueData),
      resource_requirements: calculateResourceRequirements(issueData),
      detected_patterns: {},
      seasonal_factors: {},
      trend_indicators: {}
    };

    // Store the analysis in the database
    const { data: savedAnalysis, error: saveError } = await supabaseClient
      .from('ai_analyses')
      .insert(analysis)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return the analysis
    return new Response(
      JSON.stringify({ analysis: savedAnalysis }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-issue function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions for simulation
function generateAlternativeCategories(mainCategory: string) {
  const categories = [
    'Road Damage', 'Water Leakage', 'Garbage & Waste', 
    'Street Light Issue', 'Tree Hazard', 'Graffiti', 
    'Park Maintenance', 'Sidewalk Damage'
  ];
  
  const alternatives: Record<string, number> = {};
  const filtered = categories.filter(cat => cat !== mainCategory);
  
  // Select 2-3 random alternative categories
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count && i < filtered.length; i++) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const cat = filtered[randomIndex];
    alternatives[cat] = 0.2 + Math.random() * 0.4;
    filtered.splice(randomIndex, 1);
  }
  
  return alternatives;
}

function extractKeywords(text: string): string[] {
  // In a real app, this would use NLP. For now, we'll simulate.
  const commonKeywords = [
    'pothole', 'water', 'leak', 'garbage', 'trash', 
    'light', 'tree', 'damage', 'broken', 'hazard',
    'graffiti', 'vandalism', 'dangerous', 'flooding',
    'repair', 'urgent', 'intersection', 'road', 'sidewalk'
  ];
  
  const keywords: string[] = [];
  const count = 3 + Math.floor(Math.random() * 4);
  
  for (let i = 0; i < count; i++) {
    const keyword = commonKeywords[Math.floor(Math.random() * commonKeywords.length)];
    if (!keywords.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords;
}

function generateSimilarityScores(similarIssues: any[] | null): Record<string, number> {
  if (!similarIssues || similarIssues.length === 0) {
    return {};
  }
  
  const scores: Record<string, number> = {};
  
  for (const issue of similarIssues) {
    scores[issue.id] = 0.4 + Math.random() * 0.5;
  }
  
  return scores;
}

function calculatePriorityScore(issue: any): number {
  // In a real app, this would use factors like severity, location, etc.
  return Math.floor(Math.random() * 5) + 1;
}

function generateImpactAssessment(issue: any): string {
  const impacts = [
    "Low impact on daily activities. Can be addressed during routine maintenance.",
    "Moderate impact affecting pedestrian safety. Requires attention within the standard timeline.",
    "Significant impact on traffic flow and safety. Should be prioritized for swift resolution.",
    "High impact affecting critical infrastructure. Immediate attention recommended.",
    "Severe impact posing immediate danger to residents. Emergency response required."
  ];
  
  return impacts[Math.floor(Math.random() * impacts.length)];
}

function determineUrgencyLevel(issue: any): string {
  const levels = ["Low", "Medium", "High", "Critical"];
  return levels[Math.floor(Math.random() * levels.length)];
}

function assignDepartments(category: string): string[] {
  const departmentMap: Record<string, string[]> = {
    'Road Damage': ['Public Works', 'Transportation'],
    'Water Leakage': ['Water Utility', 'Infrastructure'],
    'Garbage & Waste': ['Sanitation', 'Environmental Services'],
    'Street Light Issue': ['Electrical', 'Public Safety'],
    'Tree Hazard': ['Parks & Recreation', 'Public Works'],
    'Graffiti': ['Maintenance', 'Community Services'],
    'Park Maintenance': ['Parks & Recreation', 'Public Works'],
    'Sidewalk Damage': ['Public Works', 'Transportation']
  };
  
  return departmentMap[category] || ['General Maintenance', 'Community Services'];
}

function estimateResponseTime(issue: any): number {
  // Return hours for response time
  return 24 + Math.floor(Math.random() * 72);
}

function calculateResourceRequirements(issue: any) {
  const personnel = 1 + Math.floor(Math.random() * 5);
  const hours = personnel * (4 + Math.floor(Math.random() * 8));
  
  const equipmentOptions = [
    'Truck', 'Excavator', 'Concrete Mixer', 'Water Pump', 
    'Generator', 'Light Tower', 'Chainsaw', 'Safety Barriers',
    'Ladder', 'Pressure Washer', 'Handheld Tools'
  ];
  
  const equipmentCount = 1 + Math.floor(Math.random() * 3);
  const equipment = [];
  
  for (let i = 0; i < equipmentCount; i++) {
    const item = equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)];
    if (!equipment.includes(item)) {
      equipment.push(item);
    }
  }
  
  return {
    personnel: personnel,
    estimatedHours: hours,
    equipmentNeeded: equipment
  };
}
