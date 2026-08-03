export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'lost' | 'found' | 'claimed' | string;
  imageUrl?: string;
  reportedDate: string;
  foundDate?: string;
  location: string;
  userId: string;
  contactEmail: string;
  type: 'lost' | 'found';
}

export interface Match {
  id: string;
  lostItemId: string;
  foundItemId: string;
  similarityScore: number;
  status: 'pending' | 'accepted' | 'dismissed';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  relatedItemId?: string;
}

export interface Statistics {
  totalLostItems: number;
  totalFoundItems: number;
  totalMatches: number;
  itemsRecovered: number;
  registeredUsers: number;
}
