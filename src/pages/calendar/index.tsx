import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import Calendar from '@/components/Calendar';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, isSameDay } from '@/utils/date';
import { getBookingStatusText, getLocationName } from '@/utils/format';
import { useBookingStore } from '@/store';
import styles from './index.module.scss';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    assets,
    generateTimeSlots,
    getBookingsByDate,
    addBooking,
    isDateBlacklisted,
    isAssetAvailable,
    blacklistDates,
    maintenanceRecords
  } = useBookingStore();

  const dateStr = formatDate(selectedDate);
  const dateIsBlacklisted = useMemo(() => isDateBlacklisted(dateStr), [dateStr, isDateBlacklisted]);

  useDidShow(() => {
    setRefreshKey(prev => prev + 1);
  });

  const timeSlots = useMemo(() => {
    if (dateIsBlacklisted) {
      return generateTimeSlots(dateStr);
    }
    if (selectedAssetId) {
      return generateTimeSlots(dateStr, selectedAssetId);
    }
    return generateTimeSlots(dateStr);
  }, [dateStr, selectedAssetId, dateIsBlacklisted, generateTimeSlots, refreshKey]);

  const dayBookings = useMemo(() => {
    return getBookingsByDate(dateStr);
  }, [dateStr, getBookingsByDate, refreshKey]);

  const bookingDates = useMemo(() => {
    const bookingDatesSet = new Set(dayBookings.map(b => b.date));
    return Array.from(bookingDatesSet);
  }, [dayBookings]);

  const disabledDates = useMemo(() => {
    const dates: string[] = [];
    blacklistDates.forEach(bl => dates.push(bl.date));
    return dates;
  }, [blacklistDates]);

  const availableAssets = useMemo(() => {
    return assets.filter(a => {
      if (a.status === 'maintenance') return false;
      if (dateIsBlacklisted) return false;
      if (!selectedSlot) return true;
      const slot = timeSlots.find(s => s.id === selectedSlot);
      if (slot) {
        return isAssetAvailable(a.id, dateStr, slot.startTime, slot.endTime);
      }
      return true;
    });
  }, [assets, selectedSlot, timeSlots, dateStr, dateIsBlacklisted, isAssetAvailable]);

  const isAssetAvailableForSlot = (assetId: string) => {
    if (!selectedSlot) return true;
    const slot = timeSlots.find(s => s.id === selectedSlot);
    if (!slot) return false;
    if (dateIsBlacklisted) return false;
    return isAssetAvailable(assetId, dateStr, slot.startTime, slot.endTime);
  };

  const handleSlotClick = (slotId: string, available: boolean) => {
    if (!available) return;
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
    setSelectedAssetId('');
  };

  const handleBook = () => {
    if (dateIsBlacklisted) {
      Taro.showToast({ title: '该日期不可预约', icon: 'none' });
      return;
    }
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

    const slot = timeSlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    const asset = assets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    if (!isAssetAvailableForSlot(selectedAssetId)) {
      Taro.showToast({ title: '该时段资产已被预约', icon: 'none' });
      return;
    }

    try {
      const newBooking = addBooking({
        assetId: selectedAssetId,
        date: dateStr,
        startTime: slot.startTime,
        endTime: slot.endTime,
        purpose: purpose.trim()
      });

      if (asset.isHighValue) {
        Taro.showToast({ title: '已提交，等待管理员审批', icon: 'none' });
      } else {
        Taro.showToast({ title: '预约提交成功', icon: 'success' });
      }

      setShowModal(false);
      setSelectedSlot(null);
      setSelectedAssetId('');
      setPurpose('');
      setRefreshKey(prev => prev + 1);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '预约失败', icon: 'none' });
    }
  };

  const slot = timeSlots.find((s) => s.id === selectedSlot);

  return (
    <View className={styles.page}>
      {dateIsBlacklisted && (
        <View className={styles.blacklistBanner}>
          <Text className={styles.bannerIcon}>⚠️</Text>
          <Text className={styles.bannerText}>该日期为黑名单日期，不可预约</Text>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择日期</Text>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          bookingDates={bookingDates}
          disabledDates={disabledDates}
        />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择时段</Text>
        {dateIsBlacklisted ? (
          <View className={styles.disabledHint}>
            <Text className={styles.hintIcon}>🚫</Text>
            <Text className={styles.hintText}>该日期不可预约，请选择其他日期</Text>
          </View>
        ) : (
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
        )}
      </View>

      <View className={styles.bookingList}>
        <Text className={styles.listTitle}>当日预约 ({dayBookings.length})</Text>
        {dayBookings.length > 0 ? (
          dayBookings.map((booking) => (
            <View
              key={booking.id}
              className={styles.bookingItem}
              onClick={() => Taro.navigateTo({ url: `/pages/booking-detail/index?id=${booking.id}` })}
            >
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

      {selectedSlot && !dateIsBlacklisted && (
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
                {availableAssets.map((asset) => {
                  const available = isAssetAvailableForSlot(asset.id);
                  return (
                    <View
                      key={asset.id}
                      className={classnames(
                        styles.assetSelect,
                        selectedAssetId === asset.id && styles.selected,
                        !available && styles.assetSelectDisabled
                      )}
                      onClick={() => available && setSelectedAssetId(asset.id)}
                    >
                      <Image className={styles.assetSelectImg} src={asset.image} mode="aspectFill" />
                      <View className={styles.assetSelectInfo}>
                        <Text className={styles.assetSelectName}>{asset.name}</Text>
                        <Text className={styles.assetSelectMeta}>
                          📍 {getLocationName(asset.location)}
                        </Text>
                        <Text className={styles.assetSelectStock}>
                          {available ? '可预约' : '该时段已约满'}
                          {asset.isHighValue && ' · 高价值需审批'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
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
