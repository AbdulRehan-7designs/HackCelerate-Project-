import { AIInsightsDashboard } from "@/components/admin/AIInsightsDashboard";
import Navbar from "@/components/Navbar";

const AIInsights = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-6">AI Insights Dashboard</h1>
        <AIInsightsDashboard />
      </main>
    </div>
  );
};

export default AIInsights; 