import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video } from "lucide-react";

interface ScheduleViewProps {
  batches: any[];
}

export const ScheduleView = ({ batches }: ScheduleViewProps) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [batches]);

  const fetchSchedule = async () => {
    if (!batches.length) return;

    const batchIds = batches.map(b => b.id);
    
    const { data } = await supabase
      .from("classes")
      .select(`
        *,
        batch:batches(name, grade, board, mode)
      `)
      .in("batch_id", batchIds)
      .gte("date", new Date().toISOString().split('T')[0])
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (data) {
      setClasses(data);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading schedule...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming classes scheduled</p>
          ) : (
            classes.map((cls) => (
              <Card key={cls.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{cls.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cls.batch?.name} - {cls.batch?.board.toUpperCase()} Grade {cls.batch?.grade}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(cls.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {cls.time}
                        </div>
                      </div>
                      {cls.meet_link && (
                        <a
                          href={cls.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Video className="h-4 w-4" />
                          Join Meeting
                        </a>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={cls.batch?.mode === "online" ? "default" : "secondary"}>
                        {cls.batch?.mode}
                      </Badge>
                      {cls.is_completed && (
                        <Badge variant="outline">Completed</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
