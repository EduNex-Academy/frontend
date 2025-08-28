/*export default function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900"> Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your courses and students</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Courses</h3>
            <p className="text-gray-600">Create and manage your courses</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
            <p className="text-gray-600">View enrolled students and their progress</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">Track course performance and engagement</p>
          </div>
        </div>
      </div>
    </div>
  )
}
*/
import Link from "next/link";

export default function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your courses and students</p>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* My Courses */}
          <Link href="/instructor/courses">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-blue-50 transition">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Courses</h3>
              <p className="text-gray-600">Create and manage your courses</p>
            </div>
          </Link>

          {/* Students */}
          <Link href="/instructor/students">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-blue-50 transition">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
              <p className="text-gray-600">View enrolled students and their progress</p>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/instructor/analytics">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-blue-50 transition">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">Track course performance and engagement</p>
            </div>
          </Link>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-gray-700">Total Students</p>
                <p className="text-2xl font-bold text-blue-800">120</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-gray-700">Ongoing Courses</p>
                <p className="text-2xl font-bold text-blue-800">5</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-gray-700">Finished Assignments</p>
                <p className="text-2xl font-bold text-blue-800">18</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-gray-700">Recent Submissions</p>
                <p className="text-2xl font-bold text-blue-800">32</p>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Announcements</h3>
            <ul className="space-y-2 text-gray-700">
              <li>📌 Don't forget to review student submissions weekly.</li>
              <li>📌 New course materials can be uploaded in your courses section.</li>
              <li>📌 Engage with students via messages to improve retention.</li>
              <li>📌 Check analytics to monitor course performance trends.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
