import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Test {
  id: string;
  subject: string;
  test_date: string;
  max_marks: number;
  batch: {
    name: string;
  };
}

interface TestMark {
  id: string;
  marks_obtained: number | null;
  retest_eligible: boolean;
  student: {
    profile: {
      full_name: string;
    };
  };
}

export const TestManagement = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [testMarks, setTestMarks] = useState<Record<string, { marks: string; retest: boolean }>>({});
  const [existingMarks, setExistingMarks] = useState<TestMark[]>([]);
  
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testFormData, setTestFormData] = useState({
    batch_id: "",
    subject: "",
    test_date: "",
    max_marks: ""
  });

  useEffect(() => {
    fetchTests();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchTestMarks();
      fetchStudentsForTest();
    }
  }, [selectedTest]);


  const fetchTests = async () => {
    const { data } = await supabase
      .from("tests")
      .select(`
        *,
        batch:batches(name)
      `)
      .order("test_date", { ascending: false });
    
    if (data) setTests(data as any);
  };

  const fetchBatches = async () => {
    const { data } = await supabase
      .from("batches")
      .select("*")
      .order("name");
    
    if (data) setBatches(data);
  };

  const fetchTestMarks = async () => {
    const { data } = await supabase
      .from("test_marks")
      .select(`
        *,
        student:students!inner(
          profile:profiles(full_name)
        )
      `)
      .eq("test_id", selectedTest);
    
    if (data) {
      setExistingMarks(data as any);
      const marksMap: Record<string, { marks: string; retest: boolean }> = {};
      data.forEach((mark: any) => {
        marksMap[mark.student_id] = {
          marks: mark.marks_obtained?.toString() || "",
          retest: mark.retest_eligible
        };
      });
      setTestMarks(marksMap);
    }
  };

  const fetchStudentsForTest = async () => {
    const test = tests.find(t => t.id === selectedTest);
    if (!test) return;

    const batchId = (test as any).batch_id;
    const { data } = await supabase
      .from("students")
      .select(`
        id,
        profile:profiles(full_name)
      `)
      .eq("batch_id", batchId);
    
    if (data) setStudents(data);
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const testData = {
      batch_id: testFormData.batch_id,
      subject: testFormData.subject,
      test_date: testFormData.test_date,
      max_marks: parseInt(testFormData.max_marks)
    };

    if (editingTestId) {
      const { error } = await supabase
        .from("tests")
        .update(testData)
        .eq("id", editingTestId);

      if (error) {
        toast.error("Failed to update test");
      } else {
        toast.success("Test updated successfully");
        resetTestForm();
        fetchTests();
      }
    } else {
      const { error } = await supabase
        .from("tests")
        .insert([testData]);

      if (error) {
        toast.error("Failed to create test");
      } else {
        toast.success("Test created successfully");
        resetTestForm();
        fetchTests();
      }
    }
  };

  const handleMarksSubmit = async () => {
    if (!selectedTest) return;

    // Delete existing marks for this test
    await supabase
      .from("test_marks")
      .delete()
      .eq("test_id", selectedTest);

    // Insert new marks
    const marksData = Object.entries(testMarks).map(([studentId, data]) => ({
      test_id: selectedTest,
      student_id: studentId,
      marks_obtained: data.marks ? parseFloat(data.marks) : null,
      retest_eligible: data.retest
    }));

    const { error } = await supabase
      .from("test_marks")
      .insert(marksData);

    if (error) {
      toast.error("Failed to save marks");
    } else {
      toast.success("Marks saved successfully");
      fetchTestMarks();
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm("Are you sure? This will delete all marks for this test.")) return;

    const { error } = await supabase
      .from("tests")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete test");
    } else {
      toast.success("Test deleted successfully");
      fetchTests();
    }
  };

  const resetTestForm = () => {
    setTestFormData({ batch_id: "", subject: "", test_date: "", max_marks: "" });
    setEditingTestId(null);
    setIsTestDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tests & Marks Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tests">
          <TabsList>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="marks">Enter Marks</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isTestDialogOpen} onOpenChange={(open) => {
                setIsTestDialogOpen(open);
                if (!open) resetTestForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Test
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTestId ? "Edit" : "Create"} Test</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTestSubmit} className="space-y-4">
                    <div>
                      <Label>Batch</Label>
                      <Select value={testFormData.batch_id} onValueChange={(value) => setTestFormData({ ...testFormData, batch_id: value })} required>
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
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={testFormData.subject}
                        onChange={(e) => setTestFormData({ ...testFormData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Test Date</Label>
                      <Input
                        type="date"
                        value={testFormData.test_date}
                        onChange={(e) => setTestFormData({ ...testFormData, test_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Maximum Marks</Label>
                      <Input
                        type="number"
                        value={testFormData.max_marks}
                        onChange={(e) => setTestFormData({ ...testFormData, max_marks: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">{editingTestId ? "Update" : "Create"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map(test => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.subject}</TableCell>
                    <TableCell>{test.batch.name}</TableCell>
                    <TableCell>{new Date(test.test_date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>{test.max_marks}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTest(test.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="marks" className="space-y-4">
            <div>
              <Label>Select Test</Label>
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test to enter marks" />
                </SelectTrigger>
                <SelectContent>
                  {tests.map(test => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.subject} - {test.batch.name} - {new Date(test.test_date).toLocaleDateString("en-IN")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTest && students.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Retest Eligible</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.profile.full_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="Marks"
                            value={testMarks[student.id]?.marks || ""}
                            onChange={(e) => setTestMarks({
                              ...testMarks,
                              [student.id]: {
                                ...testMarks[student.id],
                                marks: e.target.value,
                                retest: testMarks[student.id]?.retest || false
                              }
                            })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={testMarks[student.id]?.retest || false}
                            onChange={(e) => setTestMarks({
                              ...testMarks,
                              [student.id]: {
                                marks: testMarks[student.id]?.marks || "",
                                retest: e.target.checked
                              }
                            })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button onClick={handleMarksSubmit} className="w-full">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Save All Marks
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};