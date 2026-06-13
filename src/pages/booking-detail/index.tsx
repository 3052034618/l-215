import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { bookings } from '@/data/bookings';
import StatusBadge from '@/components/StatusBadge';
import { getBookingStatusText, getLocationName } from '@/utils/format';
import { Booking } from '@/types/booking';
import styles from './index.module.scss';

const BookingDetailPage: React.FC = () => {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const id = router.params.id;
    const found = bookings.find((b) => b.id === id);
    if (found) {
      setBooking(found);
    }
  }, [router.params.id]);

  useDidShow(() => {
    console.log('[BookingDetail] page show, bookingId:', router.params.id);
  });

  const handlePickup = () => {
    Taro.scanCode({
      success: () => {
        Taro.showToast({ title: '领取成功', icon: 'success' });
      },
      fail: () => {
        Taro.showToast({ title: '扫码取消', icon: 'none' });
      }
    });
  };

  const handleReturn = () => {
    Taro.scanCode({
      success: () => {
        Taro.showModal({
          title: '设备状态',
          content: '设备是否完好？如有损坏请上报',
          confirmText: '完好',
          cancelText: '有损坏',
          success: (res) => {
            if (res.confirm) {
              Taro.showToast({ title: '归还成功', icon: 'success' });
            } else {
              Taro.showToast({ title: '请填写损坏报告', icon: 'none' });
            }
          }
        });
      },
      fail: () => {
        Taro.showToast({ title: '扫码取消', icon: 'none' });
      }
    });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消预约', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1000);
        }
      }
    });
  };

  const handleModify = () => {
    Taro.showToast({ title: '修改预约功能开发中', icon: 'none' });
  };

  if (!booking) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '200rpx 0', textAlign: 'center', color: '#86909c' }}>
          加载中...
        </View>
      </View>
    );
  }

  const statusColorMap: Record<string, string> = {
    pending: 'linear-gradient(135deg, #ff7d00 0%, #ff9a33 100%)',
    approved: 'linear-gradient(135deg, #165dff 0%, #4080ff 100%)',
    rejected: 'linear-gradient(135deg, #f53f3f 0%, #ff6b6b 100%)',
    picked: 'linear-gradient(135deg, #00b42a 0%, #33c755 100%)',
    returned: 'linear-gradient(135deg, #86909c 0%, #a0a8b3 100%)',
    overdue: 'linear-gradient(135deg, #f53f3f 0%, #ff6b6b 100%)',
    cancelled: 'linear-gradient(135deg, #c9cdd4 0%, #dcdfe3 100%)'
  };

  const timeLineData = [
    { status: 'done', time: booking.createTime, title: '提交预约', desc: `用途：${booking.purpose}` },
    { status: booking.status !== 'pending' ? 'done' : 'current', time: booking.status !== 'pending' ? booking.createTime : '', title: booking.status === 'rejected' ? '审批拒绝' : '审批通过', desc: booking.rejectReason || (booking.isHighValue ? '管理员审批' : '系统自动审批') },
    { status: ['picked', 'returned'].includes(booking.status) ? 'done' : '', time: booking.pickedTime || '', title: '领取设备', desc: booking.pickedTime ? '已领取' : '待领取' },
    { status: booking.status === 'returned' ? 'done' : '', time: booking.returnedTime || '', title: '归还设备', desc: booking.returnedTime ? '已归还' : '待归还' }
  ].filter((item) => item.status);

  const renderActions = () => {
    const actions = [];

    if (booking.status === 'pending' || booking.status === 'approved') {
      actions.push(
        <Button key="cancel" className={styles.secondaryBtn} onClick={handleCancel}>
          取消预约
        </Button>
      );
      actions.push(
        <Button key="modify" className={styles.secondaryBtn} onClick={handleModify}>
          修改预约
        </Button>
      );
    }

    if (booking.status === 'approved') {
      actions.push(
        <Button key="pickup" className={styles.primaryBtn} onClick={handlePickup}>
          扫码领取
        </Button>
      );
    }

    if (booking.status === 'picked' || booking.status === 'overdue') {
      actions.push(
        <Button key="return" className={styles.primaryBtn} onClick={handleReturn}>
          扫码归还
        </Button>
      );
    }

    return actions.length > 0 ? (
      <View className={styles.bottomBar}>
        {actions}
      </View>
    ) : null;
  };

  return (
    <View className={styles.page}>
      <View
        className={styles.statusHeader}
        style={{ background: statusColorMap[booking.status] }}
      >
        <Text className={styles.statusText}>{getBookingStatusText(booking.status)}</Text>
        <Text className={styles.statusDesc}>
          预约单号：{booking.id.toUpperCase()}
        </Text>
      </View>

      <View className={styles.assetCard}>
        <Image className={styles.assetImage} src={booking.assetImage} mode="aspectFill" />
        <View className={styles.assetInfo}>
          <Text className={styles.assetName}>{booking.assetName}</Text>
          <Text className={styles.assetDesc}>
            {booking.date} {booking.startTime} - {booking.endTime}
          </Text>
        </View>
        <StatusBadge status={booking.status} text={getBookingStatusText(booking.status)} />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>预约信息</Text>
        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>预约日期</Text>
            <Text className={styles.infoValue}>{booking.date}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>使用时段</Text>
            <Text className={styles.infoValue}>{booking.startTime} - {booking.endTime}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>申请人</Text>
            <Text className={styles.infoValue}>{booking.userName} · {booking.userDept}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>资产类型</Text>
            <Text className={styles.infoValue}>
              {booking.isHighValue ? '高价值资产' : '普通资产'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>使用用途</Text>
        <View className={styles.purposeContent}>{booking.purpose}</View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>进度追踪</Text>
        <View className={styles.timeLine}>
          {timeLineData.map((item, index) => (
            <View key={index} className={`${styles.timeLineItem} ${styles[item.status]}`}>
              <Text className={styles.timeLineTime}>{item.time}</Text>
              <Text className={styles.timeLineTitle}>{item.title}</Text>
              <Text className={styles.timeLineDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {booking.damagePhotos && booking.damagePhotos.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>损坏照片</Text>
          <View className={styles.damagePhotos}>
            {booking.damagePhotos.map((photo, index) => (
              <Image key={index} className={styles.damagePhoto} src={photo} mode="aspectFill" />
            ))}
          </View>
          {booking.damageDesc && (
            <Text style={{ marginTop: '24rpx', fontSize: '28rpx', color: '#4e5969' }}>
              {booking.damageDesc}
            </Text>
          )}
        </View>
      )}

      {renderActions()}
    </View>
  );
};

export default BookingDetailPage;
