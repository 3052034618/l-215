import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView, Picker } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { AssetCategory } from '@/types/asset';
import { categories, locations } from '@/data/assets';
import AssetCard from '@/components/AssetCard';
import { formatDate } from '@/utils/date';
import { useBookingStore } from '@/store';
import styles from './index.module.scss';

const ResourcesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all'>('all');
  const [activeLocation, setActiveLocation] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { assets, generateTimeSlots, isAssetAvailable, isDateBlacklisted, isAssetUnderMaintenance } = useBookingStore();

  useDidShow(() => {
    setRefreshKey(prev => prev + 1);
  });

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const timeSlots = useMemo(() => {
    return generateTimeSlots(selectedDate);
  }, [selectedDate, generateTimeSlots, refreshKey]);

  const dateIsBlacklisted = useMemo(() => {
    return isDateBlacklisted(selectedDate);
  }, [selectedDate, isDateBlacklisted, refreshKey]);

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

      if (dateIsBlacklisted) {
        return false;
      }

      if (isAssetUnderMaintenance(asset.id, selectedDate)) {
        return false;
      }

      if (selectedTimeSlot !== 'all') {
        const slot = timeSlots.find(s => s.id === selectedTimeSlot);
        if (slot) {
          const available = isAssetAvailable(asset.id, selectedDate, slot.startTime, slot.endTime);
          if (!available) {
            return false;
          }
        }
      }

      return true;
    });
  }, [assets, activeCategory, activeLocation, searchText, selectedDate, selectedTimeSlot, timeSlots, isAssetAvailable, isAssetUnderMaintenance, dateIsBlacklisted, refreshKey]);

  const handleDateChange = (e: any) => {
    setSelectedDate(e.detail.value);
    setSelectedTimeSlot('all');
  };

  const handleAssetClick = (assetId: string) => {
    const slot = timeSlots.find(s => s.id === selectedTimeSlot);
    const startTime = slot ? slot.startTime : '08:00';
    const endTime = slot ? slot.endTime : '20:00';
    Taro.navigateTo({
      url: `/pages/detail/index?id=${assetId}&date=${selectedDate}&startTime=${startTime}&endTime=${endTime}`
    });
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
            <Text className={classnames(styles.dateValue, dateIsBlacklisted && styles.disabledText)}>{selectedDate}</Text>
            <Text className={styles.dateArrow}>›</Text>
          </View>
        </Picker>

        {dateIsBlacklisted && (
          <View className={styles.blacklistWarning}>
            <Text className={styles.warningIcon}>⚠️</Text>
            <Text className={styles.warningText}>该日期为黑名单日期，不可预约</Text>
          </View>
        )}

        {!dateIsBlacklisted && (
          <>
            <Text className={styles.filterTitle}>可用时段</Text>
            <ScrollView scrollX className={styles.timeSlotScroll}>
              <View className={styles.timeSlotList}>
                <View
                  className={classnames(styles.timeSlotItem, selectedTimeSlot === 'all' && styles.timeSlotActive)}
                  onClick={() => setSelectedTimeSlot('all')}
                >
                  全天
                </View>
                {timeSlots.map((slot) => (
                  <View
                    key={slot.id}
                    className={classnames(
                      styles.timeSlotItem,
                      selectedTimeSlot === slot.id && styles.timeSlotActive,
                      !slot.available && styles.timeSlotDisabled
                    )}
                    onClick={() => slot.available && setSelectedTimeSlot(slot.id)}
                  >
                    {slot.startTime}
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}
      </View>

      <View className={styles.assetList}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>可用资产</Text>
          <Text className={styles.listCount}>共 {filteredAssets.length} 件</Text>
        </View>

        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <View key={asset.id} onClick={() => handleAssetClick(asset.id)}>
              <AssetCard
                asset={asset}
                showAvailableStock={true}
                date={selectedDate}
                startTime={selectedTimeSlot !== 'all' ? timeSlots.find(s => s.id === selectedTimeSlot)?.startTime : '08:00'}
                endTime={selectedTimeSlot !== 'all' ? timeSlots.find(s => s.id === selectedTimeSlot)?.endTime : '20:00'}
              />
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>
              {dateIsBlacklisted ? '所选日期不可预约' : '暂无符合条件的资产'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ResourcesPage;
