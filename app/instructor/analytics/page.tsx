"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { 
  Calendar,
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Filter, 
  Grid, 
  Layout, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Users,
  BookOpen,
  Layers,
  Target,
  TrendingUp,
  Zap,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { instructorAnalyticsApi, InstructorDashboardStatistics } from "@/lib/api/instructor-analytics";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function InstructorAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<InstructorDashboardStatistics | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  
  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await instructorAnalyticsApi.getDashboardStatistics(user.id, timeframe);
      setAnalytics(data);
      
      // Set the first course as selected by default if there are courses
      if (data?.enrollment?.courseEnrollments?.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data.enrollment.courseEnrollments[0].courseId);
      }
    } catch (error) {
      toast({
        title: "Error fetching analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, timeframe, selectedCourseId]);
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);
  
  const getSelectedCourseData = () => {
    if (!selectedCourseId || !analytics || !analytics.enrollment?.courseEnrollments) return null;
    return analytics.enrollment.courseEnrollments.find(c => c.courseId === selectedCourseId);
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  const getColorByCompletionRate = (rate: number) => {
    if (rate >= 75) return "bg-green-100 text-green-800";
    if (rate >= 50) return "bg-blue-100 text-blue-800";
    if (rate >= 25) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  
  const getCompletionColor = (rate: number) => {
    if (rate >= 75) return "bg-green-100 [&>div]:bg-green-500";
    if (rate >= 50) return "bg-blue-100 [&>div]:bg-blue-500";
    if (rate >= 25) return "bg-yellow-100 [&>div]:bg-yellow-500";
    return "bg-red-100 [&>div]:bg-red-500";
  };
  
  const ENROLLMENT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-blue-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Instructor Analytics</h1>
            <p className="text-slate-500 mt-1">Comprehensive insights into your courses and student engagement</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as any)}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 4 Weeks</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchAnalyticsData}
              className="bg-white"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="shadow-sm border-blue-100">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="shadow-sm border-blue-100 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-900">{analytics?.totalStudents || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Across all courses</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-blue-100 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Total Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-900">{analytics?.totalCourses || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Currently teaching</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-blue-100 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Total Modules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-900">{analytics?.totalModules || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Across all courses</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-blue-100 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Avg. Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatPercentage(analytics?.averageCompletionRate || 0)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Overall course completion</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="enrollment" className="w-full">
          <TabsList className="grid w-full md:w-fit grid-cols-4 md:grid-cols-4 mb-4 bg-white">
            <TabsTrigger value="enrollment" className="flex items-center gap-1">
              <Users className="h-4 w-4 hidden sm:block" /> 
              <span className="sm:block">Enrollments</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 hidden sm:block" />
              <span className="sm:block">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-1">
              <Zap className="h-4 w-4 hidden sm:block" />
              <span className="sm:block">Engagement</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 hidden sm:block" />
              <span className="sm:block">Courses</span>
            </TabsTrigger>
          </TabsList>

          {/* Enrollments Tab */}
          <TabsContent value="enrollment" className="space-y-6">
            {loading ? (
              <>
                <Card className="shadow-sm border-blue-100">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="shadow-sm border-blue-100 col-span-1 lg:col-span-2 bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">Enrollment Trends</CardTitle>
                      <CardDescription>Student enrollments over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                          data={analytics?.enrollment.enrollmentTrends || []}
                          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="period" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <RechartsTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-3 rounded shadow-md border border-slate-200">
                                    <p className="font-medium text-slate-800">{`${label}`}</p>
                                    <p className="text-blue-600 font-bold">{`${payload[0].value} enrollments`}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorEnrollment)" 
                            activeDot={{ r: 6, strokeWidth: 1, stroke: "#fff" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-blue-100 bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">Distribution by Course</CardTitle>
                      <CardDescription>Student enrollment breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={analytics?.enrollment.courseEnrollments || []}
                              dataKey="enrollmentCount"
                              nameKey="courseTitle"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {analytics?.enrollment.courseEnrollments.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={ENROLLMENT_COLORS[index % ENROLLMENT_COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} />
                            <RechartsTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-3 rounded shadow-md border border-slate-200">
                                      <p className="font-medium text-slate-800">{data.courseTitle}</p>
                                      <p className="text-blue-600 font-bold">{`${data.enrollmentCount} students`}</p>
                                      <p className="text-sm text-slate-500">{`${formatPercentage(data.completionRate)} completed`}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-sm border-blue-100 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900">Recent Enrollments</CardTitle>
                    <CardDescription>Latest students who joined your courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Date Enrolled
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Completion
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {(analytics?.recentEnrollments || []).map((enrollment) => (
                            <tr key={enrollment.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                {enrollment.userName || 'Unknown Student'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                {enrollment.courseTitle || `Course #${enrollment.courseId}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={enrollment.completionPercentage} 
                                    className={`h-2 w-24 ${
                                      enrollment.completionPercentage >= 75 ? "bg-green-100 [&>div]:bg-green-500" :
                                      enrollment.completionPercentage >= 50 ? "bg-blue-100 [&>div]:bg-blue-500" :
                                      enrollment.completionPercentage >= 25 ? "bg-yellow-100 [&>div]:bg-yellow-500" : "bg-red-100 [&>div]:bg-red-500"
                                    }`}
                                  />
                                  <span className="text-slate-700">
                                    {formatPercentage(enrollment.completionPercentage)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(analytics?.recentEnrollments || []).length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                                No recent enrollments
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {loading ? (
              <>
                <Card className="shadow-sm border-blue-100">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm border-blue-100 bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">Completion Rates by Course</CardTitle>
                      <CardDescription>Average completion percentage across courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={analytics?.progress.courseCompletionRates || []}
                          margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                          layout="vertical"
                        >
                          <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                          <YAxis dataKey="courseTitle" type="category" width={100} tick={{ fontSize: 12 }} />
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 rounded shadow-md border border-slate-200">
                                    <p className="font-medium text-slate-800">{data.courseTitle}</p>
                                    <p className="text-blue-600 font-bold">{`${formatPercentage(data.completionRate)}`}</p>
                                    <p className="text-sm text-slate-500">{`${data.studentsCompleted} of ${data.totalStudents} students completed`}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="completionRate" 
                            barSize={20}
                            radius={[0, 4, 4, 0]}
                            fill="#3b82f6"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-blue-100 bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">Student Completion Status</CardTitle>
                      <CardDescription>Students who fully completed courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(analytics?.progress.courseCompletionRates || []).map((course) => (
                          <div key={course.courseId} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-700">{course.courseTitle}</span>
                              <span className="text-sm text-slate-500">
                                {course.studentsCompleted} of {course.totalStudents} completed
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(course.studentsCompleted / (course.totalStudents || 1)) * 100} 
                                className={`h-2 ${getCompletionColor(course.completionRate)}`}
                              />
                              <span className="text-xs font-medium text-slate-500">
                                {((course.studentsCompleted / (course.totalStudents || 1)) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                        {(analytics?.progress.courseCompletionRates || []).length === 0 && (
                          <p className="text-center text-slate-500 py-10">No course completion data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-sm border-blue-100 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900">Module Completion Analysis</CardTitle>
                    <CardDescription>Detailed breakdown of module completion across courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {(analytics?.enrollment.courseEnrollments || []).map((course) => (
                        <Badge 
                          key={course.courseId}
                          variant={selectedCourseId === course.courseId ? "default" : "outline"}
                          className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                          onClick={() => setSelectedCourseId(course.courseId)}
                        >
                          {course.courseTitle}
                        </Badge>
                      ))}
                    </div>

                    {selectedCourseId ? (
                      <div className="text-center text-slate-500">
                        <p className="py-10">Module-level data is not yet available. Coming soon!</p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <p className="py-10">Please select a course to view module details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            {loading ? (
              <>
                <Card className="shadow-sm border-blue-100">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm border-blue-100 bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">Most Engaged Courses</CardTitle>
                      <CardDescription>Courses with highest student engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(analytics?.engagement.mostEngagedCourses || []).map((course, index) => (
                          <div key={course.courseId} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0 ? "bg-yellow-100 text-yellow-700" :
                              index === 1 ? "bg-slate-100 text-slate-700" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              <span className="font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-800">{course.courseTitle}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress 
                                  value={course.engagementScore} 
                                  className="h-1.5 bg-blue-100 [&>div]:bg-blue-600"
                                />
                                <span className="text-xs text-slate-500">
                                  {formatPercentage(course.engagementScore)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(analytics?.engagement.mostEngagedCourses || []).length === 0 && (
                          <p className="text-center text-slate-500 py-10">No engagement data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-blue-100 bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">Time Spent by Course</CardTitle>
                      <CardDescription>Average time students spend on each course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={analytics?.engagement.averageTimeSpent || []}
                          margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="courseTitle"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            tickFormatter={(tick) => `${tick} min`}
                          />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 rounded shadow-md border border-slate-200">
                                    <p className="font-medium text-slate-800">{data.courseTitle}</p>
                                    <p className="text-blue-600 font-bold">{`${data.averageMinutes} minutes`}</p>
                                    <p className="text-sm text-slate-500">Average time spent</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="averageMinutes"
                            fill="#8b5cf6"
                            barSize={30}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-sm border-blue-100 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900">Course Engagement Analysis</CardTitle>
                    <CardDescription>Multi-factor engagement metrics across courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={150} data={analytics?.enrollment.courseEnrollments.map(course => ({
                          courseTitle: course.courseTitle,
                          students: course.enrollmentCount,
                          completion: course.completionRate,
                          engagement: Math.random() * 100, // Placeholder for real engagement data
                          retention: Math.random() * 100, // Placeholder for real retention data
                        })) || []}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="courseTitle" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <RechartsTooltip />
                          <Radar name="Students" dataKey="students" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.5} />
                          <Radar name="Completion" dataKey="completion" stroke="#0e7490" fill="#0ea5e9" fillOpacity={0.5} />
                          <Radar name="Engagement" dataKey="engagement" stroke="#7e22ce" fill="#a855f7" fillOpacity={0.5} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {loading ? (
              <>
                <Card className="shadow-sm border-blue-100">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6">
                  <Card className="shadow-sm border-blue-100 bg-white">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg text-blue-900">Course Performance Overview</CardTitle>
                      <CardDescription>Comprehensive statistics for all your courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto mt-4">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Course
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Students
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Completion
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {(analytics?.enrollment.courseEnrollments || []).map((course) => (
                              <tr key={course.courseId} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                                  {course.courseTitle}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                  {course.enrollmentCount} students
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-2">
                                    <Progress 
                                      value={course.completionRate} 
                                      className={`h-2 w-24 ${getCompletionColor(course.completionRate)}`}
                                    />
                                    <span className="text-slate-700">
                                      {formatPercentage(course.completionRate)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <Badge className={getColorByCompletionRate(course.completionRate)}>
                                    {course.completionRate >= 75 ? "Excellent" : 
                                     course.completionRate >= 50 ? "Good" : 
                                     course.completionRate >= 25 ? "Average" : "Needs Attention"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                            {(analytics?.enrollment.courseEnrollments || []).length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                                  No courses available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm border-blue-100 bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">Students Growth</CardTitle>
                      <CardDescription>New students over time period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={analytics?.enrollment.enrollmentTrends || []}
                          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="period" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-3 rounded shadow-md border border-slate-200">
                                    <p className="font-medium text-slate-800">{`${label}`}</p>
                                    <p className="text-blue-600 font-bold">{`${payload[0].value} new students`}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2, stroke: "#3b82f6", fill: "white" }}
                            activeDot={{ r: 6, strokeWidth: 2, stroke: "#3b82f6", fill: "white" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-blue-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-lg text-blue-900">Course Achievements</CardTitle>
                        <CardDescription>Milestones and stats</CardDescription>
                      </div>
                      <Award className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h3 className="font-medium text-slate-800 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" /> Most Popular Course
                          </h3>
                          {analytics?.enrollment?.courseEnrollments?.[0] && (
                            <div className="mt-2 space-y-1">
                              <p className="font-bold text-blue-700">
                                {analytics?.enrollment?.courseEnrollments[0]?.courseTitle}
                              </p>
                              <p className="text-sm text-slate-600">
                                {analytics?.enrollment?.courseEnrollments[0]?.enrollmentCount} students enrolled
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h3 className="font-medium text-slate-800 flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" /> Highest Completion Rate
                          </h3>
                          {analytics?.progress?.courseCompletionRates && 
                           analytics.progress.courseCompletionRates.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="font-bold text-green-700">
                                {analytics.progress.courseCompletionRates[0]?.courseTitle}
                              </p>
                              <p className="text-sm text-slate-600">
                                {formatPercentage(analytics.progress.courseCompletionRates[0]?.completionRate || 0)} average completion
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h3 className="font-medium text-slate-800 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-500" /> Most Time Spent
                          </h3>
                          {analytics?.engagement?.averageTimeSpent?.[0] && (
                            <div className="mt-2 space-y-1">
                              <p className="font-bold text-purple-700">
                                {analytics?.engagement?.averageTimeSpent[0]?.courseTitle}
                              </p>
                              <p className="text-sm text-slate-600">
                                {analytics?.engagement?.averageTimeSpent[0]?.averageMinutes} minutes average time
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
