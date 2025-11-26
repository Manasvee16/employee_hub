import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import type { Task, Employee } from "@/pages/Index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskCardProps {
  task: Task;
  employee?: Employee;
  onStatusUpdate: (taskId: string, status: Task["status"]) => void;
}

const TaskCard = ({ task, employee, onStatusUpdate }: TaskCardProps) => {
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Done":
        return "bg-primary text-primary-foreground";
      case "In-Progress":
        return "bg-secondary text-secondary-foreground";
      case "Pending":
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium":
        return "bg-secondary/10 text-secondary-foreground border-secondary/20";
      case "Low":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const isOverdue = () => {
    const taskDate = new Date(task.dueDate);
    const now = new Date();
    return taskDate < now && task.status !== "Done";
  };

  return (
    <Card className={`group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${isOverdue() ? 'border-destructive border-2' : 'border-border'}`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-foreground font-medium line-clamp-2 leading-relaxed">{task.description}</p>
          <div className="flex flex-col gap-2 shrink-0">
            <Badge className={`${getStatusColor(task.status)} shadow-sm transition-transform group-hover:scale-105`} variant="secondary">
              {task.status}
            </Badge>
            <Badge className={`${getPriorityColor(task.priority)} shadow-sm transition-transform group-hover:scale-105`} variant="outline">
              {task.priority}
            </Badge>
          </div>
        </div>
        
        {employee && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{employee.name}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/30 rounded-md px-3 py-2">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
          {isOverdue() && (
            <Badge variant="destructive" className="ml-auto text-xs shadow-sm animate-pulse">Overdue</Badge>
          )}
        </div>

        <Select value={task.status} onValueChange={(value) => onStatusUpdate(task.id, value as Task["status"])}>
          <SelectTrigger className="w-full h-9 text-xs font-medium transition-colors hover:bg-accent">
            <SelectValue placeholder="Update status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In-Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
