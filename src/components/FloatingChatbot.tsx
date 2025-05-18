
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize, Maximize, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: 'bot', 
      content: 'Hello! I\'m your CivicPulse assistant. How can I help you with community issues today?', 
      timestamp: new Date() 
    }
  ]);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Predefined responses based on common civic queries
  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('pothole') || input.includes('road') || input.includes('street damage')) {
      return 'Potholes and road damage should be reported with location details and photos if possible. Current average response time for road repairs is 5-7 days.';
    } else if (input.includes('garbage') || input.includes('trash') || input.includes('waste')) {
      return 'For garbage collection issues, please provide the exact location. The municipal waste management team operates daily from 6am to 10am.';
    } else if (input.includes('water') || input.includes('leak') || input.includes('pipe')) {
      return 'Water leakage issues are handled by the Water Supply Department. Emergency water problems are typically addressed within 24 hours.';
    } else if (input.includes('light') || input.includes('streetlight') || input.includes('lamp')) {
      return 'Street light outages can be reported with the pole number if visible. The electrical maintenance team usually repairs these within 48-72 hours.';
    } else if (input.includes('how to report') || input.includes('submit') || input.includes('create report')) {
      return 'To create a new report, go to the main page and click on "Report Issue". You'll need to provide details, location, and preferably photos of the issue.';
    } else if (input.includes('status') || input.includes('update') || input.includes('progress')) {
      return 'You can check the status of your reported issues in the "My Reports" section. Each report will show its current status: Reported, Verified, In Progress, or Resolved.';
    } else if (input.includes('contact') || input.includes('speak') || input.includes('human')) {
      return 'If you need to speak with a representative, please call our helpline at 1800-123-4567 between 9am to 5pm on weekdays.';
    } else if (input.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with regarding community issues?';
    }
    
    return 'I understand you\'re asking about ' + userInput + '. To best assist you, could you provide more specific details about the civic issue you\'re experiencing?';
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate bot thinking and then respond
    setTimeout(() => {
      const botMessage: Message = {
        type: 'bot',
        content: getBotResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('.chatbot-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 380, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y));
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Add and remove event listeners for dragging
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat button when closed */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg gradient-header flex items-center justify-center z-50 hover:scale-110 transition-transform"
        >
          <MessageCircle size={24} />
        </Button>
      )}
      
      {/* Chat window when open */}
      {isOpen && (
        <Card
          ref={chatRef}
          className={`fixed shadow-xl z-50 transition-all duration-300 ${
            isMinimized ? 'w-80 h-12' : 'w-[380px] h-[500px]'
          }`}
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`
          }}
          onMouseDown={handleMouseDown}
        >
          <CardHeader className="p-3 flex flex-row items-center justify-between gradient-header rounded-t-lg chatbot-header cursor-move">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <img src="/placeholder.svg" alt="CivicBot" />
              </Avatar>
              <div>
                <h3 className="font-medium text-white">CivicPulse Bot</h3>
                {!isMinimized && <p className="text-xs text-white/80">Ask about civic issues</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isMinimized ? (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsMinimized(false)}
                  className="h-6 w-6 text-white hover:text-white hover:bg-white/20"
                >
                  <Maximize size={14} />
                </Button>
              ) : (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 text-white hover:text-white hover:bg-white/20"
                >
                  <Minimize size={14} />
                </Button>
              )}
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-white hover:text-white hover:bg-white/20"
              >
                <X size={14} />
              </Button>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <>
              <CardContent className="p-3 overflow-y-auto h-[380px] bg-gray-50">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] px-3 py-2 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.type === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="p-3 border-t">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" className="gradient-header">
                    <Send size={16} />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default FloatingChatbot;
