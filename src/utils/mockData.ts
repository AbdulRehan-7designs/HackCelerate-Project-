
import { useState, useEffect } from 'react';

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'reported' | 'verified' | 'in-progress' | 'resolved';
  reportedAt: string;
  reportedBy: string;
  votes: number;
  location: string | { address: string; lat: number; lng: number };
  images?: string[];
  videos?: string[];
  audio?: string[];
  aiTags?: string[];
}

// Format time ago helper
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  
  return Math.floor(seconds) + " seconds ago";
};

// Mock data for Indian civic issues
export const mockIssues: IssueReport[] = [
  {
    id: "issue-1",
    title: "Large pothole on MG Road near Metro Station",
    description: "There's a large pothole on MG Road near the Metro Station entrance that is causing traffic congestion and is dangerous for two-wheelers. Multiple accidents have been reported here in the past week.",
    category: "Road Damage",
    status: "reported",
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Rahul S.",
    votes: 12,
    location: {
      address: "nampally, Hyderabad",
      lat: 12.9716,
      lng: 77.5946
    },
    images: [
      "https://tse4.mm.bing.net/th/id/OIP.Vb8TqsJINs2VQDssMWvhKwHaEV?rs=1&pid=ImgDetMain&o=7&rm=3"
    ],
    aiTags: ["pothole", "road", "traffic hazard", "vehicle damage"]
  },
  {
    id: "issue-2",
    title: "Garbage pile-up near Lajpat Nagar Market",
    description: "Waste has not been collected for over a week at the Lajpat Nagar Market. The garbage is spilling onto the street and causing foul smell in the entire area. This is becoming a health hazard for shoppers and residents.",
    category: "Garbage & Waste",
    status: "verified",
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Priya M.",
    votes: 8,
    location: "mehndipatnam,hyderabad,Telangana",
    images: [
      "https://tse3.mm.bing.net/th/id/OIP.Ef6pvPNeErt60wrmmDVVPQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3"
    ],
    aiTags: ["garbage", "waste", "public health", "sanitation"]
  },
  {
    id: "issue-3",
    title: "Water leakage on Carter Road",
    description: "There's been continuous water leakage from a broken pipe on Carter Road for the past three days. This is causing water wastage and making the road slippery. The road is partially flooded now.",
    category: "Water Leakage",
    status: "in-progress",
    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Amit K.",
    votes: 6,
    location: "Tolichowki road ,below the bridge , Hyderabad",
    images: [
      "/placeholder.svg?text=Water+Leakage+Mumbai", 
      "/placeholder.svg?text=Broken+Pipe"
    ],
    videos: [
      "/placeholder.svg?text=Water+Flow+Video"
    ],
    aiTags: ["water leakage", "pipe", "flooding", "road hazard"]
  },
  {
    id: "issue-4",
    title: "Non-functioning street lights near Shivaji Park",
    description: "Multiple street lights near Shivaji Park have not been working for over two weeks now. The area becomes very dark at night making it unsafe for pedestrians and increasing risk of accidents. Urgent repair needed.",
    category: "Street Light Issue",
    status: "resolved",
    reportedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Sunita P.",
    votes: 5,
    location: "Shivaji Park, dodh bowli, hyderabad",
    images: ["/placeholder.svg?text=Dark+Street+Mumbai"],
    aiTags: ["street light", "safety hazard", "night", "electrical"]
  },
  {
    id: "issue-5",
    title: "Collapsed drainage system in gulshan colony",
    description: "The drainage system in gulshan colony near the market has collapsed causing sewage overflow onto the main road. The stench is unbearable and it's creating unhygienic conditions for the nearby food stalls and residents.",
    category: "Drainage Issue",
    status: "reported",
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Vikram S.",
    votes: 10,
    location: "gulshan colony,tolichowki , hyderabad, Telangana",
    images:["https://tse4.mm.bing.net/th/id/OIP.Vb8TqsJINs2VQDssMWvhKwHaEV?rs=1&pid=ImgDetMain&o=7&rm=3"],
    aiTags: ["drainage", "sewage", "public health", "infrastructure"]
  },
  {
    id: "issue-6",
    title: "Damaged footpath near Gandhi Bazaar",
    description: "The footpath near Gandhi Bazaar has large cracks and uneven surfaces making it difficult for pedestrians, especially the elderly to walk safely. Some sections have been completely broken exposing underground wires.",
    category: "Sidewalk Damage",
    status: "in-progress",
    reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Deepak R.",
    votes: 7,
    location: "Gandhi Bazaar, Basavanagudi, hyderabad",
    images: [
      "/placeholder.svg?text=Broken+Sidewalk+Bengaluru",
      "/placeholder.svg?text=Exposed+Wires"
    ],
    aiTags: ["footpath", "pedestrian safety", "accessibility", "infrastructure damage"]
  },
  {
    id: "issue-7",
    title: "Dangerous open manholes on JM Road",
    description: "There are three open manholes on JM Road without any warning signs or barricades. This is extremely dangerous for pedestrians and vehicles, especially at night. The issue was first reported a month ago but still not fixed.",
    category: "Safety Hazard",
    status: "verified",
    reportedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Nisha J.",
    votes: 15,
    location: "JM Road, santossh nagar,hyderabad",
    images: [
      "/placeholder.svg?text=Open+Manholes+Pune", 
      "/placeholder.svg?text=Road+Hazard"
    ],
    aiTags: ["manhole", "road safety", "accident risk", "civic negligence"]
  },
  {
    id: "issue-8",
    title: "Illegal dumping of industrial waste near chikkadpally",
    description: "Several factories are dumping untreated industrial waste directly into the Yamuna river near Kalindi Kunj. The water has turned dark and has a chemical smell. This is causing severe pollution and affecting marine life.",
    category: "Environmental Hazard",
    status: "reported",
    reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Arjun M.",
    votes: 18,
    location: "chikkadpally,hyderabad,Telangana",
    images: [
      "/placeholder.svg?text=Yamuna+Pollution", 
      "/placeholder.svg?text=Industrial+Waste"
    ],
    videos: [
      "/placeholder.svg?text=Factory+Dumping+Video"
    ],
    aiTags: ["water pollution", "industrial waste", "river", "environmental impact"]
  },
  {
    id: "issue-9",
    title: "Fallen tree blocking road in Salt Lake",
    description: "A large tree has fallen across the road in banjara hills ,road no 22 after last night's heavy storm. It's completely blocking the road and has damaged electric lines. Municipal workers were informed but no action taken yet.",
    category: "Tree Hazard",
    status: "in-progress",
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Sanjay D.",
    votes: 9,
    location: "banjara hills,road no 22, hyderabad, Telangana",
    images: [
      "/placeholder.svg?text=Fallen+Tree+Kolkata", 
      "/placeholder.svg?text=Blocked+Road"
    ],
    aiTags: ["fallen tree", "road block", "electric lines", "storm damage"]
  },
  {
    id: "issue-10",
    title: "Public toilet in disrepair near apollo hospital",
    description: "The public toilet near apollo hospital is in extremely poor condition. No water supply, broken doors, and extremely unhygienic conditions. Thousands of passengers use this station daily and this is causing great inconvenience.",
    category: "Public Facility",
    status: "reported",
    reportedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Lakshmi N.",
    votes: 12,
    location: "near apollo hospital,hyderabad,Telangana",
    images: ["/placeholder.svg?text=Toilet+Condition+Chennai"],
    aiTags: ["public toilet", "sanitation", "public facility", "hygiene", "railway station"]
  },
  {
    id: "issue-11",
    title: "Stray dog menace near Indira Nagar Park",
    description: "There is a growing concern about aggressive stray dogs near Indira Nagar Park. Several children and morning walkers have been chased and some even bitten. The pack has grown to over 10 dogs and they become particularly aggressive in the evenings.",
    category: "Animal Control",
    status: "verified",
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Mohan G.",
    votes: 14,
    location: "Indira Nagar, hyderabad,Telangana",
    images: ["/placeholder.svg?text=Stray+Dogs+Lucknow"],
    aiTags: ["stray dogs", "public safety", "park", "animal control"]
  },
  {
    id: "issue-12",
    title: "Traffic signal malfunction at LB Nagar junction",
    description: "The traffic signal at the LB Nagar junction has been malfunctioning for the past week. It randomly switches between colors causing confusion and traffic jams. During peak hours, the situation becomes chaotic and dangerous.",
    category: "Traffic Infrastructure",
    status: "in-progress",
    reportedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Ravi T.",
    votes: 11,
    location: {
      address: "LB Nagar Junction, Hyderabad",
      lat: 17.3616, 
      lng: 78.5455
    },
    images: ["/placeholder.svg?text=Traffic+Signal+Hyderabad"],
    videos: ["/placeholder.svg?text=Junction+Traffic+Video"],
    aiTags: ["traffic signal", "road safety", "junction", "infrastructure"]
  },
  {
    id: "issue-13",
    title: "School zone without speed breakers or signs in Shimla",
    description: "There are no speed breakers or warning signs near the Government School in Lower Bazaar, Shimla. Vehicles speed through this area where children cross the road daily. This is an accident waiting to happen and needs immediate attention.",
    category: "Road Safety",
    status: "reported",
    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Vimala S.",
    votes: 8,
    location: "chota bazaar, Near Government School,flimnagar,hyderabad,Telangana",
    images: ["/placeholder.svg?text=School+Zone+Shimla"],
    aiTags: ["school zone", "road safety", "speed breakers", "children"]
  },
  {
    id: "issue-14",
    title: "Overflowing sewage in ramanthapur",
    description: "The sewage system in ramanthapur area has been overflowing for the past three days. Waste water is accumulating on the main road making it difficult for pedestrians and causing health concerns. The stench is affecting nearby offices and residential areas.",
    category: "Sewage Issue",
    status: "resolved",
    reportedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Aditya P.",
    votes: 9,
    location: "ramantha pur,hyderabad,Telangana",
    images: [
      "/placeholder.svg?text=Sewage+Overflow+Pune",
      "/placeholder.svg?text=Affected+Road"
    ],
    aiTags: ["sewage", "water logging", "sanitation", "IT park"]
  },
  {
    id: "issue-15",
    title: "Illegal encroachment on public pathway in Connaught Place",
    description: "Several vendors have illegally encroached upon the public pathway in Connaught Place's inner circle. This has reduced the walking space for pedestrians to less than 2 feet in some places, forcing people to walk on the main road risking accidents.",
    category: "Encroachment",
    status: "reported",
    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Rajesh K.",
    votes: 7,
    location: {
      address: "kundanbagh,hyderabad,Telangana",
      lat: 28.6315, 
      lng: 77.2167
    },
    images: [
      "/placeholder.svg?text=Encroachment+Delhi",
      "/placeholder.svg?text=Narrow+Pathway"
    ],
    aiTags: ["encroachment", "public space", "pedestrian safety", "urban planning"]
  }
];

