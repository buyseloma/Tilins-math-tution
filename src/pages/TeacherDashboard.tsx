import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotesUpload } from "@/components/teacher/NotesUpload";
import { TaskManagement } from "@/components/admin/TaskManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSubmissions } from "@/components/teacher/StudentSubmissions";
import { AttendanceMarking } from "@/components/teacher/AttendanceMarking";
import { ScheduleView } from "@/components/teacher/ScheduleView";
import { ClassCompletion } from "@/components/teacher/ClassCompletion";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    checkTeacher();
  }, []);

  const checkTeacher = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: hasTeacherRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "teacher",
    });

    if (!hasTeacherRole) {
      toast.error("Access denied. Teacher only.");
      navigate("/");
      return;
    }

    setUser(user);
    await fetchBatches(user.id);
    setLoading(false);
  };

  const fetchBatches = async (teacherId: string) => {
    const { data } = await supabase
      .from("batches")
      .select("*")
      .eq("teacher_id", teacherId);

    if (data) {
      setBatches(data);
    }
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
          <h1 className="text-2xl font-serif font-bold text-primary">Teacher Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Batches</h2>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {batches.map(batch => (
              <Card key={batch.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{batch.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {batch.board.toUpperCase()} - Grade {batch.grade}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{batch.mode}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-6">
            <ScheduleView batches={batches} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <NotesUpload batches={batches} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TaskManagement />
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <StudentSubmissions batches={batches} />
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <AttendanceMarking batches={batches} />
          </TabsContent>

          <TabsContent value="completion" className="mt-6">
            <ClassCompletion batches={batches} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
