
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AreaSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const areas = [
  { id: "north", name: "North" },
  { id: "south", name: "South" },
  { id: "east", name: "East" },
  { id: "west", name: "West" },
  { id: "central", name: "Central" }
];

const AreaSelector = ({ value, onValueChange }: AreaSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="area">Area <span className="text-red-500">*</span></Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="area">
          <SelectValue placeholder="Select an area" />
        </SelectTrigger>
        <SelectContent>
          {areas.map((area) => (
            <SelectItem key={area.id} value={area.id} className={`area-${area.id}`}>
              {area.name} Area
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AreaSelector;
