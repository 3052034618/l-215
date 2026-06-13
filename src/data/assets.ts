import { Asset, CategoryInfo, LocationInfo, TimeSlot } from '@/types/asset';

export const categories: CategoryInfo[] = [
  { key: 'meeting', name: '会议设备', icon: '📹' },
  { key: 'photography', name: '拍摄器材', icon: '📷' },
  { key: 'office', name: '办公物品', icon: '💻' }
];

export const locations: LocationInfo[] = [
  { key: 'floor3', name: '3楼办公区', building: 'A栋' },
  { key: 'floor5', name: '5楼会议区', building: 'A栋' },
  { key: 'floor8', name: '8楼研发区', building: 'B栋' },
  { key: 'floor10', name: '10楼多功能厅', building: 'B栋' }
];

export const assets: Asset[] = [
  {
    id: 'a001',
    name: '索尼投影仪 VPL-FHZ75',
    category: 'meeting',
    location: 'floor5',
    status: 'available',
    description: '高清激光投影仪，支持4K分辨率，适用于大型会议室',
    specs: ['分辨率: 1920x1200', '亮度: 6500流明', '对比度: 5000:1', '投影尺寸: 40-600英寸'],
    rules: ['使用前请提前15分钟到场调试', '使用完毕请关闭电源并整理线材', '请勿在设备上放置任何物品', '如遇故障请立即联系管理员'],
    image: 'https://picsum.photos/id/1/400/300',
    isHighValue: true,
    totalStock: 3,
    availableStock: 2,
    tags: ['高清', '激光']
  },
  {
    id: 'a002',
    name: '罗技视频会议摄像头',
    category: 'meeting',
    location: 'floor5',
    status: 'available',
    description: '4K高清视频会议摄像头，带自动对焦功能',
    specs: ['分辨率: 4K UHD', '视场角: 120°', '自动对焦', '内置麦克风'],
    rules: ['轻拿轻放，避免磕碰', '使用后请放回原位', '请勿随意调整角度'],
    image: 'https://picsum.photos/id/2/400/300',
    isHighValue: false,
    totalStock: 10,
    availableStock: 8,
    tags: ['4K', '视频会议']
  },
  {
    id: 'a003',
    name: '无线麦克风套装',
    category: 'meeting',
    location: 'floor5',
    status: 'borrowed',
    description: '一拖四无线麦克风，适用于大型会议和培训',
    specs: ['频率范围: UHF 600-900MHz', '传输距离: 50米', '电池续航: 8小时', '4个手持麦'],
    rules: ['使用前请检查电池电量', '麦克风请勿靠近音响设备', '使用后请及时充电'],
    image: 'https://picsum.photos/id/3/400/300',
    isHighValue: false,
    totalStock: 5,
    availableStock: 0,
    tags: ['无线', '一拖四']
  },
  {
    id: 'a004',
    name: '佳能 EOS R5 相机',
    category: 'photography',
    location: 'floor3',
    status: 'available',
    description: '全画幅专业微单相机，支持8K视频录制',
    specs: ['像素: 4500万', '视频: 8K 30fps', '连拍: 12张/秒', 'ISO范围: 100-51200'],
    rules: ['高价值设备需管理员审批', '镜头更换需在无尘环境', '请勿在雨天使用', '归还时需检查外观'],
    image: 'https://picsum.photos/id/8/400/300',
    isHighValue: true,
    totalStock: 2,
    availableStock: 2,
    tags: ['专业', '全画幅']
  },
  {
    id: 'a005',
    name: '大疆 Mavic 3 无人机',
    category: 'photography',
    location: 'floor10',
    status: 'maintenance',
    description: '专业航拍无人机，4/3 CMOS 哈苏相机',
    specs: ['相机: 4/3 CMOS 2000万', '续航: 46分钟', '图传: 15公里', '抗风: 6级'],
    rules: ['需持证飞行', '飞行前需报备行政部', '禁飞区严禁使用', '归还时需检查桨叶'],
    image: 'https://picsum.photos/id/9/400/300',
    isHighValue: true,
    totalStock: 1,
    availableStock: 0,
    tags: ['航拍', '专业']
  },
  {
    id: 'a006',
    name: '神牛摄影灯套装',
    category: 'photography',
    location: 'floor3',
    status: 'available',
    description: '三灯套装，含柔光箱和灯架',
    specs: ['功率: 600W', '色温: 5500K', '调光范围: 1/128-1/1', '含柔光箱和反光伞'],
    rules: ['灯泡属易碎品，轻拿轻放', '使用后请及时关闭电源', '灯架需固定稳固'],
    image: 'https://picsum.photos/id/6/400/300',
    isHighValue: false,
    totalStock: 4,
    availableStock: 3,
    tags: ['三灯套装', '柔光']
  },
  {
    id: 'a007',
    name: ' MacBook Pro 16寸',
    category: 'office',
    location: 'floor8',
    status: 'available',
    description: 'M2 Pro 芯片，16GB 内存，512GB 存储',
    specs: ['芯片: M2 Pro 12核', '内存: 16GB', '存储: 512GB SSD', '屏幕: 16寸 Liquid Retina'],
    rules: ['高价值设备需管理员审批', '仅限工作使用', '请勿安装未经授权软件', '遗失需照价赔偿'],
    image: 'https://picsum.photos/id/119/400/300',
    isHighValue: true,
    totalStock: 5,
    availableStock: 3,
    tags: ['M2', '高性能']
  },
  {
    id: 'a008',
    name: '便携投影仪',
    category: 'office',
    location: 'floor8',
    status: 'available',
    description: '极米便携投影仪，自带电池，适合小型会议',
    specs: ['亮度: 1080P', '电池续航: 3小时', '重量: 0.9kg', '支持自动对焦'],
    rules: ['使用时需注意通风', '请勿在高温环境下使用', '镜头请勿用手触摸'],
    image: 'https://picsum.photos/id/201/400/300',
    isHighValue: false,
    totalStock: 6,
    availableStock: 5,
    tags: ['便携', '电池款']
  },
  {
    id: 'a009',
    name: '移动白板',
    category: 'office',
    location: 'floor5',
    status: 'available',
    description: '双面移动白板，含支架和白板笔',
    specs: ['尺寸: 120x90cm', '双面可用', '带滚轮可移动', '含白板笔和板擦'],
    rules: ['请使用专用白板笔', '使用后请擦拭干净', '移动时注意安全'],
    image: 'https://picsum.photos/id/160/400/300',
    isHighValue: false,
    totalStock: 8,
    availableStock: 6,
    tags: ['移动', '双面']
  },
  {
    id: 'a010',
    name: '视频采集卡',
    category: 'meeting',
    location: 'floor3',
    status: 'available',
    description: '4K HDMI 视频采集卡，支持直播和录屏',
    specs: ['输入: HDMI 4K 60Hz', '输出: USB 3.0 1080P', '支持直播推流', '免驱动安装'],
    rules: ['插拔设备请先关闭相关软件', '请勿弯折接口', '保持接口清洁'],
    image: 'https://picsum.photos/id/119/400/300',
    isHighValue: false,
    totalStock: 4,
    availableStock: 4,
    tags: ['4K', '直播']
  },
  {
    id: 'a011',
    name: '三脚架套装',
    category: 'photography',
    location: 'floor3',
    status: 'available',
    description: '曼富图专业三脚架，含球形云台',
    specs: ['材质: 碳纤维', '承重: 12kg', '最高高度: 180cm', '折叠高度: 60cm'],
    rules: ['使用时请展开三支脚', '请勿超过承重上限', '使用后请擦拭干净'],
    image: 'https://picsum.photos/id/201/400/300',
    isHighValue: false,
    totalStock: 6,
    availableStock: 5,
    tags: ['碳纤维', '专业']
  },
  {
    id: 'a012',
    name: '翻页笔',
    category: 'office',
    location: 'floor5',
    status: 'available',
    description: '激光翻页笔，支持PPT演示',
    specs: ['无线距离: 30米', '激光颜色: 红光', '电池: 7号电池x2', '即插即用'],
    rules: ['请勿照射眼睛', '长期不用请取出电池', '使用后请放回收纳盒'],
    image: 'https://picsum.photos/id/3/400/300',
    isHighValue: false,
    totalStock: 15,
    availableStock: 12,
    tags: ['便携', '即插即用']
  }
];

export const generateTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour < 20; hour++) {
    const startHour = hour.toString().padStart(2, '0');
    const endHour = (hour + 1).toString().padStart(2, '0');
    const isAvailable = Math.random() > 0.3;
    slots.push({
      id: `${date}-${startHour}`,
      startTime: `${startHour}:00`,
      endTime: `${endHour}:00`,
      available: isAvailable
    });
  }
  return slots;
};
