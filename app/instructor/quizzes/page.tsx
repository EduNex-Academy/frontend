"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface Quiz {
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  module: string;
  marks: number;
  duration: string;
  status: "Ongoing" | "Finished" | "Incoming";
}

export default function InstructorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      title: "React Basics",
      description: "Test your knowledge on React fundamentals.",
      dueDate: "2025-09-10",
      totalMarks: 50,
      module: "Module 1: Introduction to React",
      marks: 50,
      duration: "45 min",
      status: "Ongoing",
    },
    {
      title: "Node.js Advanced",
      description: "Backend quiz on Node.js and Express.",
      dueDate: "2025-08-20",
      totalMarks: 40,
      module: "Module 3: Node.js & Express",
      marks: 40,
      duration: "60 min",
      status: "Finished",
    },
    {
      title: "UI/UX Quiz",
      description: "Quiz on design principles and usability.",
      dueDate: "2025-09-20",
      totalMarks: 30,
      module: "Module 2: UI/UX Design",
      marks: 30,
      duration: "30 min",
      status: "Incoming",
    },
  ]);

  const [newQuiz, setNewQuiz] = useState({
  title: "",
  description: "",
  dueDate: "",
  totalMarks: "",
  module: "",
  marks: "",
  duration: "",
  status: "Ongoing" as "Ongoing" | "Finished" | "Incoming",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setNewQuiz({ ...newQuiz, [name]: value });
  };

  const addQuiz = () => {
    if (!newQuiz.title || !newQuiz.dueDate || !newQuiz.totalMarks || !newQuiz.module || !newQuiz.marks || !newQuiz.duration || !newQuiz.status) return;

    setQuizzes([
      ...quizzes,
      {
        title: newQuiz.title,
        description: newQuiz.description,
        dueDate: newQuiz.dueDate,
        totalMarks: Number(newQuiz.totalMarks),
        module: newQuiz.module,
        marks: Number(newQuiz.marks),
        duration: newQuiz.duration,
        status: newQuiz.status as "Ongoing" | "Finished" | "Incoming",
      },
    ]);

    setNewQuiz({ title: "", description: "", dueDate: "", totalMarks: "", module: "", marks: "", duration: "", status: "Ongoing" });
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-blue-900">Quizzes</h1>

        {/* Existing Quizzes */}
        <div className="space-y-4">
          {quizzes.map((quiz, i) => (
            <Card key={i} className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-700">{quiz.description}</p>
                <p className="text-gray-600 text-sm">Module: {quiz.module}</p>
                <p className="text-gray-600 text-sm">Due Date: {quiz.dueDate}</p>
                <p className="text-gray-600 text-sm">Duration: {quiz.duration}</p>
                <p className="text-gray-600 text-sm">Marks: {quiz.marks}</p>
                <p className="text-gray-600 text-sm">Total Marks: {quiz.totalMarks}</p>
                <p className={`font-semibold
                  ${quiz.status === "Ongoing" ? "text-green-600" : quiz.status === "Incoming" ? "text-blue-600" : "text-gray-500"}`}
                >
                  {quiz.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Add New Quiz */}
        <Card className="shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Add New Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Title</p>
              <Input
                name="title"
                value={newQuiz.title}
                onChange={handleChange}
                placeholder="Quiz Title"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <Textarea
                name="description"
                value={newQuiz.description}
                onChange={handleChange}
                placeholder="Quiz Description"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Module</p>
              <Input
                name="module"
                value={newQuiz.module}
                onChange={handleChange}
                placeholder="Module Name"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <Input
                type="date"
                name="dueDate"
                value={newQuiz.dueDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <Input
                name="duration"
                value={newQuiz.duration}
                onChange={handleChange}
                placeholder="e.g. 45 min"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Marks</p>
              <Input
                type="number"
                name="marks"
                value={newQuiz.marks}
                onChange={handleChange}
                placeholder="Marks"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Marks</p>
              <Input
                type="number"
                name="totalMarks"
                value={newQuiz.totalMarks}
                onChange={handleChange}
                placeholder="Total Marks"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <select
                name="status"
                value={newQuiz.status}
                onChange={e => setNewQuiz({ ...newQuiz, status: e.target.value as "Ongoing" | "Finished" | "Incoming" })}
                className="w-full p-2 rounded border border-blue-200"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Finished">Finished</option>
                <option value="Incoming">Incoming</option>
              </select>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={addQuiz}>
              Add Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
