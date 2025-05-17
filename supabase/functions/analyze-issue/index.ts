
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the issue data from the request
    const { issueId } = await req.json();

    if (!issueId) {
      return new Response(
        JSON.stringify({ error: "Issue ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the issue from the database
    const { data: issue, error: issueError } = await supabaseClient
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single();

    if (issueError) {
      return new Response(
        JSON.stringify({ error: issueError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock AI analysis (in a real app, this would call external AI APIs)
    // Analyze title and description for category prediction
    const predictedCategory = mockPredictCategory(issue.title, issue.description);
    const confidence = Math.random() * 0.4 + 0.6; // Random confidence between 0.6 and 1.0
    
    const alternativeCategories = mockAlternativeCategories(issue.category);
    const extractedKeywords = mockExtractKeywords(issue.title, issue.description);
    
    // Find similar issues (in a real app, this would use semantic similarity)
    const { data: similarIssues, error: similarError } = await supabaseClient
      .from('issues')
      .select('id, title, description, location')
      .eq('category', issue.category)
      .neq('id', issueId)
      .limit(3);

    if (similarError) {
      console.error("Error fetching similar issues:", similarError);
    }

    const similarIssueIds = similarIssues?.map(si => si.id) || [];
    const similarityScores = {};
    similarIssueIds.forEach(id => {
      similarityScores[id] = (Math.random() * 0.5 + 0.3).toFixed(2); // Random score between 0.3 and 0.8
    });

    // Calculate priority score based on various factors
    const priorityScore = mockCalculatePriority(issue);
    
    // Estimate departments that should handle this issue
    const assignedDepartments = mockAssignDepartments(issue.category);
    
    // Store the AI analysis result
    const { data: analysis, error: analysisError } = await supabaseClient
      .from('ai_analyses')
      .insert({
        issue_id: issueId,
        predicted_category: predictedCategory,
        category_confidence: confidence,
        alternative_categories: alternativeCategories,
        extracted_keywords: extractedKeywords,
        similar_issue_ids: similarIssueIds,
        similarity_scores: similarityScores,
        duplicate_score: similarIssueIds.length > 0 ? Math.random() * 0.7 : 0,
        priority_score: priorityScore,
        impact_assessment: mockImpactAssessment(priorityScore),
        urgency_level: mockUrgencyLevel(priorityScore),
        assigned_departments: assignedDepartments,
        estimated_response_time: Math.floor(Math.random() * 48) + 24, // 24-72 hours
        resource_requirements: mockResourceRequirements(issue.category)
      })
      .select()
      .single();

    if (analysisError) {
      return new Response(
        JSON.stringify({ error: analysisError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Mock functions for AI analysis (would be replaced with actual AI API calls)
function mockPredictCategory(title: string, description: string): string {
  const categories = [
    "Road Damage", "Street Light Issue", "Garbage & Waste", 
    "Water Leakage", "Graffiti", "Drainage Blockage", 
    "Tree Hazard", "Sidewalk Damage"
  ];
  
  // Very basic keyword matching (in a real app, would use ML model)
  if (title.toLowerCase().includes("pothole") || description.toLowerCase().includes("pothole")) {
    return "Road Damage";
  } else if (title.toLowerCase().includes("light") || description.toLowerCase().includes("light")) {
    return "Street Light Issue";
  } else if (title.toLowerCase().includes("trash") || description.toLowerCase().includes("trash") || 
             title.toLowerCase().includes("garbage") || description.toLowerCase().includes("garbage")) {
    return "Garbage & Waste";
  } else if (title.toLowerCase().includes("water") || description.toLowerCase().includes("water") ||
             title.toLowerCase().includes("leak") || description.toLowerCase().includes("leak")) {
    return "Water Leakage";
  } else if (title.toLowerCase().includes("tree") || description.toLowerCase().includes("tree") ||
             title.toLowerCase().includes("branch") || description.toLowerCase().includes("branch")) {
    return "Tree Hazard";
  }
  
  // If no keyword match, return a random category
  return categories[Math.floor(Math.random() * categories.length)];
}

function mockAlternativeCategories(mainCategory: string): Record<string, number> {
  const categories = [
    "Road Damage", "Street Light Issue", "Garbage & Waste", 
    "Water Leakage", "Graffiti", "Drainage Blockage", 
    "Tree Hazard", "Sidewalk Damage"
  ].filter(c => c !== mainCategory);
  
  const alternatives = {};
  
  // Add 2-3 alternative categories with confidence scores
  const numAlternatives = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < numAlternatives; i++) {
    if (categories.length <= i) break;
    alternatives[categories[i]] = (Math.random() * 0.5).toFixed(2); // Score between 0 and 0.5
  }
  
  return alternatives;
}

function mockExtractKeywords(title: string, description: string): string[] {
  const combinedText = `${title} ${description}`.toLowerCase();
  const keywords = [];
  
  const possibleKeywords = [
    "pothole", "road", "light", "street", "garbage", "waste", 
    "water", "leak", "graffiti", "drainage", "tree", "branch",
    "sidewalk", "damage", "hazard", "danger", "repair", "fix"
  ];
  
  possibleKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // Add a few random keywords if we don't have enough
  while (keywords.length < 3) {
    const randomKeyword = possibleKeywords[Math.floor(Math.random() * possibleKeywords.length)];
    if (!keywords.includes(randomKeyword)) {
      keywords.push(randomKeyword);
    }
  }
  
  return keywords;
}

function mockCalculatePriority(issue: any): number {
  // Base priority
  let priority = 3; // Medium priority by default
  
  // Adjust based on category
  if (["Water Leakage", "Tree Hazard"].includes(issue.category)) {
    priority += 1; // Higher priority for potentially dangerous issues
  }
  
  // Adjust based on votes
  if (issue.votes > 10) {
    priority += 1;
  } else if (issue.votes > 5) {
    priority += 0.5;
  }
  
  // Cap at 5
  return Math.min(Math.round(priority), 5);
}

function mockImpactAssessment(priorityScore: number): string {
  const impacts = [
    "Minimal impact on community",
    "Low impact on small number of residents",
    "Moderate impact on local area",
    "Significant impact on neighborhood",
    "Critical impact requiring immediate attention"
  ];
  
  const index = Math.min(priorityScore - 1, impacts.length - 1);
  return impacts[index];
}

function mockUrgencyLevel(priorityScore: number): string {
  const urgency = ["Low", "Low-Medium", "Medium", "High", "Critical"];
  const index = Math.min(priorityScore - 1, urgency.length - 1);
  return urgency[index];
}

function mockAssignDepartments(category: string): string[] {
  const departmentMap = {
    "Road Damage": ["Public Works", "Transportation"],
    "Street Light Issue": ["Public Works", "Utilities"],
    "Garbage & Waste": ["Sanitation", "Public Health"],
    "Water Leakage": ["Utilities", "Public Works"],
    "Graffiti": ["Parks & Recreation", "Public Works"],
    "Drainage Blockage": ["Public Works", "Environmental Services"],
    "Tree Hazard": ["Parks & Recreation", "Public Works"],
    "Sidewalk Damage": ["Public Works", "Transportation"]
  };
  
  return departmentMap[category] || ["Public Works"];
}

function mockResourceRequirements(category: string): Record<string, any> {
  const baseRequirements = {
    personnel: Math.floor(Math.random() * 3) + 1,
    estimatedHours: Math.floor(Math.random() * 8) + 2,
    equipmentNeeded: []
  };
  
  // Add category-specific equipment
  switch (category) {
    case "Road Damage":
      baseRequirements.equipmentNeeded = ["Asphalt", "Compactor", "Truck"];
      break;
    case "Street Light Issue":
      baseRequirements.equipmentNeeded = ["Ladder", "Replacement Bulbs", "Electrical Tools"];
      break;
    case "Water Leakage":
      baseRequirements.equipmentNeeded = ["Pipe Wrenches", "Replacement Pipes", "Sealant"];
      break;
    case "Tree Hazard":
      baseRequirements.equipmentNeeded = ["Chainsaw", "Safety Equipment", "Chipper"];
      break;
    default:
      baseRequirements.equipmentNeeded = ["Basic Tools", "Safety Equipment"];
  }
  
  return baseRequirements;
}
