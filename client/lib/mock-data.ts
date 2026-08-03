import { Item, Match, Notification, Statistics } from '@/types'

export const mockItems: Item[] = [
  {
    id: '1',
    title: 'Apple AirPods Pro',
    description: 'Black AirPods Pro with charging case in excellent condition',
    category: 'electronics',
    status: 'found',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    reportedDate: '2024-06-20',
    foundDate: '2024-06-20',
    location: 'Library - 3rd Floor',
    userId: 'admin-1',
    contactEmail: 'admin@portal.com',
    type: 'found' as const,
  },
  {
    id: '2',
    title: 'Passport (Red)',
    description: 'Bangladesh passport, name starts with A, last 4 digits: 2847',
    category: 'documents',
    status: 'lost',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3af5d5d5?w=400&h=300&fit=crop',
    reportedDate: '2024-06-18',
    location: 'Campus Area',
    userId: 'student-1',
    contactEmail: 'student@portal.com',
    type: 'lost' as const,
  },
  {
    id: '3',
    title: 'Samsung Galaxy Watch 5',
    description: 'Silver Galaxy Watch 5, slight scratch on screen',
    category: 'electronics',
    status: 'found',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    reportedDate: '2024-06-19',
    foundDate: '2024-06-19',
    location: 'Cafeteria',
    userId: 'admin-1',
    contactEmail: 'admin@portal.com',
    type: 'found' as const,
  },
  {
    id: '4',
    title: 'Blue Laptop Backpack',
    description: 'Navy blue laptop backpack with side pockets',
    category: 'bags',
    status: 'lost',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    reportedDate: '2024-06-17',
    location: 'Main Gate',
    userId: 'student-2',
    contactEmail: 'student2@portal.com',
    type: 'lost' as const,
  },
  {
    id: '5',
    title: 'Student ID Card',
    description: 'Student ID, blue card with hologram',
    category: 'documents',
    status: 'found',
    imageUrl: 'https://images.unsplash.com/photo-1578562694033-f4e30b4ee7d6?w=400&h=300&fit=crop',
    reportedDate: '2024-06-21',
    foundDate: '2024-06-21',
    location: 'Computer Lab',
    userId: 'admin-2',
    contactEmail: 'admin2@portal.com',
    type: 'found' as const,
  },
  {
    id: '6',
    title: 'Sony WH-1000XM5 Headphones',
    description: 'Black noise-canceling headphones, original box included',
    category: 'electronics',
    status: 'found',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    reportedDate: '2024-06-22',
    foundDate: '2024-06-22',
    location: 'Auditorium',
    userId: 'admin-1',
    contactEmail: 'admin@portal.com',
    type: 'found' as const,
  },
]

export const mockMatches: Match[] = [
  {
    id: 'm1',
    lostItemId: '2',
    foundItemId: '5',
    similarityScore: 0.85,
    status: 'pending',
    createdAt: '2024-06-21',
  },
  {
    id: 'm2',
    lostItemId: '4',
    foundItemId: '1',
    similarityScore: 0.72,
    status: 'dismissed',
    createdAt: '2024-06-20',
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'student-1',
    title: 'Match Found!',
    message: 'We found a potential match for your lost passport',
    type: 'match',
    read: false,
    createdAt: '2024-06-21T10:30:00',
    relatedItemId: '2',
  },
  {
    id: 'n2',
    userId: 'student-2',
    title: 'Item Status Updated',
    message: 'Your lost backpack status has been updated to "In Review"',
    type: 'update',
    read: false,
    createdAt: '2024-06-20T14:15:00',
    relatedItemId: '4',
  },
  {
    id: 'n3',
    userId: 'admin-1',
    title: 'New Item Reported',
    message: 'A new lost item has been reported in the system',
    type: 'system',
    read: true,
    createdAt: '2024-06-19T09:00:00',
  },
]

export const mockStatistics: Statistics = {
  totalLostItems: 47,
  totalFoundItems: 63,
  totalMatches: 28,
  itemsRecovered: 24,
  registeredUsers: 156,
}

export const mockFeatures = [
  {
    title: 'AI Image Matching',
    description: 'Advanced AI analyzes item images to find matches automatically',
    icon: 'Zap',
  },
  {
    title: 'Email Notifications',
    description: 'Get instant notifications when potential matches are found',
    icon: 'Bell',
  },
  {
    title: 'Fast Search',
    description: 'Powerful search with filters to quickly find your lost items',
    icon: 'Search',
  },
  {
    title: 'Secure Claim Process',
    description: 'Verify ownership and claim your found items safely',
    icon: 'Shield',
  },
  {
    title: 'Admin Verification',
    description: 'Campus admins verify and facilitate secure handover',
    icon: 'CheckCircle',
  },
  {
    title: 'Real-time Tracking',
    description: 'Track your item status from lost to recovered',
    icon: 'BarChart',
  },
]

export const mockHowItWorks = [
  {
    step: 1,
    title: 'Report Lost Item',
    description: 'Upload details and photos of your lost item',
  },
  {
    step: 2,
    title: 'Admin Reviews Found',
    description: 'Admins upload found items to the system',
  },
  {
    step: 3,
    title: 'AI Matches Items',
    description: 'Our AI analyzes and creates potential matches',
  },
  {
    step: 4,
    title: 'Get Notifications',
    description: 'Receive instant alerts when matches are found',
  },
  {
    step: 5,
    title: 'Claim Your Item',
    description: 'Verify and claim ownership of your found item',
  },
  {
    step: 6,
    title: 'Secure Handover',
    description: 'Admin facilitates safe item recovery',
  },
]
