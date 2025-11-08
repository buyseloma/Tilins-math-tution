import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";

interface TestMark {
  id: string;
  test_id: string;
  marks_obtained: number | null;
  retest_eligible: boolean;
  retest_date: string | null;
  test: {
    subject: string;
    max_marks: number;
    test_date: string;
  };
}

export const TestMarks = () => {
  const [marks, setMarks] = useState<TestMark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();

    // Set up realtime subscription for test marks
    const channel = supabase
      .channel('test_marks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_marks'
        },
        () => {
          fetchMarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("test_marks")
      .select(`
        *,
        test:tests(subject, max_marks, test_date)
      `)
      .eq("student_id", user.id)
      .order("test_id", { ascending: false });

    if (!error && data) {
      setMarks(data as any);
    }
    setLoading(false);
  };

  const getPercentage = (obtained: number | null, max: number) => {
    if (obtained === null) return 0;
    return (obtained / max) * 100;
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-600" };
    if (percentage >= 80) return { grade: "A", color: "text-green-500" };
    if (percentage >= 70) return { grade: "B+", color: "text-blue-600" };
    if (percentage >= 60) return { grade: "B", color: "text-blue-500" };
    if (percentage >= 50) return { grade: "C", color: "text-yellow-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const handleRetestRequest = async (markId: string, testId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if already registered
    const { data: existing } = await supabase
      .from("test_marks")
      .select("retest_date")
      .eq("id", markId)
      .maybeSingle();

    if (existing?.retest_date) {
      toast.info("You're already registered for the retest");
      return;
    }

    // Send notification to admin
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminRoles) {
      for (const admin of adminRoles) {
        await supabase.from("notifications").insert({
          recipient_id: admin.user_id,
          title: "Retest Request",
          message: `Student has requested a retest registration`,
        });
      }
    }

    toast.success("Retest request submitted! Admin will schedule it soon.");
    fetchMarks();
  };

  if (loading) return <div className="text-center py-8">Loading marks...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Marks & Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {marks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No test results available</p>
        ) : (
          <div className="space-y-4">
            {marks.map(mark => {
              const percentage = getPercentage(mark.marks_obtained, mark.test.max_marks);
              const gradeInfo = getGrade(percentage);
              
              return (
                <div key={mark.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{mark.test.subject}</h4>
                    </div>
                    <Badge className={gradeInfo.color}>{gradeInfo.grade}</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-semibold">
                        {mark.marks_obtained ?? "N/A"} / {mark.test.max_marks}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Percentage</span>
                      <span className="font-semibold">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(mark.test.test_date).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>

                  {mark.retest_eligible && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Retest Available</p>
                          {mark.retest_date && (
                            <p className="text-xs text-muted-foreground">
                              Scheduled: {new Date(mark.retest_date).toLocaleDateString("en-IN")}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleRetestRequest(mark.id, mark.test_id)}
                          disabled={!!mark.retest_date}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {mark.retest_date ? "Registered" : "Request Retest"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
