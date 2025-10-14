'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import {
  InstructorDashboardStatistics,
  instructorAnalyticsApi,
} from '@/lib/api/instructor-analytics';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  FileText,
  Layers,
  Percent,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Timeframe = 'week' | 'month' | 'quarter' | 'year';

const timeframeLabels: Record<Timeframe, string> = {
  week: 'Last 7 days',
  month: 'Last 4 weeks',
  quarter: 'Last quarter',
  year: 'Last 12 months',
};

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] =
    useState<InstructorDashboardStatistics | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await instructorAnalyticsApi.getDashboardStatistics(
        user.id,
        timeframe,
      );
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load instructor dashboard', err);
      setError(err?.message ?? 'Something went wrong while loading data.');
    } finally {
      setLoading(false);
    }
  }, [timeframe, user?.id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const enrollmentTrend = useMemo(() => {
    if (!analytics?.enrollment?.enrollmentTrends?.length) {
      return { latest: 0, delta: 0 };
    }

    const data = analytics.enrollment.enrollmentTrends;
    const current = data[data.length - 1]?.count ?? 0;
    const previous = data[data.length - 2]?.count ?? 0;
    const delta = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

    return { latest: current, delta };
  }, [analytics?.enrollment?.enrollmentTrends]);

  const courseHighlights = useMemo(() => {
    const enrollments = analytics?.enrollment?.courseEnrollments ?? [];
    const completions = analytics?.progress?.courseCompletionRates ?? [];

    const merged = enrollments.map((course) => {
      const completion = completions.find((c) => c.courseId === course.courseId);
      return {
        ...course,
        completionRate: completion?.completionRate ?? course.completionRate ?? 0,
        totalStudents: completion?.totalStudents ?? course.enrollmentCount ?? 0,
        studentsCompleted: completion?.studentsCompleted ?? 0,
      };
    });

    return merged
      .sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0))
      .slice(0, 5);
  }, [analytics?.enrollment?.courseEnrollments, analytics?.progress?.courseCompletionRates]);

  const mostEngagedCourses = useMemo(() => {
    return (
      analytics?.engagement?.mostEngagedCourses?.slice(0, 4)?.sort(
        (a, b) => (b.engagementScore ?? 0) - (a.engagementScore ?? 0),
      ) ?? []
    );
  }, [analytics?.engagement?.mostEngagedCourses]);

  const renderNumber = (value?: number, options?: { suffix?: string; precision?: number }) => {
    if (value === undefined || value === null) {
      return '--';
    }
    const precision = options?.precision ?? 0;
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: precision,
      minimumFractionDigits: precision,
    });
    return `${formatter.format(value)}${options?.suffix ?? ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit border-blue-200 bg-blue-50 text-xs font-semibold uppercase tracking-widest text-blue-700">
              Instructor pulse
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
                Here’s the latest snapshot of your learning business for {timeframeLabels[timeframe]}.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={timeframe} onValueChange={(value: Timeframe) => setTimeframe(value)}>
              <SelectTrigger className="h-11 w-full min-w-[180px] bg-white/80 shadow-sm backdrop-blur">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 4 weeks</SelectItem>
                <SelectItem value="quarter">Last quarter</SelectItem>
                <SelectItem value="year">Last 12 months</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchDashboard} disabled={loading} className="h-11">
                Refresh
              </Button>
              <Button asChild className="h-11 bg-blue-600 hover:bg-blue-600/90">
                <Link href="/instructor/create_course">Create course</Link>
              </Button>
            </div>
          </div>
        </header>

        {error && (
          <Card className="border-destructive/40 bg-red-50/60">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-red-700">We hit a snag</CardTitle>
                <CardDescription className="text-red-600">
                  {error}
                </CardDescription>
              </div>
              <Button onClick={fetchDashboard}>Try again</Button>
            </CardHeader>
          </Card>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total learners"
            description="Unique students across all courses"
            icon={Users}
            loading={loading}
            value={renderNumber(analytics?.totalStudents)}
          />
          <SummaryCard
            title="Published courses"
            description="Active courses your learners can access"
            icon={BookOpen}
            loading={loading}
            value={renderNumber(analytics?.totalCourses)}
          />
          <SummaryCard
            title="Learning modules"
            description="Videos, quizzes and PDFs in your catalog"
            icon={Layers}
            loading={loading}
            value={renderNumber(analytics?.totalModules)}
          />
          <SummaryCard
            title="Avg. completion"
            description="Across all enrolled students"
            icon={Percent}
            loading={loading}
            value={renderNumber(analytics?.averageCompletionRate, { suffix: '%', precision: 1 })}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="overflow-hidden xl:col-span-2">
            <CardHeader className="flex flex-col gap-2 border-b bg-white/70 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Enrollment momentum
                  </CardTitle>
                  <CardDescription>
                    Track how many learners joined during {timeframeLabels[timeframe].toLowerCase()}.
                  </CardDescription>
                </div>
                <Badge className={`flex items-center gap-1 ${enrollmentTrend.delta >= 0 ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}`}>
                  <TrendingUp className="h-3.5 w-3.5" />
                  {enrollmentTrend.delta >= 0 ? '+' : ''}
                  {renderNumber(Math.abs(enrollmentTrend.delta), { suffix: '%', precision: 1 })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex h-[260px] items-center justify-center">
                  <Skeleton className="h-40 w-full max-w-xl" />
                </div>
              ) : analytics?.enrollment?.enrollmentTrends?.length ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.enrollment.enrollmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                      <XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          borderColor: '#bfdbfe',
                          boxShadow: '0 10px 25px -12px rgba(30,64,175,0.35)',
                        }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="Not enough data yet"
                  description="Once learners start enrolling, you'll see trends and projections here."
                />
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 border-t bg-slate-50/80 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Latest period: <strong>{renderNumber(enrollmentTrend.latest)}</strong> new enrollments
              </span>
              <Button asChild variant="ghost" className="h-9 text-blue-600 hover:text-blue-700">
                <Link href="/instructor/analytics" className="inline-flex items-center gap-2">
                  Dive deeper analytics <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-white/70 backdrop-blur">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Most engaged courses
              </CardTitle>
              <CardDescription>
                Engagement score blends attendance, progress and interaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : mostEngagedCourses.length ? (
                <ul className="space-y-4">
                  {mostEngagedCourses.map((course, index) => (
                    <li key={course.courseId} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/60 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {course.courseTitle}
                          </p>
                          <p className="text-xs text-slate-500">
                            Engagement score
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        {renderNumber(course.engagementScore, { precision: 1 })}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No engagement signals yet"
                  description="Run a live session or post a challenge to spark activity."
                />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="flex flex-col gap-2 border-b bg-white/70 backdrop-blur">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Course performance snapshot
              </CardTitle>
              <CardDescription>
                Enrollments and completion for your top courses.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full" />
                  ))}
                </div>
              ) : courseHighlights.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 uppercase text-xs text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Course</th>
                        <th className="px-6 py-4 font-semibold">Enrollments</th>
                        <th className="px-6 py-4 font-semibold">Completion</th>
                        <th className="px-6 py-4 font-semibold">Conversions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {courseHighlights.map((course) => (
                        <tr key={course.courseId} className="bg-white/70 backdrop-blur transition hover:bg-blue-50/40">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            <div className="flex flex-col">
                              <span>{course.courseTitle}</span>
                              <span className="text-xs text-slate-500">ID #{course.courseId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              {renderNumber(course.enrollmentCount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <Percent className="h-4 w-4 text-green-500" />
                              {renderNumber(course.completionRate, { suffix: '%', precision: 1 })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <AwardBadge completed={course.studentsCompleted} total={course.totalStudents} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={FileText}
                    title="No courses yet"
                    description="Create your first course to start receiving actionable analytics."
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2 border-t bg-slate-50/80">
              <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Link href="/instructor/courses">Manage courses</Link>
              </Button>
              <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Link href="/instructor/analytics">Compare cohorts</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        {!loading && !analytics && !error && (
          <EmptyState
            icon={Users}
            title="We don't have numbers for you yet"
            description="As soon as students enroll and engage with your courses, this dashboard will be buzzing with insights."
          />
        )}
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  value: string;
  loading?: boolean;
}

function SummaryCard({ title, description, icon: Icon, value, loading }: SummaryCardProps) {
  return (
    <Card className="relative overflow-hidden border-blue-100 bg-white/80 backdrop-blur transition hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="uppercase text-[11px] font-semibold tracking-widest text-blue-600">
            {title}
          </CardDescription>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Icon className="h-6 w-6" />
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className="text-3xl font-bold text-slate-900">{value}</div>
        )}
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-500">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function AwardBadge({ completed, total }: { completed: number; total: number }) {
  const ratio = total === 0 ? 0 : (completed / total) * 100;

  return (
    <Badge variant="outline" className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700">
      <ArrowUpRight className="h-3.5 w-3.5" />
      {renderAwardCopy(completed, total)}
      <span className="text-[11px] text-green-600/70">{ratio.toFixed(0)}%</span>
    </Badge>
  );
}

function renderAwardCopy(completed: number, total: number) {
  if (total === 0) {
    return 'No cohorts yet';
  }

  if (completed === total) {
    return 'Everybody completed';
  }

  if (completed === 0) {
    return 'In progress';
  }

  return `${completed}/${total} finished`;
}
