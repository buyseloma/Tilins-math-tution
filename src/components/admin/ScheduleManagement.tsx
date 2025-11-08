import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const ScheduleManagement = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    batch_id: "",
    subject: "",
    date: "",
    time: "",
    duration_minutes: 60,
    meet_link: ""
  });

  useEffect(() => {
    fetchBatches();
    fetchClasses();
  }, []);

  const fetchBatches = async () => {
    const { data } = await supabase
      .from("batches")
      .select("*")
      .order("name");
    
    if (data) setBatches(data);
  };

  const fetchClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select(`
        *,
        batch:batches(name)
      `)
      .order("date", { ascending: false })
      .order("time", { ascending: false })
      .limit(20);
    
    if (data) setClasses(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("classes")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast.error("Failed to update class");
      } else {
        toast.success("Class updated successfully");
        resetForm();
        fetchClasses();
      }
    } else {
      const { error } = await supabase
        .from("classes")
        .insert([formData]);

      if (error) {
        toast.error("Failed to create class");
      } else {
        toast.success("Class scheduled successfully");
        resetForm();
        fetchClasses();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete class");
    } else {
      toast.success("Class deleted successfully");
      fetchClasses();
    }
  };

  const resetForm = () => {
    setFormData({
      batch_id: "",
      subject: "",
      date: "",
      time: "",
      duration_minutes: 60,
      meet_link: ""
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Class Schedule Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Schedule"} Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="batch">Batch</Label>
                <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map(batch => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name} - {batch.board.toUpperCase()} Grade {batch.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Algebra, Geometry"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="meet_link">Meet Link (Optional)</Label>
                <Input
                  id="meet_link"
                  type="url"
                  value={formData.meet_link}
                  onChange={(e) => setFormData({ ...formData, meet_link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <Button type="submit" className="w-full">{editingId ? "Update" : "Schedule"} Class</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {classes.map((cls: any) => (
            <div key={cls.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{cls.subject}</h3>
                  <p className="text-sm text-muted-foreground">{cls.batch.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(cls.date).toLocaleDateString("en-IN")} at {cls.time}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingId(cls.id);
                    setFormData({
                      batch_id: cls.batch_id,
                      subject: cls.subject,
                      date: cls.date,
                      time: cls.time,
                      duration_minutes: cls.duration_minutes,
                      meet_link: cls.meet_link || ""
                    });
                    setIsDialogOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(cls.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