export const issueCategories = [
  "Road Damage",
  "Garbage & Waste",
  "Water Leakage",
  "Street Light Issue",
  "Tree Hazard",
  "Environmental Hazard",
  "Drainage Issue",
  "Sidewalk Damage",
  "Traffic Infrastructure",
  "Public Facility",
  "Safety Hazard",
  "Animal Control",
  "Encroachment",
  "Sewage Issue",
  "Road Safety"
];

export const useVotes = (issueId: string, initialVotes: number) => {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Check if the user has already voted on this issue
    const votedIssues = localStorage.getItem('votedIssues');
    if (votedIssues) {
      const parsedVotedIssues = JSON.parse(votedIssues);
      setHasVoted(parsedVotedIssues.includes(issueId));
    }
  }, [issueId]);

  const vote = async () => {
    if (hasVoted) {
      return;
    }

    // In a real app, this would call an API
    setVotes(votes + 1);
    setHasVoted(true);

    // Store that the user has voted on this issue
    const votedIssues = localStorage.getItem('votedIssues');
    if (votedIssues) {
      const parsedVotedIssues = JSON.parse(votedIssues);
      localStorage.setItem('votedIssues', JSON.stringify([...parsedVotedIssues, issueId]));
    } else {
      localStorage.setItem('votedIssues', JSON.stringify([issueId]));
    }
  };

  return { votes, hasVoted, vote };
};
