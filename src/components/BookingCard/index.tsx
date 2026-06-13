import React from 'react';
import { View, Image, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Booking } from '@/types/booking';
import StatusBadge from '@/components/StatusBadge';
import { getBookingStatusText } from '@/utils/format';
import styles from './index.module.scss';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onPickup?: () => void;
  onReturn?: () => void;
  onCancel?: () => void;
  onClick?: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  showActions = true,
  onPickup,
  onReturn,
  onCancel,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/booking-detail/index?id=${booking.id}`
      });
    }
  };

  const renderActions = () => {
    if (!showActions) return null;

    const buttons: JSX.Element[] = [];

    if (booking.status === 'approved') {
      buttons.push(
        <Button
          key="pickup"
          className={classnames(styles.actionBtn)}
          onClick={(e) => {
            e.stopPropagation();
            onPickup?.();
          }}
        >
          扫码领取
        </Button>
      );
      buttons.push(
        <Button
          key="cancel"
          className={classnames(styles.actionBtn, styles.secondary)}
          onClick={(e) => {
            e.stopPropagation();
            onCancel?.();
          }}
        >
          取消预约
        </Button>
      );
    }

    if (booking.status === 'picked') {
      buttons.push(
        <Button
          key="return"
          className={classnames(styles.actionBtn)}
          onClick={(e) => {
            e.stopPropagation();
            onReturn?.();
          }}
        >
          扫码归还
        </Button>
      );
    }

    if (booking.status === 'pending') {
      buttons.push(
        <Button
          key="cancel"
          className={classnames(styles.actionBtn, styles.secondary)}
          onClick={(e) => {
            e.stopPropagation();
            onCancel?.();
          }}
        >
          取消预约
        </Button>
      );
    }

    if (booking.status === 'overdue') {
      buttons.push(
        <Button
          key="return"
          className={classnames(styles.actionBtn, styles.danger)}
          onClick={(e) => {
            e.stopPropagation();
            onReturn?.();
          }}
        >
          立即归还
        </Button>
      );
    }

    return buttons.length > 0 ? <View className={styles.actions}>{buttons}</View> : null;
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.assetInfo}>
          <Image className={styles.assetImage} src={booking.assetImage} mode="aspectFill" />
          <Text className={styles.assetName}>{booking.assetName}</Text>
        </View>
        <StatusBadge status={booking.status} text={getBookingStatusText(booking.status)} />
      </View>

      <View className={styles.timeInfo}>
        <View className={styles.timeRow}>
          <Text className={styles.timeLabel}>预约日期</Text>
          <Text className={styles.timeValue}>{booking.date}</Text>
        </View>
        <View className={styles.timeRow}>
          <Text className={styles.timeLabel}>使用时段</Text>
          <Text className={styles.timeValue}>{booking.startTime} - {booking.endTime}</Text>
        </View>
      </View>

      <View className={styles.purpose}>
        <Text className={styles.label}>用途：</Text>
        <Text className={styles.text}>{booking.purpose}</Text>
      </View>

      <View className={styles.footer}>
        <Text className={styles.userInfo}>{booking.userName} · {booking.userDept}</Text>
        {renderActions()}
      </View>
    </View>
  );
};

export default BookingCard;
