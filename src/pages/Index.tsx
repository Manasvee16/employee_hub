import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, BarChart3 } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import EmployeeManagement from "@/components/EmployeeManagement";
import WorkloadVisualization from "@/components/WorkloadVisualization";
import ThemeToggle from "@/components/ThemeToggle";

// Mock data structure
export interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
}

export interface Task {
  id: string;
  employeeId: string;
  description: string;
  status: "Pending" | "In-Progress" | "Done";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
}

const Index = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "emp101", name: "Alice Johnson", title: "Software Engineer", department: "R&D" },
    { id: "emp102", name: "Bob Smith", title: "Sales Manager", department: "Sales" },
    { id: "emp103", name: "Carol Lee", title: "HR Specialist", department: "Human Resources" },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: "task1", employeeId: "emp101", description: "Review Q3 performance metrics.", status: "Done", priority: "High", dueDate: "2025-11-25" },
    { id: "task2", employeeId: "emp101", description: "Update client onboarding documentation.", status: "In-Progress", priority: "Medium", dueDate: "2025-11-28" },
    { id: "task3", employeeId: "emp102", description: "Prepare quarterly budget proposal.", status: "Pending", priority: "Low", dueDate: "2025-12-01" },
  ]);

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId));
    setTasks(tasks.filter(task => task.employeeId !== employeeId));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-card shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">Employee & Task Manager</h1>
              <p className="text-muted-foreground mt-2 text-base font-medium">Manage your team and track progress efficiently</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-10 h-12 shadow-md">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="workload" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Workload
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <Dashboard 
              employees={employees}
              tasks={tasks}
              setTasks={setTasks}
            />
          </TabsContent>

          <TabsContent value="workload" className="mt-0">
            <WorkloadVisualization 
              employees={employees}
              tasks={tasks}
            />
          </TabsContent>

          <TabsContent value="employees" className="mt-0">
            <EmployeeManagement 
              employees={employees}
              setEmployees={setEmployees}
              onDeleteEmployee={handleDeleteEmployee}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
