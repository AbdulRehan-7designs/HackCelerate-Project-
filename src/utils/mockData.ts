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
  status: 'new' | 'verified' | 'in-progress' | 'resolved' | 'fake';
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
    status: 'new',
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
    status: 'new',
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
  }
];
