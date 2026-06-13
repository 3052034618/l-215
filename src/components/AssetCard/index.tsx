import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Asset } from '@/types/asset';
import StatusBadge from '@/components/StatusBadge';
import { getStatusText, getLocationName } from '@/utils/format';
import styles from './index.module.scss';

interface AssetCardProps {
  asset: Asset;
  onClick?: (asset: Asset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
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
            <StatusBadge status={asset.status} text={getStatusText(asset.status)} />
          </View>
          <Text className={styles.desc}>{asset.description}</Text>
        </View>
        <View className={styles.footer}>
          <View className={styles.tags}>
            {asset.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} className={styles.tag}>{tag}</Text>
            ))}
            {asset.isHighValue && <Text className={styles.highValue}>高价值</Text>}
          </View>
          <Text className={styles.stock}>库存: {asset.availableStock}/{asset.totalStock}</Text>
        </View>
      </View>
    </View>
  );
};

export default AssetCard;
