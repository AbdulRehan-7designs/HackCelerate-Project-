
import { UserCheck, FileText, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const AdminSidebar = () => {
  return (
    <div className="hidden md:flex w-64 bg-gradient-to-b from-civic-blue to-blue-700 text-white flex-col">
      <div className="p-4 flex items-center space-x-2 border-b border-white/20">
        <span className="font-bold text-xl">TownReport</span>
        <span className="bg-white/20 rounded px-2 py-0.5 text-xs">Admin</span>
      </div>
      
      <div className="flex-1 py-6">
        <div className="px-4 mb-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="font-medium">Admin User</div>
              <div className="text-xs text-white/70">Super Admin</div>
            </div>
          </div>
        </div>
        
        <nav className="space-y-1 px-2">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md bg-white/10">
            <FileText size={18} />
            <span>Reports</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/10">
            <BarChart3 size={18} />
            <span>Analytics</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/10">
            <Settings size={18} />
            <span>Settings</span>
          </a>
        </nav>
      </div>
      
      <div className="p-4 border-t border-white/20">
        <Link to="/">
          <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
