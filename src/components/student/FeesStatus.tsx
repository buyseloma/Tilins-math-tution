import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar } from "lucide-react";

interface Fee {
  id: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  due_date: string;
  paid_date: string | null;
}

export const FeesStatus = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();

    // Set up realtime subscription for fees
    const channel = supabase
      .channel('fees_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fees'
        },
        () => {
          fetchFees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFees = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("fees")
      .select("*")
      .eq("student_id", user.id)
      .order("due_date", { ascending: false });

    if (!error && data) {
      setFees(data);
    }
    setLoading(false);
  };

  const totalPaid = fees.filter(f => f.status === "paid").reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPending = fees.filter(f => f.status !== "paid").reduce((sum, f) => sum + Number(f.amount), 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      default: return "secondary";
    }
  };

  if (loading) return <div className="text-center py-8">Loading fees...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{totalPaid.toFixed(2)}</p>
          </div>
          <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">₹{totalPending.toFixed(2)}</p>
          </div>
        </div>

        {fees.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No fee records</p>
        ) : (
          <div className="space-y-3">
            {fees.map(fee => (
              <div key={fee.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">₹{Number(fee.amount).toFixed(2)}</span>
                  </div>
                  <Badge variant={getStatusVariant(fee.status)}>
                    {fee.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(fee.due_date).toLocaleDateString("en-IN")}</span>
                  </div>
                  {fee.paid_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Paid: {new Date(fee.paid_date).toLocaleDateString("en-IN")}</span>
                    </div>
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
