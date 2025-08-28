"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CreateCourse() {
  const [course, setCourse] = useState({
    title: "",
    about: "",
    outcomes: [""],
    modules: [{ title: "", content: "" }],
    quizzes: [""],
    prerequisites: [""],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCourse({ ...course, [e.target.name]: e.target.value })
  }

  const handleArrayChange = (field: string, index: number, value: string, subfield?: string) => {
    const updated = [...(course as any)[field]]
    if (subfield) {
      updated[index][subfield] = value
    } else {
      updated[index] = value
    }
    setCourse({ ...course, [field]: updated })
  }

  const addField = (field: string, emptyValue: any) => {
    setCourse({ ...course, [field]: [...(course as any)[field], emptyValue] })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Course Data:", course)
    // TODO: send course to backend API
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md border border-blue-200/40 shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Create New Course</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            type="text"
            name="title"
            placeholder="Course Title"
            value={course.title}
            onChange={handleChange}
            className="h-12 rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400"
          />

          {/* About */}
          <Textarea
            name="about"
            placeholder="About this course"
            value={course.about}
            onChange={handleChange}
            className="min-h-[100px] rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400"
          />

          {/* Outcomes */}
          <div>
            <h2 className="font-semibold text-blue-700 mb-2">Learning Outcomes</h2>
            {course.outcomes.map((outcome, i) => (
              <Input
                key={i}
                type="text"
                placeholder={`Outcome ${i + 1}`}
                value={outcome}
                onChange={(e) => handleArrayChange("outcomes", i, e.target.value)}
                className="mb-2 h-11 rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400"
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => addField("outcomes", "")}
              className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Outcome
            </Button>
          </div>

          {/* Modules */}
          <div>
            <h2 className="font-semibold text-blue-700 mb-2">Modules</h2>
            {course.modules.map((module, i) => (
              <div key={i} className="border border-blue-200 rounded-xl p-4 mb-3 bg-blue-50/30">
                <Input
                  type="text"
                  placeholder="Module Title"
                  value={module.title}
                  onChange={(e) => handleArrayChange("modules", i, e.target.value, "title")}
                  className="mb-3 h-11 rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400"
                />
                <Textarea
                  placeholder="Module Content (text, video links, images)"
                  value={module.content}
                  onChange={(e) => handleArrayChange("modules", i, e.target.value, "content")}
                  className="rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
            <Button
              type="button"
              onClick={() => addField("modules", { title: "", content: "" })}
              className="bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Module
            </Button>
          </div>

          {/* Quizzes */}
          <div>
            <h2 className="font-semibold text-blue-700 mb-2">Quizzes</h2>
            {course.quizzes.map((quiz, i) => (
              <Input
                key={i}
                type="text"
                placeholder={`Quiz ${i + 1}`}
                value={quiz}
                onChange={(e) => handleArrayChange("quizzes", i, e.target.value)}
                className="mb-2 h-11 rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400"
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => addField("quizzes", "")}
              className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Quiz
            </Button>
          </div>

          {/* Prerequisites */}
          <div>
            <h2 className="font-semibold text-blue-700 mb-2">Prerequisite Courses</h2>
            {course.prerequisites.map((pre, i) => (
              <Input
                key={i}
                type="text"
                placeholder={`Prerequisite ${i + 1}`}
                value={pre}
                onChange={(e) => handleArrayChange("prerequisites", i, e.target.value)}
                className="mb-2 h-11 rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400"
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => addField("prerequisites", "")}
              className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Prerequisite
            </Button>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md"
          >
            Create Course
          </Button>
        </form>
      </div>
    </div>
  )
}