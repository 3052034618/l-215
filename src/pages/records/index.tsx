import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import BookingCard from '@/components/BookingCard';
import { BookingStatus } from '@/types/booking';
import { useBookingStore } from '@/store';
import styles from './index.module.scss';

type TabType = 'all' | BookingStatus;

const tabList: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审批' },
  { key: 'approved', label: '待领取' },
  { key: 'picked', label: '使用中' },
  { key: 'returned', label: '已归还' },
  { key: 'cancelled', label: '已取消' }
];

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const { bookings, currentUserId, currentUserName, currentUserDept, cancelBooking } = useBookingStore();

  useDidShow(() => {
    setRefreshKey(prev => prev + 1);
  });

  const myBookings = useMemo(() => {
    return bookings.filter((b) => b.userId === currentUserId);
  }, [bookings, currentUserId, refreshKey]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return myBookings;
    return myBookings.filter((b) => b.status === activeTab);
  }, [activeTab, myBookings]);

  const stats = useMemo(() => {
    const pending = myBookings.filter((b) => b.status === 'pending').length;
    const approved = myBookings.filter((b) => b.status === 'approved').length;
    const picked = myBookings.filter((b) => b.status === 'picked').length;
    const returned = myBookings.filter((b) => b.status === 'returned').length;
    return { pending, approved, picked, returned };
  }, [myBookings]);

  const overdueBookings = useMemo(() => {
    return myBookings.filter((b) => b.status === 'overdue');
  }, [myBookings]);

  const handleCancel = (bookingId: string) => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          const success = cancelBooking(bookingId);
          if (success) {
            Taro.showToast({ title: '已取消预约', icon: 'success' });
            setRefreshKey(prev => prev + 1);
          } else {
            Taro.showToast({ title: '取消失败', icon: 'none' });
          }
        }
      }
    });
  };

  const handlePickup = () => {
    Taro.switchTab({ url: '/pages/pickup/index' });
  };

  const handleReturn = () => {
    Taro.switchTab({ url: '/pages/pickup/index' });
  };

  const handleBookingClick = (bookingId: string) => {
    Taro.navigateTo({
      url: `/pages/booking-detail/index?id=${bookingId}`
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileCard}>
        <View className={styles.avatar}>👤</View>
        <View className={styles.userInfo}>
          <Text className={styles.userName}>{currentUserName}</Text>
          <Text className={styles.userDept}>{currentUserDept}</Text>
        </View>
      </View>

      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.pending + stats.approved}</Text>
          <Text className={styles.statLabel}>待处理</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.picked}</Text>
          <Text className={styles.statLabel}>使用中</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.returned}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
      </View>

      {overdueBookings.length > 0 && (
        <View className={styles.reminderCard}>
          <Text className={styles.reminderIcon}>⚠️</Text>
          <Text className={styles.reminderText}>
            您有{overdueBookings.length}个预约已逾期，请尽快归还
          </Text>
        </View>
      )}

      <ScrollView scrollX className={styles.tabs}>
        {tabList.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tab, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </ScrollView>

      <View className={styles.bookingList}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <View key={booking.id} onClick={() => handleBookingClick(booking.id)}>
              <BookingCard
                booking={booking}
                onPickup={handlePickup}
                onReturn={handleReturn}
                onCancel={() => handleCancel(booking.id)}
              />
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无相关记录</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecordsPage;
