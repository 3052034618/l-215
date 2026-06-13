import { AssetStatus, AssetCategory } from '@/types/asset';
import { BookingStatus } from '@/types/booking';

export const getStatusText = (status: AssetStatus): string => {
  const map: Record<AssetStatus, string> = {
    available: '可预约',
    borrowed: '已借出',
    maintenance: '维修中'
  };
  return map[status];
};

export const getStatusColor = (status: AssetStatus): string => {
  const map: Record<AssetStatus, string> = {
    available: '#00b42a',
    borrowed: '#ff7d00',
    maintenance: '#f53f3f'
  };
  return map[status];
};

export const getBookingStatusText = (status: BookingStatus): string => {
  const map: Record<BookingStatus, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    picked: '使用中',
    returned: '已归还',
    overdue: '已逾期',
    cancelled: '已取消'
  };
  return map[status];
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  const map: Record<BookingStatus, string> = {
    pending: '#ff7d00',
    approved: '#165dff',
    rejected: '#f53f3f',
    picked: '#00b42a',
    returned: '#86909c',
    overdue: '#f53f3f',
    cancelled: '#c9cdd4'
  };
  return map[status];
};

export const getCategoryName = (category: AssetCategory): string => {
  const map: Record<AssetCategory, string> = {
    meeting: '会议设备',
    photography: '拍摄器材',
    office: '办公物品'
  };
  return map[category];
};

export const getCategoryIcon = (category: AssetCategory): string => {
  const map: Record<AssetCategory, string> = {
    meeting: '📹',
    photography: '📷',
    office: '💻'
  };
  return map[category];
};

export const getLocationName = (locationKey: string): string => {
  const map: Record<string, string> = {
    floor3: 'A栋3楼办公区',
    floor5: 'A栋5楼会议区',
    floor8: 'B栋8楼研发区',
    floor10: 'B栋10楼多功能厅'
  };
  return map[locationKey] || locationKey;
};
