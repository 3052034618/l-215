import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Textarea, ScrollView, Picker } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { getBookingStatusText, getLocationName } from '@/utils/format';
import { formatDate } from '@/utils/date';
import { useBookingStore } from '@/store';
import styles from './index.module.scss';

const BookingDetailPage: React.FC = () => {
  const router = useRouter();
  const bookingId = router.params.id as string;

  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyDate, setModifyDate] = useState('');
  const [modifyStartTime, setModifyStartTime] = useState('');
  const [modifyEndTime, setModifyEndTime] = useState('');
  const [modifyPurpose, setModifyPurpose] = useState('');
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageDesc, setDamageDesc] = useState('');
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);

  const { bookings, pickupBooking, returnBooking, cancelBooking, updateBooking, generateTimeSlots, isDateBlacklisted, isAssetAvailable } = useBookingStore();

  const booking = useMemo(() => {
    return bookings.find(b => b.id === bookingId) || null;
  }, [bookings, bookingId]);

  const modifyTimeSlots = useMemo(() => {
    if (!modifyDate || !booking) return [];
    return generateTimeSlots(modifyDate, booking.assetId, bookingId);
  }, [modifyDate, booking, generateTimeSlots, bookingId]);

  useDidShow(() => {
    console.log('[BookingDetail] page show, bookingId:', bookingId);
  });

  const handlePickup = () => {
    Taro.scanCode({
      success: () => {
        const success = pickupBooking(bookingId);
        if (success) {
          Taro.showToast({ title: '领取成功', icon: 'success' });
        } else {
          Taro.showToast({ title: '领取失败', icon: 'none' });
        }
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
          content: '设备是否完好？',
          confirmText: '完好',
          cancelText: '有损坏',
          success: (res) => {
            if (res.confirm) {
              const success = returnBooking(bookingId);
              if (success) {
                Taro.showToast({ title: '归还成功', icon: 'success' });
              } else {
                Taro.showToast({ title: '归还失败', icon: 'none' });
              }
            } else {
              setShowDamageModal(true);
            }
          }
        });
      },
      fail: () => {
        Taro.showToast({ title: '扫码取消', icon: 'none' });
      }
    });
  };

  const handleDamageSubmit = () => {
    if (!damageDesc.trim()) {
      Taro.showToast({ title: '请填写损坏描述', icon: 'none' });
      return;
    }

    const success = returnBooking(bookingId, damageDesc.trim(), damagePhotos);
    if (success) {
      Taro.showToast({ title: '归还成功，损坏已记录', icon: 'success' });
      setShowDamageModal(false);
      setDamageDesc('');
      setDamagePhotos([]);
    } else {
      Taro.showToast({ title: '归还失败', icon: 'none' });
    }
  };

  const handleUploadPhoto = () => {
    Taro.chooseImage({
      count: 3 - damagePhotos.length,
      success: (res) => {
        setDamagePhotos([...damagePhotos, ...res.tempFilePaths]);
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    setDamagePhotos(damagePhotos.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    if (!booking) return;

    Taro.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          const success = cancelBooking(bookingId);
          if (success) {
            Taro.showToast({ title: '已取消预约', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1000);
          } else {
            Taro.showToast({ title: '取消失败', icon: 'none' });
          }
        }
      }
    });
  };

  const openModifyModal = () => {
    if (!booking) return;
    setModifyDate(booking.date);
    setModifyStartTime(booking.startTime);
    setModifyEndTime(booking.endTime);
    setModifyPurpose(booking.purpose);
    setShowModifyModal(true);
  };

  const handleDateChange = (e: any) => {
    setModifyDate(e.detail.value);
    setModifyStartTime('');
    setModifyEndTime('');
  };

  const handleTimeSlotSelect = (slot: any) => {
    if (!slot.available) return;
    setModifyStartTime(slot.startTime);
    setModifyEndTime(slot.endTime);
  };

  const handleModifySubmit = () => {
    if (!booking) return;

    if (!modifyDate || !modifyStartTime || !modifyEndTime) {
      Taro.showToast({ title: '请选择日期和时段', icon: 'none' });
      return;
    }

    if (!modifyPurpose.trim()) {
      Taro.showToast({ title: '请填写用途', icon: 'none' });
      return;
    }

    if (isDateBlacklisted(modifyDate)) {
      Taro.showToast({ title: '该日期为黑名单日期，不可预约', icon: 'none' });
      return;
    }

    const dateChanged = modifyDate !== booking.date || modifyStartTime !== booking.startTime || modifyEndTime !== booking.endTime;
    if (dateChanged) {
      const available = isAssetAvailable(booking.assetId, modifyDate, modifyStartTime, modifyEndTime, bookingId);
      if (!available) {
        Taro.showToast({ title: '该时段资产已被预约', icon: 'none' });
        return;
      }
    }

    const success = updateBooking(bookingId, {
      date: modifyDate,
      startTime: modifyStartTime,
      endTime: modifyEndTime,
      purpose: modifyPurpose.trim()
    });

    if (success) {
      Taro.showToast({ title: '修改成功', icon: 'success' });
      setShowModifyModal(false);
    } else {
      Taro.showToast({ title: '修改失败', icon: 'none' });
    }
  };

  if (!booking) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '200rpx 0', textAlign: 'center', color: '#86909c' }}>
          预约不存在
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
        <Button key="modify" className={styles.secondaryBtn} onClick={openModifyModal}>
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
          <Text className={styles.sectionTitle}>损坏记录</Text>
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

      {showModifyModal && (
        <View className={styles.modalOverlay} onClick={() => setShowModifyModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>修改预约</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>预约日期</Text>
              <Picker mode="date" value={modifyDate} onChange={handleDateChange}>
                <View className={styles.formInput}>
                  <Text>{modifyDate || '请选择日期'}</Text>
                </View>
              </Picker>
            </View>

            {modifyDate && (
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>选择时段</Text>
                {isDateBlacklisted(modifyDate) ? (
                  <View className={styles.disabledHint}>
                    <Text className={styles.hintText}>该日期为黑名单日期，不可预约</Text>
                  </View>
                ) : (
                  <ScrollView scrollY style={{ maxHeight: '300rpx' }}>
                    <View className={styles.timeSlotGrid}>
                      {modifyTimeSlots.map((slot) => (
                        <View
                          key={slot.id}
                          className={classnames(
                            styles.timeSlotItem,
                            modifyStartTime === slot.startTime && styles.selected,
                            !slot.available && styles.disabled
                          )}
                          onClick={() => handleTimeSlotSelect(slot)}
                        >
                          <Text>{slot.startTime}</Text>
                          <Text className={styles.slotStatus}>
                            {slot.available ? '可约' : '已满'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            )}

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>使用用途</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请描述使用用途..."
                value={modifyPurpose}
                onInput={(e) => setModifyPurpose(e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={() => setShowModifyModal(false)}>
                取消
              </Button>
              <Button className={styles.submitBtn} onClick={handleModifySubmit}>
                保存修改
              </Button>
            </View>
          </View>
        </View>
      )}

      {showDamageModal && (
        <View className={styles.modalOverlay} onClick={() => setShowDamageModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>损坏上报</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>损坏描述</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请描述设备损坏情况..."
                value={damageDesc}
                onInput={(e) => setDamageDesc(e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>上传照片（最多3张）</Text>
              <View className={styles.photoUpload}>
                {damagePhotos.map((photo, index) => (
                  <View key={index} className={styles.photoItem}>
                    <Image className={styles.photoPreview} src={photo} mode="aspectFill" />
                    <View className={styles.photoRemove} onClick={() => handleRemovePhoto(index)}>
                      <Text className={styles.removeIcon}>×</Text>
                    </View>
                  </View>
                ))}
                {damagePhotos.length < 3 && (
                  <View className={styles.photoAdd} onClick={handleUploadPhoto}>
                    <Text className={styles.addIcon}>+</Text>
                    <Text className={styles.addText}>上传照片</Text>
                  </View>
                )}
              </View>
            </View>

            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={() => setShowDamageModal(false)}>
                取消
              </Button>
              <Button className={styles.submitBtn} onClick={handleDamageSubmit}>
                提交
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BookingDetailPage;
