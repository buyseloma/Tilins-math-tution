import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  registration?: {
    id: string;
  };
}

export const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        registration:event_registrations(id)
      `)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true });

    if (!error && data) {
      setEvents(data.map(event => ({
        ...event,
        registration: Array.isArray(event.registration) ? event.registration[0] : event.registration
      })) as any);
    }
    setLoading(false);
  };

  const handleRegister = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("event_registrations")
      .insert({
        event_id: eventId,
        student_id: user.id
      });

    if (error) {
      toast.error("Failed to register for event");
    } else {
      toast.success("Successfully registered for event!");
      fetchEvents();
    }
  };

  const handleUnregister = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("student_id", user.id);

    if (error) {
      toast.error("Failed to unregister from event");
    } else {
      toast.success("Successfully unregistered from event");
      fetchEvents();
    }
  };

  if (loading) return <div className="text-center py-8">Loading events...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No upcoming events</p>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">{event.title}</h4>
                  </div>
                  {event.registration && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Registered
                    </Badge>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.event_date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}</span>
                  </div>
                  
                  {event.registration ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUnregister(event.id)}
                    >
                      Unregister
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleRegister(event.id)}
                    >
                      Register Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
