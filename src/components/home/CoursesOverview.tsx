import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle } from "lucide-react";

const CoursesOverview = () => {
  const courses = [
    {
      name: "State Board",
      description: "Comprehensive coverage of Tamil Nadu State Board mathematics curriculum",
      features: ["Grades 6-12", "Tamil/English Medium", "Board Exam Focused"],
    },
    {
      name: "CBSE",
      description: "NCERT-aligned mathematics coaching for CBSE students",
      features: ["Grades 6-12", "Concept Clarity", "Sample Papers"],
    },
    {
      name: "ICSE",
      description: "Detailed mathematics coaching for ICSE curriculum",
      features: ["Grades 6-10", "Problem Solving", "Previous Papers"],
    },
    {
      name: "Cambridge",
      description: "International Cambridge mathematics syllabus coverage",
      features: ["IGCSE/A-Levels", "Global Standards", "Exam Techniques"],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Courses Offered
          </h2>
          <p className="text-lg text-muted-foreground">
            Expert mathematics coaching across multiple curriculum boards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {courses.map((course) => (
            <Card key={course.name} className="p-6 shadow-card hover:shadow-elegant transition-all">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
              <ul className="space-y-2">
                {course.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/courses">
            <Button size="lg">
              View All Courses & Book Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesOverview;