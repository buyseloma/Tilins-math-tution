import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export const NotificationManagement = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    target: "all" as "all" | "batch" | "individual",
    batch_id: "",
    student_id: "",
    title: "",
    message: ""
  });

  useEffect(() => {
    fetchBatches();
    fetchStudents();
  }, []);

  const fetchBatches = async () => {
    const { data } = await supabase
      .from("batches")
      .select("*")
      .order("name");
    
    if (data) setBatches(data);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("students")
      .select(`
        id,
        profile:profiles(full_name, email)
      `);
    
    if (data) setStudents(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let recipients: string[] = [];

    if (formData.target === "all") {
      recipients = students.map(s => s.id);
    } else if (formData.target === "batch") {
      const { data } = await supabase
        .from("students")
        .select("id")
        .eq("batch_id", formData.batch_id);
      
      if (data) recipients = data.map(s => s.id);
    } else {
      recipients = [formData.student_id];
    }

    const notifications = recipients.map(recipientId => ({
      recipient_id: recipientId,
      title: formData.title,
      message: formData.message
    }));

    const { error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) {
      toast.error("Failed to send notifications");
    } else {
      toast.success(`Notifications sent to ${recipients.length} students`);
      setFormData({
        target: "all",
        batch_id: "",
        student_id: "",
        title: "",
        message: ""
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div>
            <Label>Send To</Label>
            <Select value={formData.target} onValueChange={(value: any) => setFormData({ ...formData, target: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="batch">Specific Batch</SelectItem>
                <SelectItem value="individual">Individual Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.target === "batch" && (
            <div>
              <Label>Select Batch</Label>
              <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })} required>
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
          )}

          {formData.target === "individual" && (
            <div>
              <Label>Select Student</Label>
              <Select value={formData.student_id} onValueChange={(value) => setFormData({ ...formData, student_id: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.profile.full_name} - {student.profile.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Notification title"
              required
            />
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Notification message"
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};