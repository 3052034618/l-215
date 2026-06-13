import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import { generateCalendarDays, isToday, isSameDay, getWeekdayName } from '@/utils/date';
import styles from './index.module.scss';

interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  bookingDates?: string[];
  disabledDates?: string[];
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  bookingDates = [],
  disabledDates = []
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    return generateCalendarDays(year, month);
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    if (disabledDates.includes(dateStr)) return;

    setSelectedDate(day);
    onChange?.(day);
  };

  const hasBooking = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    return bookingDates.includes(dateStr);
  };

  const isDisabled = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    return disabledDates.includes(dateStr);
  };

  const weekdays = [0, 1, 2, 3, 4, 5, 6].map((d) => getWeekdayName(d));

  return (
    <View className={styles.calendar}>
      <View className={styles.header}>
        <Button className={styles.navBtn} onClick={handlePrevMonth}>
          ‹
        </Button>
        <Text className={styles.title}>{year}年{month + 1}月</Text>
        <Button className={styles.navBtn} onClick={handleNextMonth}>
          ›
        </Button>
      </View>

      <View className={styles.weekdays}>
        {weekdays.map((day, index) => (
          <Text key={index} className={styles.weekday}>{day}</Text>
        ))}
      </View>

      <View className={styles.days}>
        {days.map((day, index) => {
          if (!day) {
            return <View key={index} className={classnames(styles.day, styles.empty)} />;
          }

          const isSelected = isSameDay(day, selectedDate);
          const isTodayFlag = isToday(day);
          const hasBookingFlag = hasBooking(day);
          const isDisabledFlag = isDisabled(day);

          return (
            <View
              key={index}
              className={classnames(
                styles.day,
                isTodayFlag && styles.today,
                isSelected && styles.selected,
                hasBookingFlag && styles.hasBooking,
                isDisabledFlag && styles.disabled
              )}
              onClick={() => handleDayClick(day)}
            >
              <Text>{day.getDate()}</Text>
              {hasBookingFlag && <View className={styles.dot} />}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Calendar;
