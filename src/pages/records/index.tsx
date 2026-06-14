import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Picker, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import BookingCard from '@/components/BookingCard';
import { BookingStatus, Booking } from '@/types/booking';
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editPurpose, setEditPurpose] = useState('');

  const { bookings, currentUserId, currentUserName, currentUserDept, cancelBooking, updateBooking, generateTimeSlots } = useBookingStore();

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

  const timeSlotOptions = useMemo(() => {
    const slots: string[] = [];
    for (let h = 8; h < 20; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }
    slots.push('20:00');
    return slots;
  }, []);

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
            if (editingId === bookingId) {
              setEditingId(null);
            }
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
    if (editingId) {
      setEditingId(null);
      return;
    }
    Taro.navigateTo({
      url: `/pages/booking-detail/index?id=${bookingId}`
    });
  };

  const handleStartEdit = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    setEditingId(booking.id);
    setEditDate(booking.date);
    setEditStartTime(booking.startTime);
    setEditEndTime(booking.endTime);
    setEditPurpose(booking.purpose);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    if (!editPurpose.trim()) {
      Taro.showToast({ title: '请填写用途', icon: 'none' });
      return;
    }

    const startH = parseInt(editStartTime);
    const endH = parseInt(editEndTime);
    if (endH <= startH) {
      Taro.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
      return;
    }

    const success = updateBooking(editingId, {
      date: editDate,
      startTime: editStartTime,
      endTime: editEndTime,
      purpose: editPurpose.trim()
    });

    if (success) {
      Taro.showToast({ title: '保存成功', icon: 'success' });
      setEditingId(null);
      setRefreshKey(prev => prev + 1);
    } else {
      Taro.showToast({ title: '该时段已被占用，请换个时间', icon: 'none' });
    }
  };

  const canEdit = (booking: Booking) => {
    return booking.status === 'pending' || booking.status === 'approved';
  };

  const renderEditForm = (booking: Booking) => {
    if (editingId !== booking.id) return null;

    return (
      <View className={styles.editForm} onClick={(e) => e.stopPropagation()}>
        <View className={styles.editTitle}>
          <Text className={styles.editTitleText}>修改预约</Text>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>预约日期</Text>
          <Picker mode="date" value={editDate} onChange={(e) => setEditDate(e.detail.value)}>
            <View className={styles.formInput}>
              <Text>{editDate}</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formRow}>
          <View className={styles.formGroupHalf}>
            <Text className={styles.formLabel}>开始时间</Text>
            <Picker
              mode="selector"
              range={timeSlotOptions.slice(0, -1)}
              value={timeSlotOptions.indexOf(editStartTime)}
              onChange={(e) => setEditStartTime(timeSlotOptions[e.detail.value])}
            >
              <View className={styles.formInput}>
                <Text>{editStartTime}</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.formGroupHalf}>
            <Text className={styles.formLabel}>结束时间</Text>
            <Picker
              mode="selector"
              range={timeSlotOptions.slice(1)}
              value={timeSlotOptions.slice(1).indexOf(editEndTime)}
              onChange={(e) => setEditEndTime(timeSlotOptions.slice(1)[e.detail.value])}
            >
              <View className={styles.formInput}>
                <Text>{editEndTime}</Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>使用用途</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入使用用途..."
            value={editPurpose}
            onInput={(e) => setEditPurpose(e.detail.value)}
            maxlength={200}
          />
        </View>

        <View className={styles.editActions}>
          <Button className={styles.cancelBtn} onClick={handleCancelEdit}>
            取消
          </Button>
          <Button className={styles.saveBtn} onClick={handleSaveEdit}>
            保存
          </Button>
        </View>
      </View>
    );
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
            <View key={booking.id}>
              <View onClick={() => handleBookingClick(booking.id)}>
                <BookingCard
                  booking={booking}
                  showActions={editingId !== booking.id}
                  onPickup={handlePickup}
                  onReturn={handleReturn}
                  onCancel={() => handleCancel(booking.id)}
                />
              </View>
              {canEdit(booking) && editingId !== booking.id && (
                <View className={styles.inlineActions}>
                  <Button
                    className={classnames(styles.inlineActionBtn, styles.editBtn)}
                    onClick={(e) => handleStartEdit(e, booking)}
                  >
                    ✏️ 修改预约
                  </Button>
                </View>
              )}
              {renderEditForm(booking)}
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
