'use client'

import { useState, useEffect, useCallback } from 'react';
import { DashboardData, DashboardMetrics } from '../types/dashboard.types';
import { realTimeReservationService, realTimeDriverService } from '../../../../lib/services/realTimeService';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const generateMockTrendData = useCallback(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        reservations: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3,
        cancelled: Math.floor(Math.random() * 3),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        driverShare: 0,
        companyShare: 0
      };
    });

    return last30Days.map(day => ({
      ...day,
      driverShare: Math.floor(day.revenue * 0.7),
      companyShare: Math.floor(day.revenue * 0.3)
    }));
  }, []);

  const generateMockPerformanceData = useCallback(() => {
    return {
      vehiclePerformance: [
        {
          vehicleId: 'v1',
          vehicleName: 'Mercedes E-Class',
          vehicleType: 'luxury',
          totalReservations: 156,
          revenue: 45600,
          rating: 4.8,
          usageRate: 0.78
        },
        {
          vehicleId: 'v2',
          vehicleName: 'Toyota Camry',
          vehicleType: 'sedan',
          totalReservations: 134,
          revenue: 28900,
          rating: 4.6,
          usageRate: 0.65
        },
        {
          vehicleId: 'v3',
          vehicleName: 'Ford Transit',
          vehicleType: 'van',
          totalReservations: 98,
          revenue: 32100,
          rating: 4.7,
          usageRate: 0.72
        }
      ],
      driverPerformance: [
        {
          driverId: 'd1',
          driverName: 'Mehmet Şoför',
          totalTrips: 187,
          earnings: 31590,
          rating: 4.9,
          isActive: true,
          vehicleType: 'SUV'
        },
        {
          driverId: 'd2',
          driverName: 'Ali Şoför',
          totalTrips: 156,
          earnings: 26340,
          rating: 4.7,
          isActive: true,
          vehicleType: 'Sedan'
        },
        {
          driverId: 'd3',
          driverName: 'Hasan Şoför',
          totalTrips: 143,
          earnings: 24155,
          rating: 4.8,
          isActive: false,
          vehicleType: 'Van'
        }
      ]
    };
  }, []);

  const generatePopularHoursData = useCallback(() => {
    return [
      { hour: '06:00', reservations: 5 },
      { hour: '08:00', reservations: 15 },
      { hour: '10:00', reservations: 12 },
      { hour: '12:00', reservations: 18 },
      { hour: '14:00', reservations: 22 },
      { hour: '16:00', reservations: 25 },
      { hour: '18:00', reservations: 19 },
      { hour: '20:00', reservations: 14 },
      { hour: '22:00', reservations: 8 }
    ];
  }, []);

  const calculateMetrics = useCallback((reservations: any[], drivers: any[]): DashboardMetrics => {
    const activeDrivers = drivers.filter(d => d.isActive).length;
    const totalReservations = reservations.length;
    const pendingReservations = reservations.filter(r => r.status === 'pending').length;
    const assignedReservations = reservations.filter(r => r.status === 'assigned').length;
    const startedReservations = reservations.filter(r => r.status === 'started').length;
    const completedReservations = reservations.filter(r => r.status === 'completed').length;
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const dailyReservations = reservations.filter(r => 
      new Date(r.createdAt).toISOString().split('T')[0] === today
    ).length;

    const weeklyReservations = reservations.filter(r => 
      new Date(r.createdAt) >= new Date(weekAgo)
    ).length;

    const monthlyReservations = reservations.filter(r => 
      new Date(r.createdAt) >= new Date(monthAgo)
    ).length;

    const totalRevenue = reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const dailyRevenue = reservations
      .filter(r => new Date(r.createdAt).toISOString().split('T')[0] === today)
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    const weeklyRevenue = reservations
      .filter(r => new Date(r.createdAt) >= new Date(weekAgo))
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    const monthlyRevenue = reservations
      .filter(r => new Date(r.createdAt) >= new Date(monthAgo))
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    return {
      totalVehicles: 25,
      activeVehicles: 18,
      availableVehicles: 7,
      totalDrivers: drivers.length,
      activeDrivers,
      offlineDrivers: drivers.length - activeDrivers,
      totalReservations,
      pendingReservations,
      assignedReservations,
      startedReservations,
      completedReservations,
      cancelledReservations,
      dailyReservations,
      weeklyReservations,
      monthlyReservations,
      totalRevenue,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      averageVehicleUsage: 0.73,
      averageRating: 4.8,
      customerSatisfaction: 0.92
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [reservations, drivers] = await Promise.all([
        realTimeReservationService.getAll(),
        realTimeDriverService.getAll()
      ]);

      const metrics = calculateMetrics(reservations, drivers);
      const trendData = generateMockTrendData();
      const performanceData = generateMockPerformanceData();
      const popularHours = generatePopularHoursData();

      const dashboardData: DashboardData = {
        metrics,
        reservationTrend: trendData.map(d => ({
          date: d.date,
          reservations: d.reservations,
          completed: d.completed,
          cancelled: d.cancelled
        })),
        revenueTrend: trendData.map(d => ({
          date: d.date,
          revenue: d.revenue,
          driverShare: d.driverShare,
          companyShare: d.companyShare
        })),
        popularHours,
        vehiclePerformance: performanceData.vehiclePerformance,
        driverPerformance: performanceData.driverPerformance,
        lastUpdated: new Date()
      };

      setDashboardData(dashboardData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [calculateMetrics, generateMockTrendData, generateMockPerformanceData, generatePopularHoursData]);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time data updates every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const refetch = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    lastUpdated,
    refetch
  };
};