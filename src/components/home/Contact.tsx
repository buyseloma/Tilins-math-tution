import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
const Contact = () => {
  return <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions? We're here to help you start your mathematics journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 text-center shadow-card hover:shadow-elegant transition-all">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Phone</h3>
            <a href="tel:+919486195284" className="text-muted-foreground hover:text-primary transition-colors">+91 9486195284
          </a>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-elegant transition-all">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">WhatsApp</h3>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              Chat with us
            </a>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-elegant transition-all">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Email</h3>
            <a href="mailto:info@tilinsmath.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              info@tilinsmath.com
            </a>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-elegant transition-all">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-muted-foreground text-sm">
              Thurayur<br />Tamil Nadu, India
            </p>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Us on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>;
};
export default Contact;
