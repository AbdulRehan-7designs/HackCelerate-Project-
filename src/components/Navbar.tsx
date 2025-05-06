
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, MapPin, Search, Upload, LogIn } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import ReportForm from './ReportForm';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b gradient-header text-white shadow-md">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <MapPin className="h-6 w-6 text-white" />
          <span className="hidden font-bold sm:inline-block text-xl">TownReport</span>
          <span className="font-bold sm:hidden text-lg">TR</span>
          <span className="rounded bg-white/25 backdrop-blur-sm text-white px-1.5 py-0.5 text-xs font-semibold hidden sm:inline-flex">AI</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden w-full max-w-sm md:flex items-center space-x-2 mr-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search reports..."
                className="w-full bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 pl-8 rounded-md border border-white/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
              />
            </div>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Report Issue</span>
                <span className="sm:hidden">Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report a Civic Issue</DialogTitle>
                <DialogDescription>
                  Help improve your community by reporting issues that need attention.
                </DialogDescription>
              </DialogHeader>
              <ReportForm onSubmitSuccess={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="icon" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
            <Bell className="h-4 w-4" />
          </Button>

          <Link to="/login">
            <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/20 flex items-center gap-1.5">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
