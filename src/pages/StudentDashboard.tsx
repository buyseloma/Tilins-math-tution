import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { ClassesList } from "@/components/student/ClassesList";
import { NotesSection } from "@/components/student/NotesSection";
import { FeesStatus } from "@/components/student/FeesStatus";
import { TestMarks } from "@/components/student/TestMarks";
import { AttendanceChart } from "@/components/student/AttendanceChart";
import { TasksList } from "@/components/student/TasksList";
import { EventsSection } from "@/components/student/EventsSection";
import { NotificationsList } from "@/components/student/NotificationsList";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
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
          <h1 className="text-2xl font-serif font-bold text-primary">Student Portal</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ClassesList />
            <NotesSection />
            <FeesStatus />
            <TestMarks />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <NotificationsList />
            <AttendanceChart />
            <TasksList />
            <EventsSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
