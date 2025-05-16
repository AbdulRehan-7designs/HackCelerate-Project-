
import { Badge } from "@/components/ui/badge";

interface IssueTagListProps {
  tags: string[];
}

export const IssueTagList = ({ tags }: IssueTagListProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">AI Analysis Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="bg-purple-50">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
