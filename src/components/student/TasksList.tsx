import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  submission?: {
    is_completed: boolean;
    submitted_at: string | null;
  };
}

export const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();

    // Set up realtime subscription for tasks and submissions
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_submissions'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: student } = await supabase
      .from("students")
      .select("batch_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!student || !student.batch_id) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        submission:task_submissions(is_completed, submitted_at)
      `)
      .eq("batch_id", student.batch_id)
      .order("due_date", { ascending: true });

    if (!error && data) {
      setTasks(data.map(task => ({
        ...task,
        submission: Array.isArray(task.submission) ? task.submission[0] : task.submission
      })) as any);
    }
    setLoading(false);
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("task_submissions")
      .upsert({
        task_id: taskId,
        student_id: user.id,
        is_completed: !currentStatus,
        submitted_at: !currentStatus ? new Date().toISOString() : null
      }, {
        onConflict: "task_id,student_id"
      });

    if (error) {
      toast.error("Failed to update task status");
    } else {
      toast.success(!currentStatus ? "Task marked as complete" : "Task marked as incomplete");
      fetchTasks();
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const pendingTasks = tasks.filter(t => !t.submission?.is_completed);
  const completedTasks = tasks.filter(t => t.submission?.is_completed);

  if (loading) return <div className="text-center py-8">Loading tasks...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Tasks & Homework
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-orange-600">
              Pending Tasks ({pendingTasks.length})
            </h3>
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending tasks</p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.submission?.is_completed || false}
                        onCheckedChange={() => toggleTaskCompletion(task.id, task.submission?.is_completed || false)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{task.title}</h4>
                          {isOverdue(task.due_date) && (
                            <Badge variant="destructive" className="ml-2">Overdue</Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-green-600">
              Completed Tasks ({completedTasks.length})
            </h3>
            {completedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed tasks</p>
            ) : (
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <div key={task.id} className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => toggleTaskCompletion(task.id, true)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium line-through">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Completed: {task.submission?.submitted_at ? 
                            new Date(task.submission.submitted_at).toLocaleDateString("en-IN") : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
