"use client"

import { useState, useEffect } from 'react'
import { studentDashboardApi, type DashboardData, type StudentStats } from '@/lib/api/student-dashboard'
import { useAuth } from '@/hooks/use-auth'

interface UseDashboardDataReturn {
  dashboardData: DashboardData | null
  stats: StudentStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { isAuthenticated, user } = useAuth()

  const fetchDashboardData = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const data = await studentDashboardApi.getDashboardData()
      setDashboardData(data)
      setStats(data.stats)
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
      
      // Fallback: try to fetch just stats
      try {
        const statsData = await studentDashboardApi.getStudentStats()
        setStats(statsData)
        setDashboardData({
          stats: statsData,
          enrolledCourses: [],
          upcomingQuizzes: []
        })
      } catch (statsErr) {
        console.error('Failed to fetch stats fallback:', statsErr)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [isAuthenticated, user])

  const refetch = async () => {
    await fetchDashboardData()
  }

  return {
    dashboardData,
    stats,
    isLoading,
    error,
    refetch
  }
}

// Hook for just stats (lighter weight)
export const useStudentStats = () => {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { isAuthenticated, user } = useAuth()

  const fetchStats = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await studentDashboardApi.getStudentStats()
      setStats(data)
    } catch (err: any) {
      console.error('Failed to fetch student stats:', err)
      setError(err.message || 'Failed to load student statistics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [isAuthenticated, user])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  }
}