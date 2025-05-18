
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowUpCircle, ArrowDownCircle, Settings, Save,
  AlertTriangle, Clock, Users, MapPin, RotateCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomatedPrioritizationSystemProps {
  className?: string;
}

interface PrioritizationRule {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
  icon: React.ReactNode;
}

const AutomatedPrioritizationSystem = ({ className }: AutomatedPrioritizationSystemProps) => {
  const [rules, setRules] = useState<PrioritizationRule[]>([
    {
      id: '1',
      name: 'Urgency Score',
      description: 'Prioritize issues marked as urgent by reporters',
      weight: 85,
      enabled: true,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />
    },
    {
      id: '2',
      name: 'Reporting Age',
      description: 'Older reports get higher priority',
      weight: 65,
      enabled: true,
      icon: <Clock className="h-4 w-4 text-amber-500" />
    },
    {
      id: '3',
      name: 'Affected Population',
      description: 'Reports affecting more people get higher priority',
      weight: 75,
      enabled: true,
      icon: <Users className="h-4 w-4 text-blue-500" />
    },
    {
      id: '4',
      name: 'Location',
      description: 'Prioritize issues in high-traffic or critical areas',
      weight: 70,
      enabled: true,
      icon: <MapPin className="h-4 w-4 text-green-500" />
    },
  ]);

  const [isAutoApplyEnabled, setIsAutoApplyEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleWeightChange = (id: string, newValue: number[]) => {
    setRules(prevRules =>
      prevRules.map(rule =>
        rule.id === id ? { ...rule, weight: newValue[0] } : rule
      )
    );
  };

  const handleToggleRule = (id: string) => {
    setRules(prevRules =>
      prevRules.map(rule =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "AI prioritization rules have been updated",
      });
    }, 1000);
  };

  const moveRule = (id: string, direction: 'up' | 'down') => {
    const index = rules.findIndex(rule => rule.id === id);
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === rules.length - 1)) {
      return;
    }
    
    const newRules = [...rules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newRules[targetIndex];
    newRules[targetIndex] = newRules[index];
    newRules[index] = temp;
    
    setRules(newRules);
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="font-medium text-lg">AI Issue Prioritization</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setRules(prev => [...prev].sort((a, b) => b.weight - a.weight))}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Auto-Sort
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Configure how the AI prioritizes incoming issues for your workflow
        </p>
      </div>

      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-apply"
              checked={isAutoApplyEnabled}
              onCheckedChange={setIsAutoApplyEnabled}
            />
            <Label htmlFor="auto-apply">Auto-apply to new issues</Label>
          </div>
          <Badge variant={isAutoApplyEnabled ? "default" : "outline"} className={isAutoApplyEnabled ? "bg-green-600" : ""}>
            {isAutoApplyEnabled ? "Active" : "Manual Mode"}
          </Badge>
        </div>

        <div className="space-y-5">
          {rules.map(rule => (
            <div key={rule.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {rule.icon}
                  <span className="font-medium ml-2">{rule.name}</span>
                  <Switch
                    id={`rule-${rule.id}`}
                    checked={rule.enabled}
                    onCheckedChange={() => handleToggleRule(rule.id)}
                    className="ml-3"
                  />
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => moveRule(rule.id, 'up')}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => moveRule(rule.id, 'down')}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">{rule.description}</p>
              <div className="flex items-center">
                <span className="text-xs font-medium w-8">Low</span>
                <div className="flex-grow mx-2">
                  <Slider
                    disabled={!rule.enabled}
                    value={[rule.weight]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleWeightChange(rule.id, value)}
                  />
                </div>
                <span className="text-xs font-medium w-8">High</span>
                <span className="ml-2 text-xs font-bold w-9 text-right">
                  {rule.weight}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t">
          <Button 
            onClick={handleSaveSettings}
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Prioritization Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border-t">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
          <h4 className="font-medium text-sm">Current AI Recommendations</h4>
        </div>
        <p className="text-xs text-gray-600">
          Based on current issue trends, the AI suggests increasing the weight of "Location" 
          and decreasing "Reporting Age" to optimize response effectiveness.
        </p>
      </div>
    </Card>
  );
};

export default AutomatedPrioritizationSystem;
