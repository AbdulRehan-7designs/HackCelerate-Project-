
import { IssueReport } from "@/utils/mockData";

interface IssueMediaProps {
  issue: IssueReport;
}

export const IssueMedia = ({ issue }: IssueMediaProps) => {
  if ((!issue.images || issue.images.length === 0) && 
      (!issue.videos || issue.videos.length === 0) && 
      (!issue.audio || issue.audio.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {issue.images && issue.images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {issue.images.map((image, i) => (
              <img 
                key={i} 
                src={image} 
                alt={`Issue ${issue.id} image ${i+1}`} 
                className="rounded-md w-full aspect-square object-cover"
              />
            ))}
          </div>
        </div>
      )}
      
      {issue.videos && issue.videos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Videos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {issue.videos.map((video, i) => (
              <video 
                key={i}
                controls
                className="rounded-md w-full"
                poster={issue.images?.[0]}
              >
                <source src={video} />
                Your browser does not support video playback.
              </video>
            ))}
          </div>
        </div>
      )}
      
      {issue.audio && issue.audio.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Audio</h3>
          <div className="space-y-2">
            {issue.audio.map((audioFile, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-md">
                <audio controls className="w-full">
                  <source src={audioFile} />
                  Your browser does not support audio playback.
                </audio>
                <div className="text-xs text-gray-500 mt-1">Audio recording {i+1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
