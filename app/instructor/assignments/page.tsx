"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  resources: string[];
}

export default function InstructorAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      title: "React Basics Assignment",
      description: "Complete exercises on React components and state management.",
      dueDate: "2025-09-10",
      totalMarks: 50,
      resources: ["https://reactjs.org/docs/getting-started.html"],
    },
    {
      id: 2,
      title: "Node.js Backend Project",
      description: "Build a REST API with Node.js and Express.",
      dueDate: "2025-08-15",
      totalMarks: 100,
      resources: ["https://expressjs.com/"],
    },
  ]);

  const [newAssignment, setNewAssignment] = useState<Assignment>({
    id: Date.now(),
    title: "",
    description: "",
    dueDate: "",
    totalMarks: 100,
    resources: [""],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAssignment({ ...newAssignment, [name]: value });
  };

  const handleResourceChange = (index: number, value: string) => {
    const updated = [...newAssignment.resources];
    updated[index] = value;
    setNewAssignment({ ...newAssignment, resources: updated });
  };

  const addResourceField = () => {
    setNewAssignment({ ...newAssignment, resources: [...newAssignment.resources, ""] });
  };

  const removeResourceField = (index: number) => {
    const updated = newAssignment.resources.filter((_, i) => i !== index);
    setNewAssignment({ ...newAssignment, resources: updated });
  };

  const createAssignment = () => {
    setAssignments([...assignments, newAssignment]);
    setNewAssignment({
      id: Date.now(),
      title: "",
      description: "",
      dueDate: "",
      totalMarks: 100,
      resources: [""],
    });
  };

  const deleteAssignment = (id: number) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  // Separate ongoing and finished assignments
  const today = new Date().toISOString().split("T")[0];
  const ongoingAssignments = assignments.filter(a => a.dueDate >= today);
  const finishedAssignments = assignments.filter(a => a.dueDate < today);

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-blue-900">Instructor Assignments</h1>

        {/* Ongoing Assignments */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Ongoing Assignments</h2>
          {ongoingAssignments.length === 0 ? (
            <p className="text-gray-700">No ongoing assignments.</p>
          ) : (
            ongoingAssignments.map(a => (
              <Card key={a.id} className="shadow-md border-blue-100 mb-4">
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-blue-900">{a.title}</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAssignment(a.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-gray-700">{a.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>Due: {a.dueDate}</span>
                    <span>Total Marks: {a.totalMarks}</span>
                  </div>
                  {a.resources.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600 font-medium">Resources:</p>
                      <ul className="list-disc list-inside text-gray-700">
                        {a.resources.map((res, i) => (
                          <li key={i}>
                            <a
                              href={res}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {res}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Finished Assignments */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Finished Assignments</h2>
          {finishedAssignments.length === 0 ? (
            <p className="text-gray-700">No finished assignments.</p>
          ) : (
            finishedAssignments.map(a => (
              <Card key={a.id} className="shadow-md border-gray-200 mb-4 bg-gray-50">
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-blue-900">{a.title}</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAssignment(a.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-gray-700">{a.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>Due: {a.dueDate}</span>
                    <span>Total Marks: {a.totalMarks}</span>
                  </div>
                  {a.resources.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600 font-medium">Resources:</p>
                      <ul className="list-disc list-inside text-gray-700">
                        {a.resources.map((res, i) => (
                          <li key={i}>
                            <a
                              href={res}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {res}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Separator />

        {/* Create New Assignment Form */}
        <Card className="shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Add New Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Title</p>
              <Input
                name="title"
                value={newAssignment.title}
                onChange={handleChange}
                placeholder="Assignment Title"
                className="w-full"
              />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <Textarea
                name="description"
                value={newAssignment.description}
                onChange={handleChange}
                placeholder="Assignment Description"
                className="w-full"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <Input
                  type="date"
                  name="dueDate"
                  value={newAssignment.dueDate}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Marks</p>
                <Input
                  type="number"
                  name="totalMarks"
                  value={newAssignment.totalMarks}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Resources (Links / URLs)</p>
              {newAssignment.resources.map((res, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={res}
                    onChange={(e) => handleResourceChange(i, e.target.value)}
                    placeholder={`Resource ${i + 1}`}
                    className="flex-1"
                  />
                  {i > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => removeResourceField(i)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addResourceField} className="bg-blue-600 hover:bg-blue-700 text-white">
                + Add Resource
              </Button>
            </div>

            <Button
              onClick={createAssignment}
              className="bg-blue-600 hover:bg-blue-700 text-white mt-4"
            >
              Create Assignment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
