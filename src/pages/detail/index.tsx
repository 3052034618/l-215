import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { assets } from '@/data/assets';
import { getStatusText, getLocationName, getCategoryName } from '@/utils/format';
import { formatDate } from '@/utils/date';
import StatusBadge from '@/components/StatusBadge';
import { Asset } from '@/types/asset';
import { useBookingStore } from '@/store';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const date = router.params.date || formatDate(new Date());
  const startTime = router.params.startTime || '08:00';
  const endTime = router.params.endTime || '20:00';

  const { isAssetAvailable, getAvailableStock, isDateBlacklisted, isAssetUnderMaintenance } = useBookingStore();

  useEffect(() => {
    const id = router.params.id;
    const found = assets.find((a) => a.id === id);
    if (found) {
      setAsset(found);
      Taro.setNavigationBarTitle({ title: found.name });
    }
  }, [router.params.id]);

  useDidShow(() => {
    setRefreshKey(prev => prev + 1);
  });

  const { availableNow, availableStock, statusText, statusType, isBlacklisted, isMaintenance } = useMemo(() => {
    if (!asset) {
      return {
        availableNow: false,
        availableStock: 0,
        statusText: '加载中',
        statusType: 'maintenance' as const,
        isBlacklisted: false,
        isMaintenance: false
      };
    }

    const blacklisted = isDateBlacklisted(date);
    const maintenance = isAssetUnderMaintenance(asset.id, date);
    const available = isAssetAvailable(asset.id, date, startTime, endTime);
    const stock = getAvailableStock(asset.id, date, startTime, endTime);

    let status: 'available' | 'maintenance' | 'unavailable' | 'pending' = 'available';
    let text = '可预约';

    if (blacklisted) {
      status = 'unavailable';
      text = '黑名单日期';
    } else if (maintenance) {
      status = 'maintenance';
      text = '维修中';
    } else if (stock > 0 && available) {
      status = 'available';
      text = '可预约';
    } else if (stock === 0) {
      status = 'unavailable';
      text = '已约满';
    } else {
      status = 'unavailable';
      text = '不可预约';
    }

    return {
      availableNow: available && stock > 0,
      availableStock: stock,
      statusText: text,
      statusType: status,
      isBlacklisted: blacklisted,
      isMaintenance: maintenance
    };
  }, [asset, date, startTime, endTime, refreshKey, isAssetAvailable, getAvailableStock, isDateBlacklisted, isAssetUnderMaintenance]);

  const handleBook = () => {
    Taro.switchTab({ url: '/pages/calendar/index' });
  };

  const handlePickup = () => {
    Taro.switchTab({ url: '/pages/pickup/index' });
  };

  if (!asset) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '200rpx 0', textAlign: 'center', color: '#86909c' }}>
          加载中...
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <Image className={styles.headerImage} src={asset.image} mode="aspectFill" />

      <View className={styles.content}>
        <View className={styles.titleSection}>
          <Text className={styles.title}>{asset.name}</Text>
          <View className={styles.meta}>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📍</Text>
              <Text>{getLocationName(asset.location)}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📦</Text>
              <Text>{getCategoryName(asset.category)}</Text>
            </View>
            <StatusBadge status={statusType} text={statusText} />
          </View>
          <View className={styles.tags}>
            {asset.tags.map((tag, index) => (
              <Text key={index} className={styles.tag}>{tag}</Text>
            ))}
            {asset.isHighValue && <Text className={styles.highValueTag}>高价值资产</Text>}
          </View>

          {(isBlacklisted || isMaintenance) && (
            <View className={styles.warningBanner}>
              <Text className={styles.warningIcon}>⚠️</Text>
              <Text className={styles.warningText}>
                {isBlacklisted ? `${date} 为黑名单日期，暂不可预约` : `${date} 该设备正在维修中`}
              </Text>
            </View>
          )}

          {!isBlacklisted && !isMaintenance && (
            <View className={styles.dateInfo}>
              <Text className={styles.dateText}>
                查询时段：{date} {startTime}-{endTime}
              </Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📊</Text>
            规格参数
          </Text>
          <View className={styles.specsList}>
            {asset.specs.map((spec, index) => {
              const [label, value] = spec.split(': ');
              return (
                <View key={index} className={styles.specItem}>
                  <Text className={styles.label}>{label}:</Text>
                  <Text className={styles.value}>{value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📋</Text>
            使用规则
          </Text>
          <View className={styles.rulesList}>
            {asset.rules.map((rule, index) => (
              <Text key={index} className={styles.ruleItem}>{rule}</Text>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📦</Text>
            库存信息
          </Text>
          <View className={styles.stockInfo}>
            <View className={styles.stockItem}>
              <Text className={styles.stockNum}>{asset.totalStock}</Text>
              <Text className={styles.stockLabel}>总库存</Text>
            </View>
            <View className={styles.stockItem}>
              <Text className={styles.stockNum}>{availableStock}</Text>
              <Text className={styles.stockLabel}>可预约</Text>
            </View>
            <View className={styles.stockItem}>
              <Text className={styles.stockNum}>{asset.totalStock - availableStock}</Text>
              <Text className={styles.stockLabel}>已占用</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryBtn} onClick={handlePickup}>
          扫码领取
        </Button>
        <Button
          className={styles.bookBtn}
          disabled={!availableNow}
          onClick={handleBook}
        >
          {availableNow ? '立即预约' : isBlacklisted ? '黑名单日期' : isMaintenance ? '维修中' : '暂不可预约'}
        </Button>
      </View>
    </View>
  );
};

export default DetailPage;
