import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, CheckCircle, Users, Video, Calendar } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Courses = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    board: "",
    preferredMode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("demo_bookings")
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          board: formData.board as any,
          preferred_mode: formData.preferredMode as any,
        });

      if (error) throw error;

      toast.success("Demo class booked successfully! We'll contact you soon.");
      setFormData({ fullName: "", email: "", phone: "", board: "", preferredMode: "" });
    } catch (error) {
      toast.error("Failed to book demo class. Please try again.");
    }
  };

  const courses = [
    {
      name: "State Board Mathematics",
      board: "Tamil Nadu State Board",
      grades: "Grades 6-12",
      description: "Comprehensive mathematics coaching aligned with State Board curriculum, focusing on exam patterns and scoring techniques.",
      features: [
        "Tamil/English Medium available",
        "Board exam pattern analysis",
        "Previous year question papers",
        "Regular mock tests",
        "Concept clarity sessions",
      ],
    },
    {
      name: "CBSE Mathematics",
      board: "Central Board of Secondary Education",
      grades: "Grades 6-12",
      description: "NCERT-based mathematics coaching with focus on conceptual understanding and problem-solving skills.",
      features: [
        "NCERT solutions and exemplars",
        "Sample papers and practice tests",
        "Chapter-wise assessments",
        "Olympiad preparation",
        "Board exam strategies",
      ],
    },
    {
      name: "ICSE Mathematics",
      board: "Indian Certificate of Secondary Education",
      grades: "Grades 6-10",
      description: "Detailed mathematics coaching for ICSE students with emphasis on application-based learning.",
      features: [
        "Complete syllabus coverage",
        "Problem-solving workshops",
        "Previous board papers",
        "Project guidance",
        "Practical applications",
      ],
    },
    {
      name: "Cambridge Mathematics",
      board: "Cambridge International",
      grades: "IGCSE & A-Levels",
      description: "International standard mathematics coaching for Cambridge curriculum students worldwide.",
      features: [
        "IGCSE and A-Level coverage",
        "Past papers practice",
        "International exam techniques",
        "Core and Extended syllabus",
        "Online live classes",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Header */}
        <section className="bg-gradient-hero text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Our Courses
              </h1>
              <p className="text-xl">
                Choose from our comprehensive mathematics programs tailored for different boards
              </p>
            </div>
          </div>
        </section>

        {/* Courses Details */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-12 max-w-6xl mx-auto">
              {courses.map((course, index) => (
                <Card key={index} className="p-8 shadow-card hover:shadow-elegant transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4">
                      <div className="bg-primary/10 w-20 h-20 rounded-lg flex items-center justify-center mb-4">
                        <BookOpen className="h-10 w-10 text-primary" />
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{course.board}</div>
                      <div className="text-sm font-medium">{course.grades}</div>
                    </div>
                    <div className="md:w-3/4">
                      <h3 className="text-2xl font-serif font-bold mb-3">{course.name}</h3>
                      <p className="text-muted-foreground mb-6">{course.description}</p>
                      <ul className="grid md:grid-cols-2 gap-3">
                        {course.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Class Modes */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              Choose Your Learning Mode
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 text-center shadow-card">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Online Classes</h3>
                <p className="text-muted-foreground mb-4">
                  Interactive live sessions via Google Meet/Zoom with screen sharing and digital whiteboard
                </p>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Recorded sessions available
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Learn from anywhere
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Digital study materials
                  </li>
                </ul>
              </Card>

              <Card className="p-8 text-center shadow-card">
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Offline Classes</h3>
                <p className="text-muted-foreground mb-4">
                  Traditional classroom learning in Thurayur with personal attention and peer interaction
                </p>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Face-to-face learning
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Small batch sizes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Immediate doubt clearing
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 shadow-elegant">
                <div className="text-center mb-8">
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-serif font-bold mb-2">Book a Demo Class</h2>
                  <p className="text-muted-foreground">
                    Experience our teaching methodology with a free demo class
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <Label htmlFor="board">Select Board *</Label>
                    <Select required value={formData.board} onValueChange={(value) => setFormData({ ...formData, board: value })}>
                      <SelectTrigger id="board">
                        <SelectValue placeholder="Choose your curriculum board" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="state_board">State Board</SelectItem>
                        <SelectItem value="cbse">CBSE</SelectItem>
                        <SelectItem value="icse">ICSE</SelectItem>
                        <SelectItem value="cambridge">Cambridge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mode">Preferred Class Mode *</Label>
                    <Select required value={formData.preferredMode} onValueChange={(value) => setFormData({ ...formData, preferredMode: value })}>
                      <SelectTrigger id="mode">
                        <SelectValue placeholder="Choose your preferred mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online Classes</SelectItem>
                        <SelectItem value="offline">Offline Classes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Book Demo Class
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;