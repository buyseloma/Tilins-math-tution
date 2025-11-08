import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  profile: {
    full_name: string;
  };
}

export const AttendanceManagement = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [existingAttendance, setExistingAttendance] = useState<string[]>([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchClasses(selectedBatch);
      fetchStudents(selectedBatch);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedClass) {
      fetchExistingAttendance(selectedClass);
    }
  }, [selectedClass]);

  const fetchBatches = async () => {
    const { data } = await supabase
      .from("batches")
      .select("*")
      .order("name");
    
    if (data) setBatches(data);
  };

  const fetchClasses = async (batchId: string) => {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("batch_id", batchId)
      .order("date", { ascending: false })
      .order("time", { ascending: false });
    
    if (data) setClasses(data);
  };

  const fetchStudents = async (batchId: string) => {
    const { data } = await supabase
      .from("students")
      .select(`
        id,
        profile:profiles(full_name)
      `)
      .eq("batch_id", batchId);
    
    if (data) {
      setStudents(data as any);
      const initialAttendance: Record<string, boolean> = {};
      data.forEach(s => {
        initialAttendance[s.id] = false;
      });
      setAttendance(initialAttendance);
    }
  };

  const fetchExistingAttendance = async (classId: string) => {
    const { data } = await supabase
      .from("attendance")
      .select("student_id")
      .eq("class_id", classId)
      .eq("is_present", true);
    
    if (data) {
      const presentIds = data.map(a => a.student_id);
      setExistingAttendance(presentIds);
      const updatedAttendance: Record<string, boolean> = {};
      students.forEach(s => {
        updatedAttendance[s.id] = presentIds.includes(s.id);
      });
      setAttendance(updatedAttendance);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      toast.error("Please select a class");
      return;
    }

    // Delete existing attendance for this class
    await supabase
      .from("attendance")
      .delete()
      .eq("class_id", selectedClass);

    // Insert new attendance records
    const attendanceRecords = Object.entries(attendance).map(([studentId, isPresent]) => ({
      student_id: studentId,
      class_id: selectedClass,
      is_present: isPresent
    }));

    const { error } = await supabase
      .from("attendance")
      .insert(attendanceRecords);

    if (error) {
      toast.error("Failed to mark attendance");
    } else {
      toast.success("Attendance marked successfully");
      fetchExistingAttendance(selectedClass);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Select Batch</Label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
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
            <Label>Select Class</Label>
            <Select 
              value={selectedClass} 
              onValueChange={setSelectedClass}
              disabled={!selectedBatch}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.subject} - {new Date(cls.date).toLocaleDateString("en-IN")} {cls.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedClass && students.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Present</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.profile.full_name}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={attendance[student.id] || false}
                        onCheckedChange={(checked) => 
                          setAttendance({ ...attendance, [student.id]: checked as boolean })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button onClick={handleSubmit} className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};