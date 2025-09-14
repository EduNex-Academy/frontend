"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
    Search,
    Plus,
    FilterX
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { CourseCard } from "@/components/common/CourseCard"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CourseDTO, COURSE_CATEGORIES, COURSE_LEVELS, LEARNING_PATHS } from "@/types/course"
import { courseApi } from "@/lib/api/course"
import { useToast } from "@/hooks/use-toast"

const levels = [
    "All Levels",
    "beginner",
    "intermediate",
    "advanced"
]

interface CoursesPageLayoutProps {
    userRole: 'STUDENT' | 'INSTRUCTOR'
    initialQuery?: string
}

export function CoursesPageLayout({ userRole, initialQuery = '' }: CoursesPageLayoutProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Initialize filters from URL parameters
    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || "All Categories")
    const [selectedLevel, setSelectedLevel] = useState(searchParams?.get('level') || "All Levels")
    const [selectedLearningPath, setSelectedLearningPath] = useState(searchParams?.get('path') || "All Paths")
    const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>(
        (searchParams?.get('price') as 'all' | 'free' | 'paid') || 'all'
    )
    const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'price-low' | 'price-high'>(
        (searchParams?.get('sort') as any) || 'popular'
    )
    const [courses, setCourses] = useState<CourseDTO[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialQuery)

    const isInstructor = userRole === 'INSTRUCTOR'
    
    // Debounce search query updates
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 500) // Wait 500ms after typing stops
        
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Update URL when search query changes
    useEffect(() => {
        // Always update URL with current filters (even if query is empty)
        const basePath = isInstructor ? '/instructor/courses' : '/student/courses'
        const params = new URLSearchParams()
        
        if (searchQuery) params.set('q', searchQuery)
        if (selectedCategory !== "All Categories") params.set('category', selectedCategory)
        if (selectedLevel !== "All Levels") params.set('level', selectedLevel)
        if (selectedLearningPath !== "All Paths") params.set('path', selectedLearningPath)
        if (priceFilter !== 'all') params.set('price', priceFilter)
        if (sortBy !== 'popular') params.set('sort', sortBy)
        
        const queryString = params.toString()
        router.push(`${basePath}${queryString ? `?${queryString}` : ''}`, { scroll: false })
    }, [debouncedSearchQuery, selectedCategory, selectedLevel, selectedLearningPath, priceFilter, sortBy, router, isInstructor])

    // Fetch courses when filters change
    useEffect(() => {
        fetchCourses()
    }, [debouncedSearchQuery, selectedCategory, selectedLevel, selectedLearningPath, priceFilter, sortBy])
    
    const fetchCourses = async () => {
        try {
            setLoading(true)
            setError(null)
            
            // Build query params based on filters
            let query = debouncedSearchQuery || ''
            if (selectedCategory !== "All Categories") {
                query += ` category:${selectedCategory}`
            }
            if (selectedLevel !== "All Levels") {
                query += ` level:${selectedLevel}`
            }
            if (selectedLearningPath !== "All Paths") {
                query += ` path:${selectedLearningPath}`
            }
            
            const coursesData = await courseApi.getAllCourses(query)
            console.log('Fetched courses:', coursesData)
            setCourses(coursesData)
        } catch (err: any) {
            console.error('Error fetching courses:', err)
            setError(err.message || 'Failed to fetch courses')
            
            // Toast notification handled in the catch block
        } finally {
            setLoading(false)
        }
    }

    const clearFilters = () => {
        // Reset all filter states
        setSearchQuery('')
        setSelectedCategory("All Categories")
        setSelectedLevel("All Levels")
        setSelectedLearningPath("All Paths")
        setPriceFilter('all')
        setSortBy('popular')
        
        // Clear URL parameters
        const basePath = isInstructor ? '/instructor/courses' : '/student/courses'
        router.push(basePath)
    }

    const activeFiltersCount = [
        selectedCategory !== "All Categories",
        selectedLevel !== "All Levels",
        selectedLearningPath !== "All Paths",
        priceFilter !== 'all'
    ].filter(Boolean).length
    
    // Filter and sort courses based on selected filters
    const filteredCourses = courses
        .filter(course => {
            // Price filter (in a real app, this would be handled by the API)
            if (priceFilter === 'free') {
                // Since we don't have price in CourseDTO, we'll use moduleCount as a proxy
                // This is just an example - in a real app, you'd use actual pricing data
                return (course.moduleCount || 0) <= 1
            } else if (priceFilter === 'paid') {
                return (course.moduleCount || 0) > 1
            }
            return true
        })
        .sort((a, b) => {
            // Sort by
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case 'popular':
                    return (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
                case 'rating':
                    // Since we don't have ratings, we'll use enrollment as a proxy for popularity
                    return (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
                case 'price-low':
                    return (a.moduleCount || 0) - (b.moduleCount || 0)
                case 'price-high':
                    return (b.moduleCount || 0) - (a.moduleCount || 0)
                default:
                    return 0
            }
        })

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {isInstructor ? 'All Courses' : 'Browse Courses'}
                            </h1>
                            <p className="text-gray-600">
                                {isInstructor
                                    ? 'Explore courses and manage your teaching content'
                                    : 'Discover and learn from our extensive collection of courses'
                                }
                            </p>
                        </div>
                        {isInstructor && (
                            <Link href="/instructor/create_course">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Course
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Search and Filters Bar */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200/30 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Modern Search Input */}
                        <div className="flex-1 max-w-2xl">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
                                <Input
                                    type="search"
                                    placeholder="Search courses, instructors, topics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 h-12 bg-transparent border-0 ring-1 ring-blue-200/30 rounded-full placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-blue-400/40 focus:bg-background/50 transition-all duration-300 hover:ring-blue-300/50 text-base"
                                />
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex flex-wrap lg:flex-nowrap gap-3">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full lg:w-[180px] h-12 rounded-full border-0 ring-1 ring-blue-200/30 hover:ring-blue-300/40 focus:ring-2 focus:ring-blue-400/40 transition-all duration-200">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COURSE_CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger className="w-full lg:w-[140px] h-12 rounded-full border-0 ring-1 ring-blue-200/30 hover:ring-blue-300/40 focus:ring-2 focus:ring-blue-400/40 transition-all duration-200">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {levels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level === "All Levels" ? level : level.charAt(0).toUpperCase() + level.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedLearningPath} onValueChange={setSelectedLearningPath}>
                                <SelectTrigger className="w-full lg:w-[180px] h-12 rounded-full border-0 ring-1 ring-blue-200/30 hover:ring-blue-300/40 focus:ring-2 focus:ring-blue-400/40 transition-all duration-200">
                                    <SelectValue placeholder="Learning Path" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEARNING_PATHS.map((path) => (
                                        <SelectItem key={path} value={path}>
                                            {path}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={priceFilter} onValueChange={(value: any) => setPriceFilter(value)}>
                                <SelectTrigger className="w-full lg:w-[120px] h-12 rounded-full border-0 ring-1 ring-blue-200/30 hover:ring-blue-300/40 focus:ring-2 focus:ring-blue-400/40 transition-all duration-200">
                                    <SelectValue placeholder="Price" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Results Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                        </span>
                        {searchQuery && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                for "{searchQuery}"
                            </Badge>
                        )}
                        {loading && <span className="text-blue-600 text-sm ml-2">Loading...</span>}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                            <SelectTrigger className="w-[160px] h-10 rounded-full border-0 ring-1 ring-blue-200/30 hover:ring-blue-300/40 focus:ring-2 focus:ring-blue-400/40 transition-all duration-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {selectedCategory !== "All Categories" && (
                            <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 rounded-full px-3 py-1 border border-blue-200/50"
                                onClick={() => setSelectedCategory("All Categories")}
                            >
                                {selectedCategory} ×
                            </Badge>
                        )}
                        {selectedLevel !== "All Levels" && (
                            <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 rounded-full px-3 py-1 border border-blue-200/50"
                                onClick={() => setSelectedLevel("All Levels")}
                            >
                                {selectedLevel} ×
                            </Badge>
                        )}
                        {selectedLearningPath !== "All Paths" && (
                            <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 rounded-full px-3 py-1 border border-blue-200/50"
                                onClick={() => setSelectedLearningPath("All Paths")}
                            >
                                {selectedLearningPath} ×
                            </Badge>
                        )}
                        {priceFilter !== 'all' && (
                            <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 rounded-full px-3 py-1 border border-blue-200/50"
                                onClick={() => setPriceFilter('all')}
                            >
                                {priceFilter === 'free' ? 'Free' : 'Paid'} ×
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full px-3 py-1 h-auto text-xs"
                        >
                            Clear all
                        </Button>
                    </div>
                )}

                {/* Courses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {loading ? (
                        // Loading state - show skeleton cards
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
                        ))
                    ) : courses.length > 0 ? (
                        // Show courses
                        courses.map((course: CourseDTO) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                userRole={userRole}
                            />
                        ))
                    ) : (
                        // No courses found
                        <div className="col-span-full text-center py-12">
                            <div className="max-w-md mx-auto">
                                <FilterX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No courses found
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {error ? error : "Try adjusting your search criteria or filters"}
                                </p>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
