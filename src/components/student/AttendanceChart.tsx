import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calendar } from "lucide-react";

interface AttendanceRecord {
  id: string;
  is_present: boolean;
  marked_at: string;
  class_id: string;
}

export const AttendanceChart = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();

    // Set up realtime subscription for attendance
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAttendance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", user.id)
      .order("marked_at", { ascending: false });

    if (!error && data) {
      setAttendance(data);
    }
    setLoading(false);
  };

  const getDailyData = () => {
    const last7Days = attendance.slice(0, 7).reverse();
    return last7Days.map(record => ({
      date: new Date(record.marked_at).toLocaleDateString("en-IN", { weekday: "short" }),
      status: record.is_present ? 1 : 0,
      fullDate: new Date(record.marked_at).toLocaleDateString("en-IN")
    }));
  };

  const getWeeklyData = () => {
    const weeks = 4;
    const weekData = [];
    const now = new Date();
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekAttendance = attendance.filter(a => {
        const date = new Date(a.marked_at);
        return date >= weekStart && date < weekEnd;
      });
      
      const present = weekAttendance.filter(a => a.is_present).length;
      const total = weekAttendance.length;
      
      weekData.push({
        week: `Week ${weeks - i}`,
        percentage: total > 0 ? (present / total) * 100 : 0
      });
    }
    
    return weekData;
  };

  const getMonthlyData = () => {
    const months = 6;
    const monthData = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      
      const monthAttendance = attendance.filter(a => {
        const date = new Date(a.marked_at);
        return date.getMonth() === monthDate.getMonth() && 
               date.getFullYear() === monthDate.getFullYear();
      });
      
      const present = monthAttendance.filter(a => a.is_present).length;
      const total = monthAttendance.length;
      
      monthData.push({
        month: monthDate.toLocaleDateString("en-IN", { month: "short" }),
        percentage: total > 0 ? (present / total) * 100 : 0
      });
    }
    
    return monthData;
  };

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.is_present).length;
  const overallPercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  if (loading) return <div className="text-center py-8">Loading attendance...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Attendance Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
          <p className="text-sm text-muted-foreground mb-1">Overall Attendance</p>
          <p className="text-3xl font-bold text-primary">{overallPercentage.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            {presentClasses} present out of {totalClasses} classes
          </p>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getDailyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} ticks={[0, 1]} />
                <Tooltip 
                  formatter={(value: number) => [value === 1 ? "Present" : "Absent", "Status"]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                />
                <Bar dataKey="status" radius={[8, 8, 0, 0]}>
                  {getDailyData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 1 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getWeeklyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Attendance"]} />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Attendance"]} />
                <Bar dataKey="percentage" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
