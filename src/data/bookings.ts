import { Booking, BlacklistDate, MaintenanceRecord, AssetUsageStats } from '@/types/booking';

export const bookings: Booking[] = [
  {
    id: 'b001',
    assetId: 'a001',
    assetName: '索尼投影仪 VPL-FHZ75',
    assetImage: 'https://picsum.photos/id/1/400/300',
    userId: 'u001',
    userName: '张三',
    userDept: '市场部',
    date: '2026-06-15',
    startTime: '09:00',
    endTime: '12:00',
    purpose: '季度产品发布会使用',
    status: 'approved',
    isHighValue: true,
    createTime: '2026-06-10 14:30'
  },
  {
    id: 'b002',
    assetId: 'a004',
    assetName: '佳能 EOS R5 相机',
    assetImage: 'https://picsum.photos/id/8/400/300',
    userId: 'u001',
    userName: '张三',
    userDept: '市场部',
    date: '2026-06-14',
    startTime: '14:00',
    endTime: '17:00',
    purpose: '拍摄产品宣传照片',
    status: 'picked',
    isHighValue: true,
    createTime: '2026-06-12 09:00',
    pickedTime: '2026-06-14 13:50'
  },
  {
    id: 'b003',
    assetId: 'a008',
    assetName: '便携投影仪',
    assetImage: 'https://picsum.photos/id/201/400/300',
    userId: 'u001',
    userName: '张三',
    userDept: '市场部',
    date: '2026-06-12',
    startTime: '10:00',
    endTime: '11:00',
    purpose: '小组会议讨论方案',
    status: 'returned',
    isHighValue: false,
    createTime: '2026-06-11 16:00',
    pickedTime: '2026-06-12 09:55',
    returnedTime: '2026-06-12 11:05'
  },
  {
    id: 'b004',
    assetId: 'a002',
    assetName: '罗技视频会议摄像头',
    assetImage: 'https://picsum.photos/id/2/400/300',
    userId: 'u002',
    userName: '李四',
    userDept: '技术部',
    date: '2026-06-16',
    startTime: '09:00',
    endTime: '18:00',
    purpose: '远程技术培训使用',
    status: 'pending',
    isHighValue: false,
    createTime: '2026-06-13 10:00'
  },
  {
    id: 'b005',
    assetId: 'a006',
    assetName: '神牛摄影灯套装',
    assetImage: 'https://picsum.photos/id/6/400/300',
    userId: 'u001',
    userName: '张三',
    userDept: '市场部',
    date: '2026-06-10',
    startTime: '14:00',
    endTime: '16:00',
    purpose: '产品拍摄',
    status: 'overdue',
    isHighValue: false,
    createTime: '2026-06-09 15:30',
    pickedTime: '2026-06-10 13:50'
  },
  {
    id: 'b006',
    assetId: 'a012',
    assetName: '翻页笔',
    assetImage: 'https://picsum.photos/id/3/400/300',
    userId: 'u002',
    userName: '李四',
    userDept: '技术部',
    date: '2026-06-08',
    startTime: '09:00',
    endTime: '10:00',
    purpose: '晨会汇报',
    status: 'cancelled',
    isHighValue: false,
    createTime: '2026-06-07 14:00'
  }
];

export const blacklistDates: BlacklistDate[] = [
  {
    id: 'bl001',
    date: '2026-07-01',
    reason: '建党日，设备统一盘点',
    createTime: '2026-05-20 10:00'
  },
  {
    id: 'bl002',
    date: '2026-10-01',
    reason: '国庆节，库房关闭',
    createTime: '2026-05-20 10:00'
  }
];

export const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'm001',
    assetId: 'a005',
    assetName: '大疆 Mavic 3 无人机',
    startDate: '2026-06-10',
    endDate: '2026-06-20',
    reason: '桨叶更换与整机校准',
    status: 'ongoing'
  },
  {
    id: 'm002',
    assetId: 'a003',
    assetName: '无线麦克风套装',
    startDate: '2026-05-15',
    endDate: '2026-05-20',
    reason: '电池更换与信号测试',
    status: 'completed'
  }
];

export const usageStats: AssetUsageStats[] = [
  { assetId: 'a001', assetName: '索尼投影仪 VPL-FHZ75', totalHours: 128, bookingCount: 42, utilizationRate: 75 },
  { assetId: 'a004', assetName: '佳能 EOS R5 相机', totalHours: 96, bookingCount: 38, utilizationRate: 68 },
  { assetId: 'a008', assetName: '便携投影仪', totalHours: 84, bookingCount: 56, utilizationRate: 62 },
  { assetId: 'a002', assetName: '罗技视频会议摄像头', totalHours: 72, bookingCount: 48, utilizationRate: 55 },
  { assetId: 'a006', assetName: '神牛摄影灯套装', totalHours: 60, bookingCount: 25, utilizationRate: 48 },
  { assetId: 'a012', assetName: '翻页笔', totalHours: 45, bookingCount: 80, utilizationRate: 42 }
];
