import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Download } from "lucide-react";
import type { Employee } from "@/pages/Index";
import AddEmployeeModal from "./AddEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmployeeManagementProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const EmployeeManagement = ({ employees, setEmployees, onDeleteEmployee }: EmployeeManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "title" | "department">("name");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Filter and sort employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortBy].toLowerCase();
      const bValue = b[sortBy].toLowerCase();
      return aValue.localeCompare(bValue);
    });
  }, [employees, searchQuery, sortBy]);

  const handleAddEmployee = (newEmployee: Omit<Employee, "id">) => {
    const employee: Employee = {
      ...newEmployee,
      id: `emp${Date.now()}`,
    };
    setEmployees([...employees, employee]);
    toast({
      title: "Employee Added",
      description: `${employee.name} has been added successfully`,
    });
  };

  const handleEditEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    toast({
      title: "Employee Updated",
      description: `${updatedEmployee.name}'s information has been updated`,
    });
    setEditingEmployee(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingEmployee) {
      onDeleteEmployee(deletingEmployee.id);
      toast({
        title: "Employee Deleted",
        description: `${deletingEmployee.name} and their tasks have been removed`,
        variant: "destructive",
      });
      setDeletingEmployee(null);
    }
  };

  const exportEmployees = () => {
    const exportData = filteredEmployees.map(emp => ({
      id: emp.id,
      name: emp.name,
      title: emp.title,
      department: emp.department,
    }));
    const headers = Object.keys(exportData[0] || {}).join(",");
    const rows = exportData.map(row => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast({
      title: "Export Successful",
      description: "employees.csv has been downloaded",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-3xl font-bold">Employee Directory</CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportEmployees} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search employees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={sortBy === "name" ? "default" : "outline"}
                onClick={() => setSortBy("name")}
                size="sm"
              >
                Name
              </Button>
              <Button 
                variant={sortBy === "title" ? "default" : "outline"}
                onClick={() => setSortBy("title")}
                size="sm"
              >
                Title
              </Button>
              <Button 
                variant={sortBy === "department" ? "default" : "outline"}
                onClick={() => setSortBy("department")}
                size="sm"
              >
                Department
              </Button>
            </div>
          </div>

          {/* Employee Table */}
          <div className="rounded-lg border-2 border-border overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Department</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-accent/20 transition-all duration-200 group">
                      <td className="px-6 py-5 text-sm font-semibold text-foreground">{employee.name}</td>
                      <td className="px-6 py-5 text-sm text-muted-foreground">{employee.title}</td>
                      <td className="px-6 py-5 text-sm text-muted-foreground">{employee.department}</td>
                      <td className="px-6 py-5 text-sm text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingEmployee(employee)}
                          className="hover:bg-primary/20 hover:text-primary transition-all duration-200 hover:scale-110"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeletingEmployee(employee)}
                          className="hover:bg-destructive/20 hover:text-destructive transition-all duration-200 hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredEmployees.length === 0 && (
              <div className="text-center py-12 bg-card">
                <p className="text-muted-foreground">No employees found</p>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </CardContent>
      </Card>

      <AddEmployeeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEmployee}
      />

      {editingEmployee && (
        <EditEmployeeModal 
          isOpen={true}
          onClose={() => setEditingEmployee(null)}
          onEdit={handleEditEmployee}
          employee={editingEmployee}
        />
      )}

      <AlertDialog open={!!deletingEmployee} onOpenChange={(open) => !open && setDeletingEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingEmployee?.name} and all their assigned tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeManagement;
