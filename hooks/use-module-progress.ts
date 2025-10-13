"use client"

import { useState, useEffect, useCallback } from "react"
import { moduleProgressApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useModuleProgress() {
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const [courseProgress, setCourseProgress] = useState<Record<number, number>>({}) // courseId -> progress percentage
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch all completed modules for the user
  const fetchCompletedModules = useCallback(async () => {
    try {
      setLoading(true)
      const modules = await moduleProgressApi.getUserCompletedModules()
      setCompletedModules(modules)
      return modules
    } catch (error) {
      console.error("Failed to fetch completed modules:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Mark a module as completed
  const markModuleCompleted = useCallback(async (moduleId: number) => {
    try {
      await moduleProgressApi.markModuleCompleted(moduleId)
      setCompletedModules(prev => [...prev, moduleId])
      return true
    } catch (error) {
      console.error(`Failed to mark module ${moduleId} as completed:`, error)
      toast({
        title: "Error",
        description: "Failed to mark module as completed. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }, [toast])

  // Check if a module is completed
  const isModuleCompleted = useCallback((moduleId: number) => {
    return completedModules.includes(moduleId)
  }, [completedModules])

  // Get course progress percentage
  const getCourseProgress = useCallback(async (courseId: number) => {
    try {
      const progress = await moduleProgressApi.getCourseProgress(courseId)
      setCourseProgress(prev => ({
        ...prev,
        [courseId]: progress
      }))
      return progress
    } catch (error) {
      console.error(`Failed to get progress for course ${courseId}:`, error)
      return 0
    }
  }, [])

  // Load initial data
  useEffect(() => {
    fetchCompletedModules()
  }, [fetchCompletedModules])

  return {
    completedModules,
    courseProgress,
    loading,
    fetchCompletedModules,
    markModuleCompleted,
    isModuleCompleted,
    getCourseProgress,
  }
}