import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface StudentData {
  id: string;
  full_name: string;
  attendance: number;
  fees: { paid: number; pending: number };
  recentMarks: any[];
  upcomingClasses: any[];
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    checkParent();
  }, []);

  const checkParent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: hasParentRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "parent",
    });

    if (!hasParentRole) {
      toast.error("Access denied. Parent only.");
      navigate("/");
      return;
    }

    setUser(user);
    await fetchStudentData(user.id);
    setLoading(false);
  };

  const fetchStudentData = async (parentId: string) => {
    const { data: studentRecords } = await supabase
      .from("students")
      .select("id")
      .eq("parent_id", parentId);

    if (!studentRecords) return;

    const studentProfiles = await Promise.all(
      studentRecords.map(async (s) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", s.id)
          .single();
        return { id: s.id, full_name: profile?.full_name || "Unknown" };
      })
    );

    if (!studentRecords) return;

    const studentData = await Promise.all(
      studentProfiles.map(async (student) => {
        const { data: attendance } = await supabase
          .from("attendance")
          .select("is_present")
          .eq("student_id", student.id);

        const attendancePercent = attendance && attendance.length > 0
          ? (attendance.filter(a => a.is_present).length / attendance.length) * 100
          : 0;

        const { data: fees } = await supabase
          .from("fees")
          .select("amount, status")
          .eq("student_id", student.id);

        const feeSummary = fees?.reduce((acc, fee) => {
          if (fee.status === "paid") acc.paid += Number(fee.amount);
          else acc.pending += Number(fee.amount);
          return acc;
        }, { paid: 0, pending: 0 }) || { paid: 0, pending: 0 };

        const { data: marks } = await supabase
          .from("test_marks")
          .select(`
            marks_obtained,
            test:tests(subject, max_marks, test_date)
          `)
          .eq("student_id", student.id)
          .order("test_id", { ascending: false })
          .limit(5);

        const { data: classes } = await supabase
          .from("classes")
          .select("*")
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date")
          .limit(5);

        return {
          id: student.id,
          full_name: student.full_name,
          attendance: attendancePercent,
          fees: feeSummary,
          recentMarks: marks || [],
          upcomingClasses: classes || []
        };
      })
    );

    setStudents(studentData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-primary">Parent Portal</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Student Progress Dashboard</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        {students.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No students linked to this parent account</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={students[0]?.id} className="w-full">
            <TabsList>
              {students.map(student => (
                <TabsTrigger key={student.id} value={student.id}>
                  {student.full_name}
                </TabsTrigger>
              ))}
            </TabsList>

            {students.map(student => (
              <TabsContent key={student.id} value={student.id} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">{student.attendance.toFixed(1)}%</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fees Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600">₹{student.fees.paid.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fees Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-orange-600">₹{student.fees.pending.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Test Marks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Marks</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.recentMarks.map((mark, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{mark.test.subject}</TableCell>
                            <TableCell>{mark.marks_obtained} / {mark.test.max_marks}</TableCell>
                            <TableCell>
                              {((mark.marks_obtained / mark.test.max_marks) * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell>{new Date(mark.test.test_date).toLocaleDateString("en-IN")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Classes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {student.upcomingClasses.map(cls => (
                        <div key={cls.id} className="p-3 border rounded-lg flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{cls.subject}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(cls.date).toLocaleDateString("en-IN")} at {cls.time}
                            </p>
                          </div>
                          <Badge>{cls.duration_minutes} mins</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default ParentDashboard;
