import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Users, BookOpen, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BatchManagement } from "@/components/admin/BatchManagement";
import { StudentManagement } from "@/components/admin/StudentManagement";
import { NotesUpload } from "@/components/admin/NotesUpload";
import { ScheduleManagement } from "@/components/admin/ScheduleManagement";
import { TaskManagement } from "@/components/admin/TaskManagement";
import { EventManagement } from "@/components/admin/EventManagement";
import { AttendanceManagement } from "@/components/admin/AttendanceManagement";
import { FeesManagement } from "@/components/admin/FeesManagement";
import { TestManagement } from "@/components/admin/TestManagement";
import { TestimonialManagement } from "@/components/admin/TestimonialManagement";
import { NotificationManagement } from "@/components/admin/NotificationManagement";
import { UserRoleManagement } from "@/components/admin/UserRoleManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!userRoles) {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }

    setUser(user);
    setLoading(false);
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
          <h1 className="text-2xl font-serif font-bold text-primary">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="batches" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 mb-8">
            <TabsTrigger value="batches">
              <Users className="h-4 w-4 mr-2" />
              Batches
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <BookOpen className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Users className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="fees">
              <FileText className="h-4 w-4 mr-2" />
              Fees
            </TabsTrigger>
            <TabsTrigger value="tests">
              <BookOpen className="h-4 w-4 mr-2" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="testimonials">
              <Users className="h-4 w-4 mr-2" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <FileText className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="user-roles">
              <Users className="h-4 w-4 mr-2" />
              User Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batches">
            <BatchManagement />
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleManagement />
          </TabsContent>

          <TabsContent value="notes">
            <NotesUpload />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManagement />
          </TabsContent>

          <TabsContent value="events">
            <EventManagement />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceManagement />
          </TabsContent>

          <TabsContent value="fees">
            <FeesManagement />
          </TabsContent>

          <TabsContent value="tests">
            <TestManagement />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationManagement />
          </TabsContent>

          <TabsContent value="user-roles">
            <UserRoleManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
