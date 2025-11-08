import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
            Master Mathematics with Tilin's Math
          </h1>
          <p className="text-xl md:text-2xl font-medium">
            Expert Coaching for State Board, CBSE, ICSE & Cambridge
          </p>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Trusted by learners worldwide — personalized math learning with expert teachers, 
            available online and offline.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/courses">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Book a Demo Class
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Login to Student Portal
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-secondary/20 p-4 rounded-full">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-primary-foreground/80">Students Worldwide</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-secondary/20 p-4 rounded-full">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold">4</div>
              <div className="text-sm text-primary-foreground/80">Curriculum Boards</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-secondary/20 p-4 rounded-full">
                <Award className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold">15+</div>
              <div className="text-sm text-primary-foreground/80">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;