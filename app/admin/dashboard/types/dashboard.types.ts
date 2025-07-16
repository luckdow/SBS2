// Dashboard specific types and interfaces
export interface DashboardMetrics {
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  offlineDrivers: number;
  totalReservations: number;
  pendingReservations: number;
  assignedReservations: number;
  startedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  dailyReservations: number;
  weeklyReservations: number;
  monthlyReservations: number;
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageVehicleUsage: number;
  averageRating: number;
  customerSatisfaction: number;
}

export interface ReservationTrendData {
  date: string;
  reservations: number;
  completed: number;
  cancelled: number;
}

export interface RevenueTrendData {
  date: string;
  revenue: number;
  driverShare: number;
  companyShare: number;
}

export interface PopularHoursData {
  hour: string;
  reservations: number;
}

export interface VehiclePerformanceData {
  vehicleId: string;
  vehicleName: string;
  vehicleType: string;
  totalReservations: number;
  revenue: number;
  rating: number;
  usageRate: number;
}

export interface DriverPerformanceData {
  driverId: string;
  driverName: string;
  totalTrips: number;
  earnings: number;
  rating: number;
  isActive: boolean;
  vehicleType: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  reservationTrend: ReservationTrendData[];
  revenueTrend: RevenueTrendData[];
  popularHours: PopularHoursData[];
  vehiclePerformance: VehiclePerformanceData[];
  driverPerformance: DriverPerformanceData[];
  lastUpdated: Date;
}

export interface LiveStatusData {
  isOnline: boolean;
  activeUsers: number;
  lastUpdate: Date;
  pendingActions: number;
}