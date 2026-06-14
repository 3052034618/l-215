import React, { useMemo } from 'react';
import { View, Image, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Asset } from '@/types/asset';
import StatusBadge from '@/components/StatusBadge';
import { getStatusText, getLocationName } from '@/utils/format';
import { useBookingStore } from '@/store';
import styles from './index.module.scss';

interface AssetCardProps {
  asset: Asset;
  onClick?: (asset: Asset) => void;
  showAvailableStock?: boolean;
  date?: string;
  startTime?: string;
  endTime?: string;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, showAvailableStock = false, date, startTime, endTime }) => {
  const { getAvailableStock, isAssetUnderMaintenance, isDateBlacklisted } = useBookingStore();

  const realtimeAvailable = useMemo(() => {
    if (!showAvailableStock || !date || !startTime || !endTime) {
      return asset.availableStock;
    }

    if (isDateBlacklisted(date)) {
      return 0;
    }

    if (isAssetUnderMaintenance(asset.id, date)) {
      return 0;
    }

    return getAvailableStock(asset.id, date, startTime, endTime);
  }, [asset, showAvailableStock, date, startTime, endTime, getAvailableStock, isAssetUnderMaintenance, isDateBlacklisted]);

  const badgeStatus = useMemo(() => {
    if (showAvailableStock && date) {
      if (isDateBlacklisted(date)) {
        return 'unavailable';
      }
      if (isAssetUnderMaintenance(asset.id, date)) {
        return 'maintenance';
      }
      if (realtimeAvailable > 0) {
        return 'available';
      }
      return 'borrowed';
    }
    return asset.status;
  }, [asset, showAvailableStock, date, realtimeAvailable, isDateBlacklisted, isAssetUnderMaintenance]);

  const displayStatus = useMemo(() => {
    if (showAvailableStock && date) {
      if (isDateBlacklisted(date)) {
        return '不可预约';
      }
      if (isAssetUnderMaintenance(asset.id, date)) {
        return '维修中';
      }
      if (realtimeAvailable > 0) {
        return '可预约';
      }
      return '已约满';
    }
    return getStatusText(asset.status);
  }, [asset, showAvailableStock, date, realtimeAvailable, isDateBlacklisted, isAssetUnderMaintenance]);

  const handleClick = () => {
    if (onClick) {
      onClick(asset);
    } else {
      Taro.navigateTo({
        url: `/pages/detail/index?id=${asset.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image className={styles.image} src={asset.image} mode="aspectFill" />
      <View className={styles.content}>
        <View>
          <View className={styles.header}>
            <Text className={styles.name}>{asset.name}</Text>
            <StatusBadge
              status={badgeStatus}
              text={displayStatus}
            />
          </View>
          <Text className={styles.desc}>{asset.description}</Text>
          <Text className={styles.location}>📍 {getLocationName(asset.location)}</Text>
        </View>
        <View className={styles.footer}>
          <View className={styles.tags}>
            {asset.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} className={styles.tag}>{tag}</Text>
            ))}
            {asset.isHighValue && <Text className={styles.highValue}>高价值</Text>}
          </View>
          <Text className={styles.stock}>
            {showAvailableStock && date
              ? `可约: ${realtimeAvailable}/${asset.totalStock}`
              : `库存: ${asset.availableStock}/${asset.totalStock}`
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AssetCard;
