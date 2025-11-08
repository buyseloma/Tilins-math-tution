import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  student_data?: {
    board: string;
    grade: string;
    admission_date: string;
    batch_id: string | null;
    batch: {
      name: string;
    } | null;
  } | null;
}

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [boardFilter, setBoardFilter] = useState("all");
  const [batches, setBatches] = useState<any[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    board: "",
    grade: "",
    batch_id: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, boardFilter, students]);

  const fetchStudents = async () => {
    // Fetch all users with 'student' role from user_roles
    const { data: studentRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");

    if (rolesError || !studentRoles) {
      console.error("Error fetching student roles:", rolesError);
      return;
    }

    const studentIds = studentRoles.map(r => r.user_id);
    
    if (studentIds.length === 0) {
      setStudents([]);
      return;
    }

    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", studentIds);

    if (profilesError || !profiles) {
      console.error("Error fetching profiles:", profilesError);
      return;
    }

    // Fetch students table data (if exists)
    const { data: studentsData } = await supabase
      .from("students")
      .select(`
        id,
        board,
        grade,
        admission_date,
        batch_id,
        batch:batches(name)
      `)
      .in("id", studentIds);

    // Combine the data
    const combinedData = profiles.map(profile => ({
      ...profile,
      student_data: studentsData?.find(s => s.id === profile.id) || null
    }));

    setStudents(combinedData);
  };

  const fetchBatches = async () => {
    const { data } = await supabase.from("batches").select("*");
    if (data) setBatches(data);
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (boardFilter !== "all") {
      filtered = filtered.filter(s => s.student_data?.board === boardFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      board: student.student_data?.board || "",
      grade: student.student_data?.grade || "",
      batch_id: student.student_data?.batch_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingStudent) return;

    const { error } = await supabase
      .from("students")
      .upsert({
        id: editingStudent.id,
        board: formData.board as any,
        grade: formData.grade,
        batch_id: formData.batch_id || null,
      });

    if (error) {
      toast.error("Failed to update student");
      return;
    }

    toast.success("Student updated successfully");
    setIsDialogOpen(false);
    setEditingStudent(null);
    fetchStudents();
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student's data?")) return;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (error) {
      toast.error("Failed to delete student data");
      return;
    }

    toast.success("Student data removed successfully");
    fetchStudents();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Management</CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={boardFilter} onValueChange={setBoardFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              <SelectItem value="state_board">State Board</SelectItem>
              <SelectItem value="cbse">CBSE</SelectItem>
              <SelectItem value="icse">ICSE</SelectItem>
              <SelectItem value="cambridge">Cambridge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map(student => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.full_name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.phone || "N/A"}</TableCell>
                <TableCell>
                  {student.student_data ? (
                    <Badge>{student.student_data.board.toUpperCase()}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not Set</span>
                  )}
                </TableCell>
                <TableCell>{student.student_data?.grade || "Not Set"}</TableCell>
                <TableCell>{student.student_data?.batch?.name || "Unassigned"}</TableCell>
                <TableCell>
                  {student.student_data?.admission_date 
                    ? new Date(student.student_data.admission_date).toLocaleDateString("en-IN")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(student)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {student.student_data && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Board</Label>
              <Select value={formData.board} onValueChange={(value) => setFormData({ ...formData, board: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state_board">State Board</SelectItem>
                  <SelectItem value="cbse">CBSE</SelectItem>
                  <SelectItem value="icse">ICSE</SelectItem>
                  <SelectItem value="cambridge">Cambridge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Grade</Label>
              <Input
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <Label>Batch</Label>
              <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
