import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Picker, Input, Textarea, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { getBookingStatusText } from '@/utils/format';
import { formatDate } from '@/utils/date';
import { useBookingStore } from '@/store';
import { assets } from '@/data/assets';
import styles from './index.module.scss';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'approval' | 'blacklist' | 'overdue' | 'maintenance'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistDate, setBlacklistDate] = useState('');
  const [blacklistReason, setBlacklistReason] = useState('');

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceAssetId, setMaintenanceAssetId] = useState('');
  const [maintenanceStartDate, setMaintenanceStartDate] = useState('');
  const [maintenanceEndDate, setMaintenanceEndDate] = useState('');
  const [maintenanceReason, setMaintenanceReason] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectBookingId, setRejectBookingId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const {
    bookings,
    blacklistDates,
    maintenanceRecords,
    approveBooking,
    rejectBooking,
    addBlacklistDate,
    removeBlacklistDate,
    addMaintenanceRecord,
    completeMaintenance,
    returnBooking,
    getPendingApprovals,
    getOverdueBookings
  } = useBookingStore();

  useDidShow(() => {
    setRefreshKey(prev => prev + 1);
  });

  const pendingApprovals = useMemo(() => {
    return getPendingApprovals();
  }, [bookings, refreshKey, getPendingApprovals]);

  const overdueBookings = useMemo(() => {
    return getOverdueBookings();
  }, [bookings, refreshKey, getOverdueBookings]);

  const ongoingMaintenance = useMemo(() => {
    return maintenanceRecords.filter(m => m.status === 'ongoing');
  }, [maintenanceRecords, refreshKey]);

  const totalStats = useMemo(() => {
    const totalBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'rejected').length;
    const totalAssets = assets.length;
    const utilizationRate = totalBookings > 0 ? Math.round((bookings.filter(b => b.status === 'returned' || b.status === 'picked').length / totalBookings * 100)) : 0;
    const overdueCount = overdueBookings.length;
    return { totalBookings, totalAssets, utilizationRate, overdueCount };
  }, [bookings, overdueBookings]);

  const topRankings = useMemo(() => {
    const stats = assets.map(asset => {
      const assetBookings = bookings.filter(b => b.assetId === asset.id && b.status !== 'cancelled' && b.status !== 'rejected');
      const bookingCount = assetBookings.length;
      const totalHours = assetBookings.reduce((sum, b) => {
        const start = parseInt(b.startTime);
        const end = parseInt(b.endTime);
        return sum + (end - start);
      }, 0);
      const utilizationRate = Math.min(100, Math.round(bookingCount / 10 * 100));
      return {
        assetId: asset.id,
        assetName: asset.name,
        totalHours,
        bookingCount,
        utilizationRate
      };
    });
    return stats.sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5);
  }, [bookings]);

  const handleApprove = (id: string) => {
    Taro.showModal({
      title: '审批通过',
      content: '确定通过此预约申请吗？',
      success: (res) => {
        if (res.confirm) {
          const success = approveBooking(id);
          if (success) {
            Taro.showToast({ title: '已通过', icon: 'success' });
            setRefreshKey(prev => prev + 1);
          } else {
            Taro.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  };

  const openRejectModal = (id: string) => {
    setRejectBookingId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      Taro.showToast({ title: '请填写拒绝原因', icon: 'none' });
      return;
    }
    const success = rejectBooking(rejectBookingId, rejectReason.trim());
    if (success) {
      Taro.showToast({ title: '已拒绝', icon: 'none' });
      setShowRejectModal(false);
      setRefreshKey(prev => prev + 1);
    } else {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleOverdueProcess = (id: string) => {
    Taro.showActionSheet({
      itemList: ['联系用户', '标记已归还', '计入黑名单'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '联系功能开发中', icon: 'none' });
        } else if (res.tapIndex === 1) {
          Taro.showModal({
            title: '确认归还',
            content: '确定标记该预约为已归还吗？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                const success = returnBooking(id);
                if (success) {
                  Taro.showToast({ title: '已标记归还', icon: 'success' });
                  setRefreshKey(prev => prev + 1);
                } else {
                  Taro.showToast({ title: '操作失败', icon: 'none' });
                }
              }
            }
          });
        } else if (res.tapIndex === 2) {
          Taro.showModal({
            title: '计入黑名单',
            content: '确定将该用户加入黑名单吗？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                Taro.showToast({ title: '已计入黑名单', icon: 'success' });
              }
            }
          });
        }
      }
    });
  };

  const openBlacklistModal = () => {
    setBlacklistDate(formatDate(new Date()));
    setBlacklistReason('');
    setShowBlacklistModal(true);
  };

  const handleBlacklistSubmit = () => {
    if (!blacklistDate) {
      Taro.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    if (!blacklistReason.trim()) {
      Taro.showToast({ title: '请填写原因', icon: 'none' });
      return;
    }
    if (blacklistDates.some(b => b.date === blacklistDate)) {
      Taro.showToast({ title: '该日期已在黑名单中', icon: 'none' });
      return;
    }

    addBlacklistDate(blacklistDate, blacklistReason.trim());
    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowBlacklistModal(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleRemoveBlacklist = (id: string) => {
    Taro.showModal({
      title: '移除黑名单',
      content: '确定要移除该黑名单日期吗？',
      success: (res) => {
        if (res.confirm) {
          const success = removeBlacklistDate(id);
          if (success) {
            Taro.showToast({ title: '已移除', icon: 'success' });
            setRefreshKey(prev => prev + 1);
          } else {
            Taro.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  };

  const openMaintenanceModal = () => {
    const today = formatDate(new Date());
    const nextWeek = formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setMaintenanceAssetId(assets[0].id);
    setMaintenanceStartDate(today);
    setMaintenanceEndDate(nextWeek);
    setMaintenanceReason('');
    setShowMaintenanceModal(true);
  };

  const handleMaintenanceSubmit = () => {
    if (!maintenanceAssetId) {
      Taro.showToast({ title: '请选择资产', icon: 'none' });
      return;
    }
    if (!maintenanceStartDate || !maintenanceEndDate) {
      Taro.showToast({ title: '请选择日期范围', icon: 'none' });
      return;
    }
    if (maintenanceStartDate > maintenanceEndDate) {
      Taro.showToast({ title: '结束日期不能早于开始日期', icon: 'none' });
      return;
    }
    if (!maintenanceReason.trim()) {
      Taro.showToast({ title: '请填写维修原因', icon: 'none' });
      return;
    }

    const asset = assets.find(a => a.id === maintenanceAssetId);
    if (!asset) return;

    addMaintenanceRecord({
      assetId: maintenanceAssetId,
      assetName: asset.name,
      startDate: maintenanceStartDate,
      endDate: maintenanceEndDate,
      reason: maintenanceReason.trim()
    });

    Taro.showToast({ title: '登记成功', icon: 'success' });
    setShowMaintenanceModal(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleCompleteMaintenance = (id: string) => {
    Taro.showModal({
      title: '完成维修',
      content: '确定标记该维修为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          const success = completeMaintenance(id);
          if (success) {
            Taro.showToast({ title: '已完成', icon: 'success' });
            setRefreshKey(prev => prev + 1);
          } else {
            Taro.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
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
                      style={{ width: `${Math.max(10, item.utilizationRate)}%` }}
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
              <Text className={styles.listItemDesc}>
                用途：{booking.purpose}
              </Text>
            </View>
            <Button
              className={classnames(styles.listItemAction, styles.secondary)}
              onClick={() => openRejectModal(booking.id)}
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
          onClick={openBlacklistModal}
        >
          + 添加日期
        </Button>
        <View style={{ clear: 'both' }} />
      </View>
      {blacklistDates.length > 0 ? (
        blacklistDates.map((item) => (
          <View key={item.id} className={styles.listItem}>
            <View className={styles.listItemInfo}>
              <Text className={styles.listItemTitle}>{item.date}</Text>
              <Text className={styles.listItemDesc}>{item.reason}</Text>
            </View>
            <StatusBadge status="maintenance" text="已禁用" />
            <Button
              className={classnames(styles.listItemAction, styles.danger)}
              onClick={() => handleRemoveBlacklist(item.id)}
            >
              移除
            </Button>
          </View>
        ))
      ) : (
        <View style={{ textAlign: 'center', padding: '80rpx 0', color: '#86909c' }}>
          暂无黑名单日期
        </View>
      )}
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
                {booking.userName} · 预约：{booking.date} {booking.startTime}-{booking.endTime}
              </Text>
              <Text className={styles.listItemDesc}>
                领取时间：{booking.pickedTime}
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
          onClick={openMaintenanceModal}
        >
          + 登记维修
        </Button>
        <View style={{ clear: 'both' }} />
      </View>
      {maintenanceRecords.length > 0 ? (
        maintenanceRecords.map((item) => (
          <View key={item.id} className={styles.listItem}>
            <View className={styles.listItemInfo}>
              <Text className={styles.listItemTitle}>{item.assetName}</Text>
              <Text className={styles.listItemDesc}>
                {item.startDate} ~ {item.endDate}
              </Text>
              <Text className={styles.listItemDesc}>
                原因：{item.reason}
              </Text>
            </View>
            <StatusBadge
              status={item.status === 'ongoing' ? 'maintenance' : 'returned'}
              text={item.status === 'ongoing' ? '维修中' : '已完成'}
            />
            {item.status === 'ongoing' && (
              <Button
                className={styles.listItemAction}
                onClick={() => handleCompleteMaintenance(item.id)}
              >
                完成
              </Button>
            )}
          </View>
        ))
      ) : (
        <View style={{ textAlign: 'center', padding: '80rpx 0', color: '#86909c' }}>
          暂无维修记录
        </View>
      )}
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

      {showBlacklistModal && (
        <View className={styles.modalOverlay} onClick={() => setShowBlacklistModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>添加黑名单日期</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>禁用日期</Text>
              <Picker mode="date" value={blacklistDate} onChange={(e) => setBlacklistDate(e.detail.value)}>
                <View className={styles.formInput}>
                  <Text>{blacklistDate || '请选择日期'}</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>禁用原因</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入禁用原因..."
                value={blacklistReason}
                onInput={(e) => setBlacklistReason(e.detail.value)}
                maxlength={100}
              />
            </View>

            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={() => setShowBlacklistModal(false)}>
                取消
              </Button>
              <Button className={styles.submitBtn} onClick={handleBlacklistSubmit}>
                添加
              </Button>
            </View>
          </View>
        </View>
      )}

      {showMaintenanceModal && (
        <View className={styles.modalOverlay} onClick={() => setShowMaintenanceModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>登记维修</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>选择资产</Text>
              <Picker
                mode="selector"
                range={assets.map(a => a.name)}
                value={assets.findIndex(a => a.id === maintenanceAssetId)}
                onChange={(e) => setMaintenanceAssetId(assets[e.detail.value].id)}
              >
                <View className={styles.formInput}>
                  <Text>{assets.find(a => a.id === maintenanceAssetId)?.name || '请选择资产'}</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>开始日期</Text>
              <Picker mode="date" value={maintenanceStartDate} onChange={(e) => setMaintenanceStartDate(e.detail.value)}>
                <View className={styles.formInput}>
                  <Text>{maintenanceStartDate || '请选择日期'}</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>结束日期</Text>
              <Picker mode="date" value={maintenanceEndDate} onChange={(e) => setMaintenanceEndDate(e.detail.value)}>
                <View className={styles.formInput}>
                  <Text>{maintenanceEndDate || '请选择日期'}</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>维修原因</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入维修原因..."
                value={maintenanceReason}
                onInput={(e) => setMaintenanceReason(e.detail.value)}
                maxlength={100}
              />
            </View>

            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={() => setShowMaintenanceModal(false)}>
                取消
              </Button>
              <Button className={styles.submitBtn} onClick={handleMaintenanceSubmit}>
                登记
              </Button>
            </View>
          </View>
        </View>
      )}

      {showRejectModal && (
        <View className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>拒绝申请</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>拒绝原因</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入拒绝原因..."
                value={rejectReason}
                onInput={(e) => setRejectReason(e.detail.value)}
                maxlength={100}
              />
            </View>

            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={() => setShowRejectModal(false)}>
                取消
              </Button>
              <Button className={classnames(styles.submitBtn, styles.danger)} onClick={handleRejectSubmit}>
                确认拒绝
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AdminPage;
