import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Testimonials = () => {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  // Default testimonials if database is empty
  const defaultTestimonials = [
    {
      id: "1",
      student_name: "Priya Sharma",
      content: "Tilin's Math completely transformed my understanding of calculus. The personalized attention and clear explanations helped me score 98% in my board exams!",
      rating: 5,
    },
    {
      id: "2",
      student_name: "Rahul Krishnan",
      content: "The online classes are so convenient and effective. I never miss a class, and the recorded sessions help me revise anytime. Highly recommended!",
      rating: 5,
    },
    {
      id: "3",
      student_name: "Sarah Johnson",
      content: "As an international student following Cambridge curriculum, I was struggling with mathematics. Tilin's Math made it so much easier to understand complex topics.",
      rating: 5,
    },
  ];

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from our students who have achieved excellence in mathematics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 shadow-card hover:shadow-elegant transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "{testimonial.content}"
              </p>
              <div className="font-semibold text-sm">
                - {testimonial.student_name}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;