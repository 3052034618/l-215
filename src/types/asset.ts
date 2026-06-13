export type AssetStatus = 'available' | 'borrowed' | 'maintenance';

export type AssetCategory = 'meeting' | 'photography' | 'office';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  location: string;
  status: AssetStatus;
  description: string;
  specs: string[];
  rules: string[];
  image: string;
  isHighValue: boolean;
  totalStock: number;
  availableStock: number;
  tags: string[];
}

export interface CategoryInfo {
  key: AssetCategory;
  name: string;
  icon: string;
}

export interface LocationInfo {
  key: string;
  name: string;
  building: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}
