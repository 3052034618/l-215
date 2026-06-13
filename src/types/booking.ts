export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'picked' | 'returned' | 'overdue' | 'cancelled';

export interface Booking {
  id: string;
  assetId: string;
  assetName: string;
  assetImage: string;
  userId: string;
  userName: string;
  userDept: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  isHighValue: boolean;
  createTime: string;
  pickedTime?: string;
  returnedTime?: string;
  damagePhotos?: string[];
  damageDesc?: string;
  rejectReason?: string;
}

export interface BlacklistDate {
  id: string;
  date: string;
  reason: string;
  createTime: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'ongoing' | 'completed';
}

export interface AssetUsageStats {
  assetId: string;
  assetName: string;
  totalHours: number;
  bookingCount: number;
  utilizationRate: number;
}
