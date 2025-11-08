import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface ClassCompletionProps {
  batches: any[];
}

export const ClassCompletion = ({ batches }: ClassCompletionProps) => {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBatch) {
      fetchClasses();
    }
  }, [selectedBatch]);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("*, batch:batches(name)")
      .eq("batch_id", selectedBatch)
      .order("date", { ascending: false })
      .limit(20);

    if (data) {
      setClasses(data);
    }
  };

  const toggleCompletion = async (classId: string, currentStatus: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from("classes")
      .update({ is_completed: !currentStatus })
      .eq("id", classId);

    if (error) {
      toast.error("Failed to update class status");
    } else {
      toast.success(!currentStatus ? "Class marked as completed" : "Class marked as incomplete");
      fetchClasses();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Mark Classes as Completed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Batch</label>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Choose batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map(batch => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name} - {batch.board.toUpperCase()} - Grade {batch.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBatch && classes.length > 0 && (
          <div className="space-y-3 mt-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className={`p-4 border rounded-lg transition-colors ${
                  cls.is_completed ? "bg-green-50 dark:bg-green-950" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{cls.subject}</h4>
                      {cls.is_completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(cls.date).toLocaleDateString("en-IN")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{cls.time} ({cls.duration_minutes} mins)</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={cls.is_completed ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleCompletion(cls.id, cls.is_completed)}
                    disabled={loading}
                  >
                    {cls.is_completed ? "Mark Incomplete" : "Mark Complete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedBatch && classes.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No classes found for this batch</p>
        )}
      </CardContent>
    </Card>
  );
};
