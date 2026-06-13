import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { bookings } from '@/data/bookings';
import StatusBadge from '@/components/StatusBadge';
import { getBookingStatusText } from '@/utils/format';
import styles from './index.module.scss';

type TabType = 'pickup' | 'return';

const PickupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pickup');
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageDesc, setDamageDesc] = useState('');
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);

  useDidShow(() => {
    console.log('[Pickup] page show');
  });

  const toPickupList = useMemo(() => {
    return bookings.filter((b) => b.status === 'approved');
  }, []);

  const toReturnList = useMemo(() => {
    return bookings.filter((b) => b.status === 'picked' || b.status === 'overdue');
  }, []);

  const displayList = activeTab === 'pickup' ? toPickupList : toReturnList;

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[Pickup] scan result:', res.result);
        if (activeTab === 'pickup') {
          Taro.showToast({ title: '领取成功', icon: 'success' });
        } else {
          setShowDamageModal(true);
        }
      },
      fail: (err) => {
        console.error('[Pickup] scan failed:', err);
        Taro.showToast({ title: '扫码取消', icon: 'none' });
      }
    });
  };

  const handlePickup = () => {
    handleScan();
  };

  const handleReturn = () => {
    handleScan();
  };

  const handleAddPhoto = () => {
    Taro.chooseImage({
      count: 3 - damagePhotos.length,
      success: (res) => {
        setDamagePhotos([...damagePhotos, ...res.tempFilePaths]);
      }
    });
  };

  const handleSubmitDamage = () => {
    if (!damageDesc.trim()) {
      Taro.showToast({ title: '请填写损坏描述', icon: 'none' });
      return;
    }

    Taro.showToast({ title: '归还成功，损坏已记录', icon: 'success' });
    setShowDamageModal(false);
    setDamageDesc('');
    setDamagePhotos([]);
  };

  return (
    <View className={styles.page}>
      <View className={styles.scanSection}>
        <View className={styles.scanCard}>
          <Text className={styles.scanIcon}>📷</Text>
          <Text className={styles.scanTitle}>
            {activeTab === 'pickup' ? '扫码领取' : '扫码归还'}
          </Text>
          <Text className={styles.scanDesc}>
            {activeTab === 'pickup'
              ? '扫描资产二维码，快速领取设备'
              : '扫描资产二维码，归还设备并记录状态'}
          </Text>
          <Button className={styles.scanBtn} onClick={handleScan}>
            立即扫码
          </Button>
        </View>

        <View className={styles.actionTabs}>
          <View
            className={classnames(styles.actionTab, activeTab === 'pickup' && styles.active)}
            onClick={() => setActiveTab('pickup')}
          >
            <Text className={styles.actionTabIcon}>📦</Text>
            <Text className={styles.actionTabText}>待领取 ({toPickupList.length})</Text>
          </View>
          <View
            className={classnames(styles.actionTab, activeTab === 'return' && styles.active)}
            onClick={() => setActiveTab('return')}
          >
            <Text className={styles.actionTabIcon}>↩️</Text>
            <Text className={styles.actionTabText}>待归还 ({toReturnList.length})</Text>
          </View>
        </View>
      </View>

      <View className={styles.todoSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {activeTab === 'pickup' ? '待领取清单' : '待归还清单'}
          </Text>
          <Text className={styles.sectionCount}>共 {displayList.length} 项</Text>
        </View>

        {displayList.length > 0 ? (
          displayList.map((booking) => (
            <View key={booking.id} className={styles.todoItem}>
              <Image className={styles.todoImage} src={booking.assetImage} mode="aspectFill" />
              <View className={styles.todoInfo}>
                <Text className={styles.todoName}>{booking.assetName}</Text>
                <Text className={styles.todoTime}>
                  {booking.date} {booking.startTime} - {booking.endTime}
                </Text>
                <StatusBadge status={booking.status} text={getBookingStatusText(booking.status)} />
              </View>
              <Button
                className={styles.todoAction}
                onClick={() => activeTab === 'pickup' ? handlePickup() : handleReturn()}
              >
                {activeTab === 'pickup' ? '领取' : '归还'}
              </Button>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>
              {activeTab === 'pickup' ? '暂无待领取资产' : '暂无待归还资产'}
            </Text>
          </View>
        )}
      </View>

      {showDamageModal && (
        <View className={styles.damageModal} onClick={() => setShowDamageModal(false)}>
          <View className={styles.damageContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.damageTitle}>设备损坏上报</Text>

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
                    <Image className={styles.photoImage} src={photo} mode="aspectFill" />
                  </View>
                ))}
                {damagePhotos.length < 3 && (
                  <View
                    className={classnames(styles.photoItem, styles.photoAdd)}
                    onClick={handleAddPhoto}
                  >
                    <Text>+</Text>
                  </View>
                )}
              </View>
            </View>

            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={() => setShowDamageModal(false)}>
                取消
              </Button>
              <Button className={styles.submitBtn} onClick={handleSubmitDamage}>
                提交
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PickupPage;
