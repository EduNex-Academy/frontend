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
  status: "Ongoing" | "Finished";
}

export default function InstructorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      title: "React Basics",
      description: "Test your knowledge on React fundamentals.",
      dueDate: "2025-09-10",
      totalMarks: 50,
      status: "Ongoing",
    },
    {
      title: "Node.js Advanced",
      description: "Backend quiz on Node.js and Express.",
      dueDate: "2025-08-20",
      totalMarks: 40,
      status: "Finished",
    },
  ]);

  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    dueDate: "",
    totalMarks: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewQuiz({ ...newQuiz, [name]: value });
  };

  const addQuiz = () => {
    if (!newQuiz.title || !newQuiz.dueDate || !newQuiz.totalMarks) return;

    setQuizzes([
      ...quizzes,
      {
        title: newQuiz.title,
        description: newQuiz.description,
        dueDate: newQuiz.dueDate,
        totalMarks: Number(newQuiz.totalMarks),
        status: "Ongoing",
      },
    ]);

    setNewQuiz({ title: "", description: "", dueDate: "", totalMarks: "" });
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
                <p className="text-gray-600 text-sm">Due Date: {quiz.dueDate}</p>
                <p className="text-gray-600 text-sm">Total Marks: {quiz.totalMarks}</p>
                <p className={`font-semibold ${quiz.status === "Ongoing" ? "text-green-600" : "text-gray-500"}`}>
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
              <p className="text-sm text-gray-600">Due Date</p>
              <Input
                type="date"
                name="dueDate"
                value={newQuiz.dueDate}
                onChange={handleChange}
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={addQuiz}>
              Add Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
