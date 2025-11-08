import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export const NotesUpload = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_id: "",
    title: ""
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchClasses(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    const { data } = await supabase
      .from("batches")
      .select("*")
      .order("name");
    
    if (data) setBatches(data);
  };

  const fetchClasses = async (batchId: string) => {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("batch_id", batchId)
      .order("date", { ascending: false });
    
    if (data) setClasses(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.class_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('class-notes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Save note record
      const { error } = await supabase
        .from("class_notes")
        .insert([{
          ...formData,
          file_url: fileName,
          uploaded_by: user.id
        }]);

      if (error) {
        throw error;
      }

      toast.success("Note uploaded successfully");
      setFormData({ class_id: "", title: "" });
      setFile(null);
      setSelectedBatch("");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Class Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div>
            <Label htmlFor="batch">Select Batch</Label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch first" />
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
            <Label htmlFor="class">Select Class</Label>
            <Select 
              value={formData.class_id} 
              onValueChange={(value) => setFormData({ ...formData, class_id: value })}
              disabled={!selectedBatch}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.subject} - {new Date(cls.date).toLocaleDateString("en-IN")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Note Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Chapter 5 - Linear Equations"
              required
            />
          </div>

          <div>
            <Label htmlFor="file">Upload PDF File</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            {file && <p className="text-xs text-muted-foreground mt-1">{file.name}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Note
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
