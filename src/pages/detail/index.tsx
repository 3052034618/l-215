import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { assets } from '@/data/assets';
import { getStatusText, getLocationName, getCategoryName } from '@/utils/format';
import StatusBadge from '@/components/StatusBadge';
import { Asset } from '@/types/asset';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const id = router.params.id;
    const found = assets.find((a) => a.id === id);
    if (found) {
      setAsset(found);
      Taro.setNavigationBarTitle({ title: found.name });
    }
  }, [router.params.id]);

  useDidShow(() => {
    console.log('[Detail] page show, assetId:', router.params.id);
  });

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

  const canBook = asset.status === 'available' && asset.availableStock > 0;

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
            <StatusBadge status={asset.status} text={getStatusText(asset.status)} />
          </View>
          <View className={styles.tags}>
            {asset.tags.map((tag, index) => (
              <Text key={index} className={styles.tag}>{tag}</Text>
            ))}
            {asset.isHighValue && <Text className={styles.highValueTag}>高价值资产</Text>}
          </View>
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
              <Text className={styles.stockNum}>{asset.availableStock}</Text>
              <Text className={styles.stockLabel}>可预约</Text>
            </View>
            <View className={styles.stockItem}>
              <Text className={styles.stockNum}>{asset.totalStock - asset.availableStock}</Text>
              <Text className={styles.stockLabel}>已借出</Text>
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
          disabled={!canBook}
          onClick={handleBook}
        >
          {canBook ? '立即预约' : '暂不可预约'}
        </Button>
      </View>
    </View>
  );
};

export default DetailPage;
