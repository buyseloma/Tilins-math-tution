import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

interface StudentSubmissionsProps {
  batches: any[];
}

export const StudentSubmissions = ({ batches }: StudentSubmissionsProps) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSubmissions();

    // Set up realtime subscription for submissions
    const channel = supabase
      .channel('task_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_submissions'
        },
        () => {
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [batches]);

  const fetchSubmissions = async () => {
    if (!batches.length) return;

    const batchIds = batches.map(b => b.id);
    
    const { data } = await supabase
      .from("task_submissions")
      .select(`
        *,
        task:tasks(title, batch_id, due_date),
        student:profiles!task_submissions_student_id_fkey(full_name, email)
      `)
      .in("task.batch_id", batchIds)
      .order("submitted_at", { ascending: false });

    if (data) {
      setSubmissions(data);
    }
    setLoading(false);
  };

  const handleGradeChange = (submissionId: string, value: string) => {
    setGrades({ ...grades, [submissionId]: value });
  };

  const saveGrade = async (submissionId: string) => {
    const grade = grades[submissionId];
    if (!grade) {
      toast.error("Please enter a grade");
      return;
    }

    const { error } = await supabase
      .from("task_submissions")
      .update({ grade: parseFloat(grade) })
      .eq("id", submissionId);

    if (error) {
      toast.error("Failed to save grade");
    } else {
      toast.success("Grade saved successfully");
      fetchSubmissions();
    }
  };

  if (loading) return <div>Loading submissions...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.student?.full_name}</TableCell>
                <TableCell>{sub.task?.title}</TableCell>
                <TableCell>
                  {sub.is_completed ? (
                    <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
                  ) : (
                    <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Grade"
                    value={grades[sub.id] || sub.grade || ""}
                    onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => saveGrade(sub.id)}>
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
