
interface PlaceholderContentProps {
  message?: string;
}

const PlaceholderContent = ({ message = "Features coming soon..." }: PlaceholderContentProps) => {
  return (
    <div className="h-96 flex items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default PlaceholderContent;
