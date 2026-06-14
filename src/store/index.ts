import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Asset, TimeSlot } from '@/types/asset';
import { Booking, BlacklistDate, MaintenanceRecord, BookingStatus } from '@/types/booking';
import { assets as initialAssets } from '@/data/assets';
import { bookings as initialBookings, blacklistDates as initialBlacklist, maintenanceRecords as initialMaintenance } from '@/data/bookings';

interface BookingStore {
  assets: Asset[];
  bookings: Booking[];
  blacklistDates: BlacklistDate[];
  maintenanceRecords: MaintenanceRecord[];
  currentUserId: string;
  currentUserName: string;
  currentUserDept: string;

  generateTimeSlots: (date: string, assetId?: string) => TimeSlot[];
  isAssetAvailable: (assetId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string) => boolean;
  isDateBlacklisted: (date: string) => boolean;
  isAssetUnderMaintenance: (assetId: string, date: string) => boolean;
  getAvailableStock: (assetId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string) => number;
  getBookingsByUser: (userId: string) => Booking[];
  getBookingsByDate: (date: string) => Booking[];
  getPendingApprovals: () => Booking[];
  getOverdueBookings: () => Booking[];

  addBooking: (data: {
    assetId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) => Booking;
  updateBooking: (id: string, data: {
    date?: string;
    startTime?: string;
    endTime?: string;
    purpose?: string;
  }) => boolean;
  cancelBooking: (id: string) => boolean;
  pickupBooking: (id: string) => boolean;
  returnBooking: (id: string, damageDesc?: string, damagePhotos?: string[]) => boolean;
  approveBooking: (id: string) => boolean;
  rejectBooking: (id: string, reason: string) => boolean;

  addBlacklistDate: (date: string, reason: string) => BlacklistDate;
  removeBlacklistDate: (id: string) => boolean;

  addMaintenanceRecord: (data: {
    assetId: string;
    assetName: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => MaintenanceRecord;
  completeMaintenance: (id: string) => boolean;

  resetData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const getNowStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      assets: initialAssets,
      bookings: initialBookings,
      blacklistDates: initialBlacklist,
      maintenanceRecords: initialMaintenance,
      currentUserId: 'u001',
      currentUserName: '张三',
      currentUserDept: '市场部',

      generateTimeSlots: (date: string, assetId?: string): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        const { isDateBlacklisted } = get();

        if (isDateBlacklisted(date)) {
          for (let hour = 8; hour < 20; hour++) {
            const startHour = hour.toString().padStart(2, '0');
            const endHour = (hour + 1).toString().padStart(2, '0');
            slots.push({
              id: `${date}-${startHour}`,
              startTime: `${startHour}:00`,
              endTime: `${endHour}:00`,
              available: false
            });
          }
          return slots;
        }

        for (let hour = 8; hour < 20; hour++) {
          const startHour = hour.toString().padStart(2, '0');
          const endHour = (hour + 1).toString().padStart(2, '0');
          const startTime = `${startHour}:00`;
          const endTime = `${endHour}:00`;

          let available = true;
          if (assetId) {
            available = get().isAssetAvailable(assetId, date, startTime, endTime);
          }

          slots.push({
            id: `${date}-${startHour}`,
            startTime,
            endTime,
            available
          });
        }
        return slots;
      },

      isAssetAvailable: (assetId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string): boolean => {
        const { assets, isDateBlacklisted, isAssetUnderMaintenance, getAvailableStock } = get();

        if (isDateBlacklisted(date)) return false;
        if (isAssetUnderMaintenance(assetId, date)) return false;

        const asset = assets.find(a => a.id === assetId);
        if (!asset) return false;
        if (asset.status === 'maintenance') return false;

        const stock = getAvailableStock(assetId, date, startTime, endTime, excludeBookingId);
        return stock > 0;
      },

      isDateBlacklisted: (date: string): boolean => {
        const { blacklistDates } = get();
        return blacklistDates.some(bl => bl.date === date);
      },

      isAssetUnderMaintenance: (assetId: string, date: string): boolean => {
        const { maintenanceRecords } = get();
        return maintenanceRecords.some(m =>
          m.assetId === assetId &&
          m.status === 'ongoing' &&
          date >= m.startDate &&
          date <= m.endDate
        );
      },

      getAvailableStock: (assetId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string): number => {
        const { assets, bookings } = get();
        const asset = assets.find(a => a.id === assetId);
        if (!asset) return 0;

        const overlappingBookings = bookings.filter(b =>
          b.assetId === assetId &&
          b.date === date &&
          b.id !== excludeBookingId &&
          b.status !== 'cancelled' &&
          b.status !== 'rejected' &&
          b.status !== 'returned' &&
          !(b.endTime <= startTime || b.startTime >= endTime)
        );

        return Math.max(0, asset.totalStock - overlappingBookings.length);
      },

      getBookingsByUser: (userId: string): Booking[] => {
        const { bookings } = get();
        return bookings
          .filter(b => b.userId === userId)
          .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
      },

      getBookingsByDate: (date: string): Booking[] => {
        const { bookings } = get();
        return bookings
          .filter(b => b.date === date && b.status !== 'cancelled' && b.status !== 'rejected')
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },

      getPendingApprovals: (): Booking[] => {
        const { bookings } = get();
        return bookings.filter(b => b.status === 'pending' && b.isHighValue);
      },

      getOverdueBookings: (): Booking[] => {
        const { bookings } = get();
        return bookings.filter(b => b.status === 'overdue');
      },

      addBooking: (data): Booking => {
        const { assets, currentUserId, currentUserName, currentUserDept } = get();
        const asset = assets.find(a => a.id === data.assetId);
        if (!asset) throw new Error('资产不存在');

        const available = get().isAssetAvailable(data.assetId, data.date, data.startTime, data.endTime);
        if (!available) throw new Error('该时段资产不可用');

        const status: BookingStatus = asset.isHighValue ? 'pending' : 'approved';

        const newBooking: Booking = {
          id: generateId(),
          assetId: data.assetId,
          assetName: asset.name,
          assetImage: asset.image,
          userId: currentUserId,
          userName: currentUserName,
          userDept: currentUserDept,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          purpose: data.purpose,
          status,
          isHighValue: asset.isHighValue,
          createTime: getNowStr()
        };

        set(state => ({
          bookings: [...state.bookings, newBooking]
        }));

        return newBooking;
      },

      updateBooking: (id, data): boolean => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === id);
        if (!booking) return false;
        if (booking.status === 'picked' || booking.status === 'returned' || booking.status === 'cancelled' || booking.status === 'rejected') {
          return false;
        }

        const onlyPurpose = !data.date && !data.startTime && !data.endTime && !!data.purpose;
        if (!onlyPurpose && (data.date || data.startTime || data.endTime)) {
          const newDate = data.date || booking.date;
          const newStartTime = data.startTime || booking.startTime;
          const newEndTime = data.endTime || booking.endTime;

          const available = get().isAssetAvailable(booking.assetId, newDate, newStartTime, newEndTime, id);
          if (!available) return false;
        }

        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === id
              ? { ...b, ...data }
              : b
          )
        }));

        return true;
      },

      cancelBooking: (id): boolean => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === id);
        if (!booking) return false;
        if (booking.status === 'picked' || booking.status === 'returned' || booking.status === 'cancelled' || booking.status === 'rejected') {
          return false;
        }

        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === id
              ? { ...b, status: 'cancelled' as BookingStatus }
              : b
          )
        }));

        return true;
      },

      pickupBooking: (id): boolean => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === id);
        if (!booking) return false;
        if (booking.status !== 'approved') return false;

        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === id
              ? { ...b, status: 'picked' as BookingStatus, pickedTime: getNowStr() }
              : b
          )
        }));

        return true;
      },

      returnBooking: (id, damageDesc?, damagePhotos?): boolean => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === id);
        if (!booking) return false;
        if (booking.status !== 'picked' && booking.status !== 'overdue') return false;

        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === id
              ? {
                  ...b,
                  status: 'returned' as BookingStatus,
                  returnedTime: getNowStr(),
                  damageDesc,
                  damagePhotos
                }
              : b
          )
        }));

        return true;
      },

      approveBooking: (id): boolean => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === id);
        if (!booking) return false;
        if (booking.status !== 'pending') return false;

        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === id
              ? { ...b, status: 'approved' as BookingStatus }
              : b
          )
        }));

        return true;
      },

      rejectBooking: (id, reason): boolean => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === id);
        if (!booking) return false;
        if (booking.status !== 'pending') return false;

        set(state => ({
          bookings: state.bookings.map(b =>
            b.id === id
              ? { ...b, status: 'rejected' as BookingStatus, rejectReason: reason }
              : b
          )
        }));

        return true;
      },

      addBlacklistDate: (date, reason): BlacklistDate => {
        const newBlacklist: BlacklistDate = {
          id: generateId(),
          date,
          reason,
          createTime: getNowStr()
        };

        set(state => ({
          blacklistDates: [...state.blacklistDates, newBlacklist]
        }));

        return newBlacklist;
      },

      removeBlacklistDate: (id): boolean => {
        const { blacklistDates } = get();
        const exists = blacklistDates.some(bl => bl.id === id);
        if (!exists) return false;

        set(state => ({
          blacklistDates: state.blacklistDates.filter(bl => bl.id !== id)
        }));

        return true;
      },

      addMaintenanceRecord: (data): MaintenanceRecord => {
        const newRecord: MaintenanceRecord = {
          id: generateId(),
          assetId: data.assetId,
          assetName: data.assetName,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
          status: 'ongoing'
        };

        set(state => ({
          maintenanceRecords: [...state.maintenanceRecords, newRecord]
        }));

        return newRecord;
      },

      completeMaintenance: (id): boolean => {
        const { maintenanceRecords } = get();
        const record = maintenanceRecords.find(m => m.id === id);
        if (!record) return false;

        set(state => ({
          maintenanceRecords: state.maintenanceRecords.map(m =>
            m.id === id
              ? { ...m, status: 'completed' }
              : m
          )
        }));

        return true;
      },

      resetData: () => {
        set({
          assets: initialAssets,
          bookings: initialBookings,
          blacklistDates: initialBlacklist,
          maintenanceRecords: initialMaintenance
        });
      }
    }),
    {
      name: 'booking-storage'
    }
  )
);
