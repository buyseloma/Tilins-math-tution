import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Batch {
  id: string;
  name: string;
  board: string;
  grade: string;
  mode: string;
  teacher_id: string | null;
}

export const BatchManagement = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    board: "state_board" as "state_board" | "cbse" | "icse" | "cambridge",
    grade: "",
    mode: "online" as "online" | "offline",
    teacher_id: ""
  });

  useEffect(() => {
    fetchBatches();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchBatches = async () => {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBatches(data);
    }
  };

  const fetchTeachers = async () => {
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "teacher");

    if (userRoles && userRoles.length > 0) {
      const userIds = userRoles.map(ur => ur.user_id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (!error && data) {
        setTeachers(data);
      }
    }
  };

  const fetchStudents = async () => {
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");

    if (userRoles && userRoles.length > 0) {
      const userIds = userRoles.map(ur => ur.user_id);
      
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (data) setStudents(data);
    }
  };

  const fetchBatchStudents = async (batchId: string) => {
    const { data } = await supabase
      .from("students")
      .select(`
        id,
        profiles!inner(full_name)
      `)
      .eq("batch_id", batchId);

    if (data) {
      setBatchStudents(data.map((s: any) => ({
        id: s.id,
        full_name: s.profiles.full_name
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const batchData = {
      ...formData,
      teacher_id: formData.teacher_id || null
    };

    if (editingId) {
      const { error } = await supabase
        .from("batches")
        .update(batchData)
        .eq("id", editingId);

      if (error) {
        toast.error("Failed to update batch");
      } else {
        toast.success("Batch updated successfully");
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({ name: "", board: "state_board", grade: "", mode: "online", teacher_id: "" });
        fetchBatches();
      }
    } else {
      const { error } = await supabase
        .from("batches")
        .insert([batchData]);

      if (error) {
        toast.error("Failed to create batch");
      } else {
        toast.success("Batch created successfully");
        setIsDialogOpen(false);
        setFormData({ name: "", board: "state_board", grade: "", mode: "online", teacher_id: "" });
        fetchBatches();
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Batch Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Create"} Batch</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Batch Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="board">Board</Label>
                <Select value={formData.board} onValueChange={(value: any) => setFormData({ ...formData, board: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g., 10, 11, 12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mode">Class Mode</Label>
                <Select value={formData.mode} onValueChange={(value: any) => setFormData({ ...formData, mode: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teacher">Assign Teacher</Label>
                <Select value={formData.teacher_id} onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editingId ? "Update" : "Create"} Batch</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.map(batch => (
            <div key={batch.id} className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{batch.name}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge>{batch.board.toUpperCase()}</Badge>
                  <Badge variant="secondary">Grade {batch.grade}</Badge>
                  <Badge variant="outline">{batch.mode}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => {
                  setSelectedBatchId(batch.id);
                  fetchBatchStudents(batch.id);
                  setIsStudentDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Students
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setEditingId(batch.id);
                  setFormData({
                    name: batch.name,
                    board: batch.board as any,
                    grade: batch.grade,
                    mode: batch.mode as any,
                    teacher_id: batch.teacher_id || ""
                  });
                  setIsDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={async () => {
                  if (!confirm("Are you sure you want to delete this batch?")) return;
                  const { error } = await supabase.from("batches").delete().eq("id", batch.id);
                  if (error) toast.error("Failed to delete batch");
                  else { toast.success("Batch deleted"); fetchBatches(); }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Students in Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Current Students in Batch</h3>
              {batchStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students in this batch yet</p>
              ) : (
                <div className="space-y-2">
                  {batchStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{student.full_name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          const { error } = await supabase
                            .from("students")
                            .update({ batch_id: null })
                            .eq("id", student.id);

                          if (error) {
                            toast.error("Failed to remove student");
                          } else {
                            toast.success("Student removed from batch");
                            if (selectedBatchId) fetchBatchStudents(selectedBatchId);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Add Students to Batch</h3>
              <div className="space-y-2">
                {students
                  .filter(s => !batchStudents.find(bs => bs.id === s.id))
                  .map(student => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={student.id}
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds([...selectedStudentIds, student.id]);
                          } else {
                            setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                          }
                        }}
                      />
                      <label htmlFor={student.id} className="cursor-pointer">
                        {student.full_name}
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={async () => {
                if (selectedStudentIds.length === 0) {
                  toast.error("Please select at least one student");
                  return;
                }

                const { error } = await supabase
                  .from("students")
                  .upsert(
                    selectedStudentIds.map(studentId => ({
                      id: studentId,
                      batch_id: selectedBatchId,
                      board: formData.board as any,
                      grade: formData.grade
                    }))
                  );

                if (error) {
                  toast.error("Failed to add students to batch");
                } else {
                  toast.success(`${selectedStudentIds.length} student(s) added to batch`);
                  setSelectedStudentIds([]);
                  if (selectedBatchId) fetchBatchStudents(selectedBatchId);
                }
              }}
              disabled={selectedStudentIds.length === 0}
            >
              Add Selected Students
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
