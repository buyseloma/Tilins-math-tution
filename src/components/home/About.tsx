import { Card } from "@/components/ui/card";
import { Target, Heart, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            About Tilin's Math
          </h2>
          <p className="text-lg text-muted-foreground">
            Founded with a passion for mathematics education, Tilin's Math has been empowering 
            students to excel in mathematics through personalized coaching and proven teaching methods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 text-center shadow-card hover:shadow-elegant transition-all">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Our Mission</h3>
            <p className="text-muted-foreground">
              To make mathematics accessible, enjoyable, and achievable for every student, 
              building strong foundations for academic success.
            </p>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-elegant transition-all">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Our Values</h3>
            <p className="text-muted-foreground">
              Excellence in teaching, individual attention, patience, and commitment to 
              each student's unique learning journey.
            </p>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-elegant transition-all">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Our Approach</h3>
            <p className="text-muted-foreground">
              Interactive sessions, concept clarity, regular practice, and continuous 
              assessment to ensure mastery of every topic.
            </p>
          </Card>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 shadow-card">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="bg-gradient-hero rounded-full w-48 h-48 flex items-center justify-center mx-auto">
                  <div className="text-primary-foreground text-center">
                    <div className="text-4xl font-bold mb-2">TM</div>
                    <div className="text-sm">Founder & Lead Instructor</div>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-serif font-bold mb-4">Meet the Founder</h3>
                <p className="text-muted-foreground mb-4">
                  With over 15 years of experience in mathematics education, our founder has 
                  helped thousands of students achieve their academic goals. Specializing in 
                  multiple curriculum boards, we bring a wealth of knowledge and proven teaching 
                  methodologies to every class.
                </p>
                <p className="text-muted-foreground">
                  Our teaching philosophy centers on building conceptual understanding rather than 
                  rote memorization, ensuring students develop true mathematical thinking skills 
                  that serve them throughout their academic and professional lives.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default About;