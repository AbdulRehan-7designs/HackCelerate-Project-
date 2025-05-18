
import { formatDistance } from 'date-fns';

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  } | string;
  status: 'reported' | 'verified' | 'in-progress' | 'resolved' | 'fake' | 'new';
  votes: number;
  images: string[];
  videos?: string[];
  audio?: string[];
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  aiTags?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

export const issueCategories = [
  'Road Damage',
  'Garbage & Waste',
  'Water Leakage',
  'Street Light Issue',
  'Drainage Blockage',
  'Tree Hazard',
  'Graffiti',
  'Abandoned Vehicle',
  'Noise Complaint',
  'Sidewalk Damage',
  'Traffic Signal Issue',
  'Park Maintenance',
  'Public Property Damage',
  'Illegal Dumping',
  'Animal Control',
  'Pest Control',
  'Snow Removal',
  'Public Safety Concern',
  'Parking Violation',
  'Water Pollution',
  'Electricity Issues',
  'Encroachment',
  'Public Transport',
  'Sewage Problem',
  'Other'
];

export const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'verified', label: 'Verified' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' }
];

export const formatTimeAgo = (date: Date): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const mockIssues: IssueReport[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole that could damage vehicles. About 2 feet wide and 6 inches deep.',
    category: 'Road Damage',
    location: {
      address: '123 Main St, Springfield',
      lat: 40.7128,
      lng: -74.006
    },
    status: 'verified',
    votes: 15,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'john_doe',
    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiTags: ['pothole', 'road', 'hazard'],
    comments: [
      {
        id: 'c1',
        text: 'I drive by this every day, it\'s getting worse!',
        author: 'concerned_citizen',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '2',
    title: 'Overflowing trash bin at Central Park',
    description: 'The trash bin near the east entrance is overflowing. Garbage is spreading around the area.',
    category: 'Garbage & Waste',
    location: {
      address: 'Central Park East Entrance',
      lat: 40.7736,
      lng: -73.9712
    },
    status: 'reported',
    votes: 7,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'park_lover',
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiTags: ['garbage', 'trash', 'park'],
  },
  {
    id: '3',
    title: 'Broken street light on Elm Street',
    description: 'Street light has been out for over a week, making the area dark and unsafe at night.',
    category: 'Street Light Issue',
    location: {
      address: '456 Elm St, Springfield',
      lat: 40.7282,
      lng: -73.996
    },
    status: 'in-progress',
    votes: 23,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'night_walker',
    reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiTags: ['streetlight', 'darkness', 'safety'],
    comments: [
      {
        id: 'c2',
        text: 'This is dangerous for pedestrians!',
        author: 'safety_first',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'c3',
        text: 'I saw a crew looking at it yesterday.',
        author: 'local_resident',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '4',
    title: 'Drainage blockage causing flooding',
    description: 'Heavy rain is causing flooding because the storm drain is blocked with debris.',
    category: 'Drainage Blockage',
    location: {
      address: '789 Oak Ave, Springfield',
      lat: 40.7328,
      lng: -74.016
    },
    status: 'reported',
    votes: 19,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'concerned_neighbor',
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    aiTags: ['flooding', 'drain', 'water'],
  },
  {
    id: '5',
    title: 'Fallen tree blocking sidewalk',
    description: 'A large tree branch has fallen and is completely blocking the sidewalk.',
    category: 'Tree Hazard',
    location: {
      address: '101 Pine St, Springfield',
      lat: 40.7218,
      lng: -74.001
    },
    status: 'resolved',
    votes: 12,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'daily_jogger',
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiTags: ['tree', 'obstruction', 'sidewalk'],
    comments: [
      {
        id: 'c4',
        text: 'Thank you for the quick response in clearing this!',
        author: 'grateful_citizen',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  // Adding Indian civic issues with more realistic data
  {
    id: '6',
    title: 'Waterlogging in Mumbai Suburbs',
    description: 'Severe waterlogging after monsoon rain has blocked the entire road. Vehicles stuck and pedestrians unable to pass.',
    category: 'Drainage Blockage',
    location: {
      address: 'Andheri West, Mumbai, Maharashtra',
      lat: 19.1136,
      lng: 72.8697
    },
    status: 'in-progress',
    votes: 42,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'mumbai_resident',
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiTags: ['monsoon', 'flooding', 'infrastructure', 'drainage'],
    comments: [
      {
        id: 'c5',
        text: 'This happens every year! When will BMC improve the drainage system?',
        author: 'frustrated_commuter',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'c6',
        text: 'Municipal workers are pumping water now, should be clear by evening.',
        author: 'local_update',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '7',
    title: 'Garbage Mountain at Ghazipur Landfill',
    description: 'The landfill height has increased again and foul smell is affecting all nearby residential areas. Health hazard for thousands.',
    category: 'Garbage & Waste',
    location: {
      address: 'Ghazipur, East Delhi, Delhi',
      lat: 28.6354,
      lng: 77.3261
    },
    status: 'verified',
    votes: 78,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'delhi_activist',
    reportedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    aiTags: ['landfill', 'pollution', 'public health', 'waste management'],
    comments: [
      {
        id: 'c7',
        text: 'This is a serious environmental hazard that needs immediate attention!',
        author: 'environmental_scientist',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '8',
    title: 'Open Sewage Line in Chennai Neighborhood',
    description: 'Sewage line has been open for weeks now. Strong smell and mosquitoes becoming unbearable for residents.',
    category: 'Sewage Problem',
    location: {
      address: 'Velachery, Chennai, Tamil Nadu',
      lat: 12.9815,
      lng: 80.2180
    },
    status: 'reported',
    votes: 27,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'chennai_local',
    reportedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    aiTags: ['sewage', 'sanitation', 'public health', 'infrastructure'],
  },
  {
    id: '9',
    title: 'Stray Cattle on Pune Highway',
    description: 'Large number of stray cattle sitting in the middle of Pune-Mumbai highway causing traffic jams and accidents.',
    category: 'Animal Control',
    location: {
      address: 'Expressway, Pune, Maharashtra',
      lat: 18.5204,
      lng: 73.8567
    },
    status: 'in-progress',
    votes: 31,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'daily_commuter',
    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiTags: ['road safety', 'stray animals', 'traffic', 'transportation'],
  },
  {
    id: '10',
    title: 'Illegal Encroachment on Hyderabad Footpath',
    description: 'Shops have extended onto the footpath completely blocking pedestrian movement. Forcing people to walk on busy road.',
    category: 'Encroachment',
    location: {
      address: 'Ameerpet, Hyderabad, Telangana',
      lat: 17.4380,
      lng: 78.4480
    },
    status: 'verified',
    votes: 45,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'citizen_rights',
    reportedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    aiTags: ['pedestrian safety', 'urban planning', 'public space', 'law enforcement'],
    comments: [
      {
        id: 'c8',
        text: 'I was almost hit by a car yesterday because I had to walk on the road!',
        author: 'worried_pedestrian',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '11',
    title: 'Power Outages in Kolkata Neighborhood',
    description: 'Frequent power cuts lasting 4-5 hours daily for the past week. Work from home and online classes severely affected.',
    category: 'Electricity Issues',
    location: {
      address: 'Salt Lake, Kolkata, West Bengal',
      lat: 22.5726,
      lng: 88.4251
    },
    status: 'verified',
    votes: 56,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'work_from_home',
    reportedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    aiTags: ['electricity', 'infrastructure', 'utilities', 'public services'],
  },
  {
    id: '12',
    title: 'Contaminated Water Supply in Jaipur',
    description: 'Tap water has turned yellowish with foul smell. Multiple families reporting stomach illness in the neighborhood.',
    category: 'Water Pollution',
    location: {
      address: 'Malviya Nagar, Jaipur, Rajasthan',
      lat: 26.8612,
      lng: 75.8010
    },
    status: 'in-progress',
    votes: 67,
    images: ['/placeholder.svg'],
    videos: [],
    audio: [],
    reportedBy: 'concerned_parent',
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiTags: ['water quality', 'public health', 'sanitation', 'municipal services'],
    comments: [
      {
        id: 'c9',
        text: 'My child fell sick after drinking this water. This is unacceptable!',
        author: 'angry_mother',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'c10',
        text: 'Water testing team visited today and took samples.',
        author: 'neighborhood_watch',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  }
];
