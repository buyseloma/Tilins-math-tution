import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AttendanceMarkingProps {
  batches: any[];
}

export const AttendanceMarking = ({ batches }: AttendanceMarkingProps) => {
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (selectedBatch) {
      fetchClasses();
      fetchStudents();
    }
  }, [selectedBatch]);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("batch_id", selectedBatch)
      .order("date", { ascending: false });

    if (data) {
      setClasses(data);
    }
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("students")
      .select("*, profiles!students_id_fkey(full_name, email)")
      .eq("batch_id", selectedBatch);

    if (data) {
      setStudents(data);
      // Initialize attendance state
      const initialAttendance: { [key: string]: boolean } = {};
      data.forEach(student => {
        initialAttendance[student.id] = false;
      });
      setAttendance(initialAttendance);
    }
  };

  useEffect(() => {
    if (selectedClass && students.length) {
      fetchExistingAttendance();
    }
  }, [selectedClass, students]);

  const fetchExistingAttendance = async () => {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("class_id", selectedClass);

    if (data) {
      const attendanceMap: { [key: string]: boolean } = {};
      data.forEach(record => {
        attendanceMap[record.student_id] = record.is_present || false;
      });
      setAttendance(attendanceMap);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance({ ...attendance, [studentId]: !attendance[studentId] });
  };

  const saveAttendance = async () => {
    if (!selectedClass) {
      toast.error("Please select a class");
      return;
    }

    const attendanceRecords = students.map(student => ({
      class_id: selectedClass,
      student_id: student.id,
      is_present: attendance[student.id] || false,
    }));

    // Delete existing records first
    await supabase
      .from("attendance")
      .delete()
      .eq("class_id", selectedClass);

    // Insert new records
    const { error } = await supabase
      .from("attendance")
      .insert(attendanceRecords);

    if (error) {
      toast.error("Failed to save attendance");
    } else {
      toast.success("Attendance saved successfully");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Batch</label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger>
                <SelectValue placeholder="Choose batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map(batch => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Choose class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.subject} - {new Date(cls.date).toLocaleDateString()}
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
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.profiles?.full_name}</TableCell>
                    <TableCell>{student.profiles?.email}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={attendance[student.id] || false}
                        onCheckedChange={() => toggleAttendance(student.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button onClick={saveAttendance} className="w-full">
              Save Attendance
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
