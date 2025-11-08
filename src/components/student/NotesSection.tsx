import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface Note {
  id: string;
  title: string;
  file_url: string;
  uploaded_at: string;
}

export const NotesSection = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();

    // Set up realtime subscription for class notes
    const channel = supabase
      .channel('class_notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_notes'
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotes = async () => {
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

    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("batch_id", student.batch_id);

    if (!classes || classes.length === 0) {
      setLoading(false);
      return;
    }

    const classIds = classes.map(c => c.id);

    const { data, error } = await supabase
      .from("class_notes")
      .select("*")
      .in("class_id", classIds)
      .order("uploaded_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-8">Loading notes...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No notes available</p>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{note.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(note.uploaded_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={note.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
