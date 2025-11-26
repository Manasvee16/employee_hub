import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckCircle2, Clock, AlertCircle, ListTodo, Download, Filter } from "lucide-react";
import type { Employee, Task } from "@/pages/Index";
import TaskCard from "./TaskCard";
import AssignTaskModal from "./AssignTaskModal";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  employees: Employee[];
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

const Dashboard = ({ employees, tasks, setTasks }: DashboardProps) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<"All" | Task["priority"]>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | Task["status"]>("All");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const totalEmployees = employees.length;
    const totalTasks = tasks.length;
    const completedToday = tasks.filter(task => 
      task.status === "Done" && task.dueDate === today
    ).length;
    const overdue = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const now = new Date();
      return taskDate < now && task.status !== "Done";
    }).length;
    const completionRate = totalTasks > 0 ? (tasks.filter(t => t.status === "Done").length / totalTasks) * 100 : 0;

    return {
      totalEmployees,
      totalTasks,
      completedToday,
      overdue,
      completionRate
    };
  }, [employees, tasks]);

  const handleStatusUpdate = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus}`,
    });
  };

  const handleAssignTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      ...newTask,
      id: `task${Date.now()}`,
    };
    setTasks([...tasks, task]);
    toast({
      title: "Task Assigned",
      description: "New task has been successfully assigned",
    });
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map(row => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded`,
    });
  };

  const exportTasks = () => {
    const exportData = filteredTasks.map(task => ({
      id: task.id,
      employee: employees.find(e => e.id === task.employeeId)?.name || "Unknown",
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    }));
    exportToCSV(exportData, "tasks.csv");
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const isTaskOverdue = showOverdueOnly ? (() => {
        const taskDate = new Date(task.dueDate);
        const now = new Date();
        return taskDate < now && task.status !== "Done";
      })() : true;
      return matchesPriority && matchesStatus && isTaskOverdue;
    });
  }, [tasks, priorityFilter, statusFilter, showOverdueOnly]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      pending: filteredTasks.filter(t => t.status === "Pending"),
      inProgress: filteredTasks.filter(t => t.status === "In-Progress"),
      done: filteredTasks.filter(t => t.status === "Done"),
    };
  }, [filteredTasks]);

  return (
    <div className="space-y-8">
      {/* Statistics Panel */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Active Employees</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Team members</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 border-l-accent-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Total Tasks</CardTitle>
            <div className="p-2 bg-accent-foreground/10 rounded-lg">
              <ListTodo className="h-5 w-5 text-accent-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent-foreground">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Assigned tasks</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Completed Today</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Tasks finished</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Overdue Tasks</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="transition-all duration-300 hover:shadow-lg border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Overall Task Completion</CardTitle>
          <CardDescription className="text-sm">Track your team's productivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Completion Rate</span>
            <span className="text-3xl font-bold text-primary">{stats.completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={stats.completionRate} className="h-4 shadow-sm" />
          <p className="text-xs text-muted-foreground font-medium">
            {tasks.filter(t => t.status === "Done").length} of {stats.totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Task Filters and Actions */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In-Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showOverdueOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              >
                Overdue Only
              </Button>
              {(priorityFilter !== "All" || statusFilter !== "All" || showOverdueOnly) && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => {
                  setPriorityFilter("All");
                  setStatusFilter("All");
                  setShowOverdueOnly(false);
                }}>
                  Clear Filters
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={exportTasks} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Tasks
              </Button>
              <Button onClick={() => setIsAssignModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Assign Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold text-foreground">Task Board</h2>

      {/* Task Board - Kanban Style */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-muted">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Pending</h3>
            <span className="ml-auto bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-bold shadow-sm">
              {tasksByStatus.pending.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.pending.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                employee={employees.find(e => e.id === task.employeeId)}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
            {tasksByStatus.pending.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No pending tasks</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/30">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">In Progress</h3>
            <span className="ml-auto bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-bold shadow-sm">
              {tasksByStatus.inProgress.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.inProgress.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                employee={employees.find(e => e.id === task.employeeId)}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
            {tasksByStatus.inProgress.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No tasks in progress</p>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/30">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Done</h3>
            <span className="ml-auto bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-bold shadow-sm">
              {tasksByStatus.done.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.done.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                employee={employees.find(e => e.id === task.employeeId)}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
            {tasksByStatus.done.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No completed tasks</p>
            )}
          </div>
        </div>
      </div>

      <AssignTaskModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignTask}
        employees={employees}
      />
    </div>
  );
};

// Fix the missing import
import { Users } from "lucide-react";

export default Dashboard;
