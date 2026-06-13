import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import Calendar from '@/components/Calendar';
import StatusBadge from '@/components/StatusBadge';
import { assets } from '@/data/assets';
import { bookings } from '@/data/bookings';
import { generateTimeSlots } from '@/data/assets';
import { formatDate, isSameDay } from '@/utils/date';
import { getBookingStatusText } from '@/utils/format';
import styles from './index.module.scss';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [purpose, setPurpose] = useState('');

  const dateStr = formatDate(selectedDate);

  const timeSlots = useMemo(() => {
    return generateTimeSlots(dateStr);
  }, [dateStr]);

  const dayBookings = useMemo(() => {
    return bookings.filter((b) => isSameDay(b.date, selectedDate));
  }, [selectedDate]);

  const bookingDates = useMemo(() => {
    return bookings.map((b) => b.date);
  }, []);

  const availableAssets = useMemo(() => {
    return assets.filter((a) => a.status === 'available' && a.availableStock > 0);
  }, []);

  useDidShow(() => {
    console.log('[Calendar] page show');
  });

  const handleSlotClick = (slotId: string, available: boolean) => {
    if (!available) return;
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };

  const handleBook = () => {
    if (!selectedSlot) {
      Taro.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!selectedAssetId) {
      Taro.showToast({ title: '请选择资产', icon: 'none' });
      return;
    }
    if (!purpose.trim()) {
      Taro.showToast({ title: '请填写用途', icon: 'none' });
      return;
    }

    const selectedAsset = assets.find((a) => a.id === selectedAssetId);
    if (selectedAsset?.isHighValue) {
      Taro.showToast({ title: '高价值设备需管理员审批', icon: 'none' });
    } else {
      Taro.showToast({ title: '预约提交成功', icon: 'success' });
    }

    setShowModal(false);
    setSelectedSlot(null);
    setSelectedAssetId('');
    setPurpose('');
  };

  const slot = timeSlots.find((s) => s.id === selectedSlot);

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择日期</Text>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          bookingDates={bookingDates}
        />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择时段</Text>
        <View className={styles.timeSlots}>
          {timeSlots.map((slot) => (
            <View
              key={slot.id}
              className={classnames(
                styles.timeSlot,
                selectedSlot === slot.id && styles.selected,
                !slot.available && styles.disabled
              )}
              onClick={() => handleSlotClick(slot.id, slot.available)}
            >
              <Text className={styles.timeText}>{slot.startTime}</Text>
              <Text className={classnames(styles.timeStatus, slot.available ? styles.available : styles.unavailable)}>
                {slot.available ? '可预约' : '已满'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bookingList}>
        <Text className={styles.listTitle}>当日预约 ({dayBookings.length})</Text>
        {dayBookings.length > 0 ? (
          dayBookings.map((booking) => (
            <View key={booking.id} className={styles.bookingItem}>
              <Image className={styles.bookingImage} src={booking.assetImage} mode="aspectFill" />
              <View className={styles.bookingInfo}>
                <Text className={styles.bookingName}>{booking.assetName}</Text>
                <Text className={styles.bookingTime}>
                  {booking.startTime} - {booking.endTime} · {booking.userName}
                </Text>
              </View>
              <StatusBadge status={booking.status} text={getBookingStatusText(booking.status)} />
            </View>
          ))
        ) : (
          <Text className={styles.emptyTip}>当日暂无预约</Text>
        )}
      </View>

      {selectedSlot && (
        <View className={styles.fab} onClick={handleBook}>
          <Text className={styles.fabIcon}>+</Text>
        </View>
      )}

      {showModal && (
        <View className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>提交预约</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>预约时段</Text>
              <View className={styles.formInput} style={{ display: 'flex', alignItems: 'center' }}>
                <Text>{dateStr} {slot?.startTime} - {slot?.endTime}</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>选择资产</Text>
              <ScrollView scrollY style={{ maxHeight: '400rpx' }}>
                {availableAssets.map((asset) => (
                  <View
                    key={asset.id}
                    className={classnames(styles.assetSelect, selectedAssetId === asset.id && styles.selected)}
                    onClick={() => setSelectedAssetId(asset.id)}
                  >
                    <Image className={styles.assetSelectImg} src={asset.image} mode="aspectFill" />
                    <View className={styles.assetSelectInfo}>
                      <Text className={styles.assetSelectName}>{asset.name}</Text>
                      <Text className={styles.assetSelectStock}>
                        可用 {asset.availableStock}/{asset.totalStock}
                        {asset.isHighValue && ' · 高价值需审批'}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>使用用途</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请描述使用用途..."
                value={purpose}
                onInput={(e) => setPurpose(e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                取消
              </Button>
              <Button className={styles.submitBtn} onClick={handleSubmit}>
                提交预约
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CalendarPage;
