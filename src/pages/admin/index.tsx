import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { bookings, blacklistDates, maintenanceRecords, usageStats } from '@/data/bookings';
import StatusBadge from '@/components/StatusBadge';
import { getBookingStatusText } from '@/utils/format';
import styles from './index.module.scss';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'blacklist' | 'overdue' | 'maintenance'>('overview');

  useDidShow(() => {
    console.log('[Admin] page show');
  });

  const pendingApprovals = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending' && b.isHighValue);
  }, []);

  const overdueBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'overdue');
  }, []);

  const topRankings = useMemo(() => {
    return [...usageStats].sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5);
  }, []);

  const totalStats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalAssets = 12;
    const utilizationRate = 58;
    const overdueCount = overdueBookings.length;
    return { totalBookings, totalAssets, utilizationRate, overdueCount };
  }, [overdueBookings]);

  const handleApprove = (id: string) => {
    Taro.showModal({
      title: '审批通过',
      content: '确定通过此预约申请吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已通过', icon: 'success' });
        }
      }
    });
  };

  const handleReject = (id: string) => {
    Taro.showModal({
      title: '拒绝申请',
      content: '确定拒绝此预约申请吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已拒绝', icon: 'none' });
        }
      }
    });
  };

  const handleOverdueProcess = (id: string) => {
    Taro.showActionSheet({
      itemList: ['联系用户', '标记已归还', '计入黑名单'],
      success: (res) => {
        Taro.showToast({ title: '操作成功', icon: 'success' });
      }
    });
  };

  const handleAddBlacklist = () => {
    Taro.showToast({ title: '添加黑名单日期', icon: 'none' });
  };

  const handleAddMaintenance = () => {
    Taro.showToast({ title: '登记维修', icon: 'none' });
  };

  const menuItems = [
    { icon: '📋', name: '待审批', badge: pendingApprovals.length, key: 'approval' },
    { icon: '📅', name: '黑名单日期', key: 'blacklist' },
    { icon: '⏰', name: '逾期处理', badge: overdueBookings.length, key: 'overdue' },
    { icon: '🔧', name: '维修登记', key: 'maintenance' }
  ];

  const renderOverview = () => (
    <>
      <View className={styles.statsSection}>
        <Text className={styles.sectionTitle}>数据概览</Text>
        <View className={styles.statCard}>
          <View className={styles.statRow}>
            <View className={styles.statBox}>
              <Text className={styles.statNum}>{totalStats.totalBookings}</Text>
              <Text className={styles.statLabel}>总预约数</Text>
            </View>
            <View className={styles.statBox}>
              <Text className={styles.statNum}>{totalStats.totalAssets}</Text>
              <Text className={styles.statLabel}>资产总数</Text>
            </View>
            <View className={styles.statBox}>
              <Text className={styles.statNum}>{totalStats.utilizationRate}%</Text>
              <Text className={styles.statLabel}>资源利用率</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statCardHeader}>
          <Text className={styles.sectionTitle}>热门物品排行</Text>
          <Text className={styles.statCardMore}>查看全部</Text>
        </View>
        <View className={styles.statCard}>
          <View className={styles.rankingList}>
            {topRankings.map((item, index) => (
              <View key={item.assetId} className={styles.rankingItem}>
                <View className={classnames(styles.rankingIndex, index < 3 && styles[`top${index + 1}`])}>
                  {index + 1}
                </View>
                <View className={styles.rankingInfo}>
                  <Text className={styles.rankingName}>{item.assetName}</Text>
                  <View className={styles.rankingBar}>
                    <View
                      className={styles.rankingBarFill}
                      style={{ width: `${item.utilizationRate}%` }}
                    />
                  </View>
                </View>
                <Text className={styles.rankingValue}>{item.bookingCount}次</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </>
  );

  const renderApproval = () => (
    <View className={styles.listSection}>
      {pendingApprovals.length > 0 ? (
        pendingApprovals.map((booking) => (
          <View key={booking.id} className={styles.listItem}>
            <View className={styles.listItemInfo}>
              <Text className={styles.listItemTitle}>{booking.assetName}</Text>
              <Text className={styles.listItemDesc}>
                {booking.userName} · {booking.date} {booking.startTime}-{booking.endTime}
              </Text>
            </View>
            <Button
              className={classnames(styles.listItemAction, styles.secondary)}
              onClick={() => handleReject(booking.id)}
            >
              拒绝
            </Button>
            <Button
              className={styles.listItemAction}
              onClick={() => handleApprove(booking.id)}
            >
              通过
            </Button>
          </View>
        ))
      ) : (
        <View style={{ textAlign: 'center', padding: '80rpx 0', color: '#86909c' }}>
          暂无待审批申请
        </View>
      )}
    </View>
  );

  const renderBlacklist = () => (
    <View className={styles.listSection}>
      <View style={{ marginBottom: '24rpx' }}>
        <Button
          className={styles.listItemAction}
          style={{ width: '200rpx', height: '80rpx', float: 'right' }}
          onClick={handleAddBlacklist}
        >
          + 添加日期
        </Button>
        <View style={{ clear: 'both' }} />
      </View>
      {blacklistDates.map((item) => (
        <View key={item.id} className={styles.listItem}>
          <View className={styles.listItemInfo}>
            <Text className={styles.listItemTitle}>{item.date}</Text>
            <Text className={styles.listItemDesc}>{item.reason}</Text>
          </View>
          <StatusBadge status="maintenance" text="已禁用" />
        </View>
      ))}
    </View>
  );

  const renderOverdue = () => (
    <View className={styles.listSection}>
      {overdueBookings.length > 0 ? (
        overdueBookings.map((booking) => (
          <View key={booking.id} className={styles.listItem}>
            <View className={styles.listItemInfo}>
              <Text className={styles.listItemTitle}>{booking.assetName}</Text>
              <Text className={styles.listItemDesc}>
                {booking.userName} · 逾期 {(new Date().getDate() - 10)}天
              </Text>
            </View>
            <Button
              className={styles.listItemAction}
              onClick={() => handleOverdueProcess(booking.id)}
            >
              处理
            </Button>
          </View>
        ))
      ) : (
        <View style={{ textAlign: 'center', padding: '80rpx 0', color: '#86909c' }}>
          暂无逾期记录
        </View>
      )}
    </View>
  );

  const renderMaintenance = () => (
    <View className={styles.listSection}>
      <View style={{ marginBottom: '24rpx' }}>
        <Button
          className={styles.listItemAction}
          style={{ width: '200rpx', height: '80rpx', float: 'right' }}
          onClick={handleAddMaintenance}
        >
          + 登记维修
        </Button>
        <View style={{ clear: 'both' }} />
      </View>
      {maintenanceRecords.map((item) => (
        <View key={item.id} className={styles.listItem}>
          <View className={styles.listItemInfo}>
            <Text className={styles.listItemTitle}>{item.assetName}</Text>
            <Text className={styles.listItemDesc}>
              {item.startDate} ~ {item.endDate} · {item.reason}
            </Text>
          </View>
          <StatusBadge
            status={item.status === 'ongoing' ? 'maintenance' : 'returned'}
            text={item.status === 'ongoing' ? '维修中' : '已完成'}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>管理中心</Text>
        <Text className={styles.subtitle}>高效管理企业资产，提升使用效率</Text>
      </View>

      <View className={styles.menuGrid}>
        {menuItems.map((item) => (
          <View
            key={item.key}
            className={styles.menuItem}
            style={{ position: 'relative' }}
            onClick={() => setActiveTab(item.key as any)}
          >
            {item.badge && item.badge > 0 && (
              <View className={styles.menuBadge}>{item.badge}</View>
            )}
            <Text className={styles.menuIcon}>{item.icon}</Text>
            <Text className={styles.menuName}>{item.name}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollX className={styles.tabs} style={{ paddingLeft: '32rpx', paddingRight: '32rpx' }}>
        {[
          { key: 'overview', label: '数据概览' },
          { key: 'approval', label: '待审批' },
          { key: 'blacklist', label: '黑名单' },
          { key: 'overdue', label: '逾期' },
          { key: 'maintenance', label: '维修' }
        ].map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tab, activeTab === tab.key && styles.active)}
            style={{
              display: 'inline-block',
              padding: '16rpx 32rpx',
              background: activeTab === tab.key ? '#165dff' : '#fff',
              color: activeTab === tab.key ? '#fff' : '#4e5969',
              borderRadius: '48rpx',
              fontSize: '28rpx',
              marginRight: '16rpx'
            }}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </View>
        ))}
      </ScrollView>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'approval' && renderApproval()}
      {activeTab === 'blacklist' && renderBlacklist()}
      {activeTab === 'overdue' && renderOverdue()}
      {activeTab === 'maintenance' && renderMaintenance()}
    </View>
  );
};

export default AdminPage;
