import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Class {
  id: string;
  subject: string;
  date: string;
  time: string;
  duration_minutes: number;
  meet_link: string | null;
  is_completed: boolean;
}

export const ClassesList = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();

    // Set up real-time updates
    const channel = supabase
      .channel('classes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        () => {
          fetchClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClasses = async () => {
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
      .from("classes")
      .select("*")
      .eq("batch_id", student.batch_id)
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (!error && data) {
      setClasses(data);
    }
    setLoading(false);
  };

  const upcomingClasses = classes.filter(c => !c.is_completed);
  const completedClasses = classes.filter(c => c.is_completed);

  const ClassCard = ({ cls }: { cls: Class }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{cls.subject}</h3>
          </div>
          <Badge variant={cls.is_completed ? "secondary" : "default"}>
            {cls.is_completed ? "Completed" : "Upcoming"}
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(cls.date).toLocaleDateString("en-IN", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{cls.time} ({cls.duration_minutes} mins)</span>
          </div>
        </div>
        {cls.meet_link && !cls.is_completed && (
          <Button className="mt-3 w-full" asChild>
            <a href={cls.meet_link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Class
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) return <div className="text-center py-8">Loading classes...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming ({upcomingClasses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedClasses.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4">
            {upcomingClasses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No upcoming classes</p>
            ) : (
              upcomingClasses.map(cls => <ClassCard key={cls.id} cls={cls} />)
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            {completedClasses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed classes</p>
            ) : (
              completedClasses.map(cls => <ClassCard key={cls.id} cls={cls} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
