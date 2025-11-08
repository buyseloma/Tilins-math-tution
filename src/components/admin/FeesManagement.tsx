import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Fee {
  id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  student: {
    profile: {
      full_name: string;
    };
  };
}

export const FeesManagement = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    due_date: "",
    status: "pending" as "pending" | "paid" | "overdue"
  });
  const [batchFormData, setBatchFormData] = useState({
    batch_id: "",
    amount: "",
    due_date: "",
    status: "pending" as "pending" | "paid" | "overdue"
  });

  useEffect(() => {
    fetchFees();
    fetchStudents();
    fetchBatches();
  }, []);

  const fetchFees = async () => {
    const { data, error } = await supabase
      .from("fees")
      .select(`
        *,
        student:students!inner(
          profile:profiles(full_name)
        )
      `)
      .order("due_date", { ascending: false });

    if (!error && data) {
      setFees(data as any);
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
      
      if (data) setStudents(data.map(s => ({ id: s.id, profile: { full_name: s.full_name } })));
    }
  };

  const fetchBatches = async () => {
    const { data } = await supabase
      .from("batches")
      .select("*")
      .order("name");
    
    if (data) setBatches(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const feeData = {
      student_id: formData.student_id,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      status: formData.status,
      paid_date: formData.status === "paid" ? new Date().toISOString().split('T')[0] : null
    };

    if (editingId) {
      const { error } = await supabase
        .from("fees")
        .update(feeData)
        .eq("id", editingId);

      if (error) {
        toast.error("Failed to update fee");
      } else {
        toast.success("Fee updated successfully");
        resetForm();
        fetchFees();
      }
    } else {
      const { error } = await supabase
        .from("fees")
        .insert([feeData]);

      if (error) {
        toast.error("Failed to create fee");
      } else {
        toast.success("Fee created successfully");
        resetForm();
        fetchFees();
      }
    }
  };

  const handleEdit = (fee: Fee) => {
    setEditingId(fee.id);
    setFormData({
      student_id: fee.student.profile ? (fee as any).student_id : "",
      amount: fee.amount.toString(),
      due_date: fee.due_date,
      status: fee.status as any
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee record?")) return;

    const { error } = await supabase
      .from("fees")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete fee");
    } else {
      toast.success("Fee deleted successfully");
      fetchFees();
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get all students in the selected batch
    const { data: batchStudents } = await supabase
      .from("students")
      .select("id")
      .eq("batch_id", batchFormData.batch_id);

    if (!batchStudents || batchStudents.length === 0) {
      toast.error("No students found in this batch");
      return;
    }

    // Create fee records for all students in the batch
    const feeRecords = batchStudents.map(student => ({
      student_id: student.id,
      amount: parseFloat(batchFormData.amount),
      due_date: batchFormData.due_date,
      status: batchFormData.status
    }));

    const { error } = await supabase
      .from("fees")
      .insert(feeRecords);

    if (error) {
      toast.error("Failed to create fees for batch");
    } else {
      toast.success(`Fees created for ${batchStudents.length} students`);
      setBatchFormData({ batch_id: "", amount: "", due_date: "", status: "pending" });
      setIsBatchDialogOpen(false);
      fetchFees();
    }
  };

  const resetForm = () => {
    setFormData({ student_id: "", amount: "", due_date: "", status: "pending" });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fees Management</CardTitle>
        <div className="flex gap-2">
          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Batch Fees
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Fees for Batch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="batch">Batch</Label>
                  <Select value={batchFormData.batch_id} onValueChange={(value) => setBatchFormData({ ...batchFormData, batch_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} - Grade {batch.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="batch_amount">Amount</Label>
                  <Input id="batch_amount" type="number" value={batchFormData.amount} onChange={(e) => setBatchFormData({ ...batchFormData, amount: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="batch_due_date">Due Date</Label>
                  <Input id="batch_due_date" type="date" value={batchFormData.due_date} onChange={(e) => setBatchFormData({ ...batchFormData, due_date: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Create"} Fee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="student_id">Student</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({ ...formData, student_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editingId ? "Update" : "Create"}</Button>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map(fee => (
              <TableRow key={fee.id}>
                <TableCell className="font-medium">{fee.student.profile.full_name}</TableCell>
                <TableCell>₹{fee.amount.toLocaleString("en-IN")}</TableCell>
                <TableCell>{new Date(fee.due_date).toLocaleDateString("en-IN")}</TableCell>
                <TableCell>
                  <Badge variant={fee.status === "paid" ? "default" : fee.status === "overdue" ? "destructive" : "secondary"}>
                    {fee.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(fee)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(fee.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};