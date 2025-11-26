import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Employee, Task } from "@/pages/Index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface WorkloadVisualizationProps {
  employees: Employee[];
  tasks: Task[];
}

const WorkloadVisualization = ({ employees, tasks }: WorkloadVisualizationProps) => {
  // Calculate workload metrics per employee
  const workloadData = useMemo(() => {
    return employees.map(employee => {
      const employeeTasks = tasks.filter(t => t.employeeId === employee.id);
      const highPriority = employeeTasks.filter(t => t.priority === "High").length;
      const mediumPriority = employeeTasks.filter(t => t.priority === "Medium").length;
      const lowPriority = employeeTasks.filter(t => t.priority === "Low").length;
      const pending = employeeTasks.filter(t => t.status === "Pending").length;
      const inProgress = employeeTasks.filter(t => t.status === "In-Progress").length;
      const done = employeeTasks.filter(t => t.status === "Done").length;
      
      const overdue = employeeTasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        const now = new Date();
        return taskDate < now && t.status !== "Done";
      }).length;

      const totalActive = pending + inProgress;
      const workloadScore = highPriority * 3 + mediumPriority * 2 + lowPriority * 1;

      return {
        employee,
        totalTasks: employeeTasks.length,
        totalActive,
        highPriority,
        mediumPriority,
        lowPriority,
        pending,
        inProgress,
        done,
        overdue,
        workloadScore,
        completionRate: employeeTasks.length > 0 ? (done / employeeTasks.length) * 100 : 0,
      };
    });
  }, [employees, tasks]);

  // Get workload intensity color
  const getWorkloadColor = (score: number) => {
    if (score >= 15) return "bg-destructive text-destructive-foreground";
    if (score >= 8) return "bg-orange-500 text-white";
    if (score >= 4) return "bg-secondary text-secondary-foreground";
    return "bg-muted text-muted-foreground";
  };

  const getWorkloadLabel = (score: number) => {
    if (score >= 15) return "Critical";
    if (score >= 8) return "High";
    if (score >= 4) return "Moderate";
    return "Light";
  };

  // Prepare data for charts
  const barChartData = workloadData.map(data => ({
    name: data.employee.name.split(" ")[0],
    High: data.highPriority,
    Medium: data.mediumPriority,
    Low: data.lowPriority,
    Total: data.totalActive,
  }));

  const statusChartData = workloadData.map(data => ({
    name: data.employee.name.split(" ")[0],
    Pending: data.pending,
    "In Progress": data.inProgress,
    Done: data.done,
  }));

  // Overall priority distribution
  const priorityDistribution = [
    { name: "High", value: workloadData.reduce((sum, d) => sum + d.highPriority, 0), color: "hsl(var(--destructive))" },
    { name: "Medium", value: workloadData.reduce((sum, d) => sum + d.mediumPriority, 0), color: "hsl(var(--secondary))" },
    { name: "Low", value: workloadData.reduce((sum, d) => sum + d.lowPriority, 0), color: "hsl(var(--muted))" },
  ];

  const totalOverdue = workloadData.reduce((sum, d) => sum + d.overdue, 0);
  const avgCompletionRate = workloadData.reduce((sum, d) => sum + d.completionRate, 0) / workloadData.length;
  const mostBurdenedEmployee = workloadData.reduce((prev, curr) => 
    curr.workloadScore > prev.workloadScore ? curr : prev
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Workload</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mostBurdenedEmployee.employee.name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mostBurdenedEmployee.totalActive} active tasks • Score: {mostBurdenedEmployee.workloadScore}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalOverdue}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Team performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Workload Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Intensity Heatmap</CardTitle>
          <CardDescription>Task burden across team members with priority weighting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workloadData.map((data) => (
              <div
                key={data.employee.id}
                className="relative p-6 rounded-lg border border-border transition-all hover:shadow-lg animate-scale-in"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{data.employee.name}</h3>
                      <p className="text-xs text-muted-foreground">{data.employee.title}</p>
                    </div>
                    <Badge className={getWorkloadColor(data.workloadScore)}>
                      {getWorkloadLabel(data.workloadScore)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active Tasks</span>
                      <span className="font-bold text-foreground">{data.totalActive}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Workload Score</span>
                      <span className="font-bold text-foreground">{data.workloadScore}</span>
                    </div>
                    {data.overdue > 0 && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{data.overdue} overdue</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      <span>Priority Breakdown</span>
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                      {data.highPriority > 0 && (
                        <div
                          className="bg-destructive"
                          style={{ width: `${(data.highPriority / data.totalTasks) * 100}%` }}
                          title={`${data.highPriority} High`}
                        />
                      )}
                      {data.mediumPriority > 0 && (
                        <div
                          className="bg-secondary"
                          style={{ width: `${(data.mediumPriority / data.totalTasks) * 100}%` }}
                          title={`${data.mediumPriority} Medium`}
                        />
                      )}
                      {data.lowPriority > 0 && (
                        <div
                          className="bg-muted-foreground/30"
                          style={{ width: `${(data.lowPriority / data.totalTasks) * 100}%` }}
                          title={`${data.lowPriority} Low`}
                        />
                      )}
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-destructive">H: {data.highPriority}</span>
                      <span className="text-secondary-foreground">M: {data.mediumPriority}</span>
                      <span className="text-muted-foreground">L: {data.lowPriority}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Completion Rate</span>
                      <span>{data.completionRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${data.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Priority Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution by Employee</CardTitle>
            <CardDescription>Breakdown of task priorities across team</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="High" stackId="a" fill="hsl(var(--destructive))" />
                <Bar dataKey="Medium" stackId="a" fill="hsl(var(--secondary))" />
                <Bar dataKey="Low" stackId="a" fill="hsl(var(--muted-foreground))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution by Employee</CardTitle>
            <CardDescription>Current progress across team members</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="Pending" fill="hsl(var(--muted-foreground))" />
                <Bar dataKey="In Progress" fill="hsl(var(--secondary))" />
                <Bar dataKey="Done" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overall Priority Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Priority Distribution</CardTitle>
          <CardDescription>Total task breakdown by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkloadVisualization;
