import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView, Picker } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { AssetCategory } from '@/types/asset';
import { assets, categories, locations } from '@/data/assets';
import AssetCard from '@/components/AssetCard';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const ResourcesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all'>('all');
  const [activeLocation, setActiveLocation] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [refreshing, setRefreshing] = useState(false);

  useDidShow(() => {
    console.log('[Resources] page show');
  });

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (activeCategory !== 'all' && asset.category !== activeCategory) {
        return false;
      }
      if (activeLocation !== 'all' && asset.location !== activeLocation) {
        return false;
      }
      if (searchText && !asset.name.includes(searchText) && !asset.description.includes(searchText)) {
        return false;
      }
      return true;
    });
  }, [activeCategory, activeLocation, searchText]);

  const handleDateChange = (e: any) => {
    setSelectedDate(e.detail.value);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>企业资产预约</Text>
        <Text className={styles.subtitle}>快速预订会议设备、拍摄器材和办公物品</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索设备名称或关键词"
          placeholderClass="search-placeholder"
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterTitle}>资产分类</Text>
        <View className={styles.categoryList}>
          <View
            className={classnames(styles.categoryItem, activeCategory === 'all' && styles.active)}
            onClick={() => setActiveCategory('all')}
          >
            <Text className={styles.categoryIcon}>📦</Text>
            <Text className={classnames(styles.categoryName, activeCategory === 'all' && styles.activeName)}>全部</Text>
          </View>
          {categories.map((cat) => (
            <View
              key={cat.key}
              className={classnames(styles.categoryItem, activeCategory === cat.key && styles.active)}
              onClick={() => setActiveCategory(cat.key)}
            >
              <Text className={styles.categoryIcon}>{cat.icon}</Text>
              <Text className={classnames(styles.categoryName, activeCategory === cat.key && styles.activeName)}>{cat.name}</Text>
            </View>
          ))}
        </View>

        <Text className={styles.filterTitle}>所在地点</Text>
        <ScrollView scrollX className={styles.locationScroll}>
          <View className={styles.locationTabs}>
            <View
              className={classnames(styles.locationTab, activeLocation === 'all' && styles.active)}
              onClick={() => setActiveLocation('all')}
            >
              全部地点
            </View>
            {locations.map((loc) => (
              <View
                key={loc.key}
                className={classnames(styles.locationTab, activeLocation === loc.key && styles.active)}
                onClick={() => setActiveLocation(loc.key)}
              >
                {loc.building} {loc.name}
              </View>
            ))}
          </View>
        </ScrollView>

        <Picker mode="date" value={selectedDate} onChange={handleDateChange}>
          <View className={styles.datePicker}>
            <Text className={styles.dateLabel}>📅 可用日期</Text>
            <Text className={styles.dateValue}>{selectedDate}</Text>
            <Text className={styles.dateArrow}>›</Text>
          </View>
        </Picker>
      </View>

      <View className={styles.assetList}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>可用资产</Text>
          <Text className={styles.listCount}>共 {filteredAssets.length} 件</Text>
        </View>

        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无符合条件的资产</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ResourcesPage;
