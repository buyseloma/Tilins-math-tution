import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Gallery = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-center mb-8">Gallery</h1>
          <p className="text-center text-muted-foreground mb-12">Photos from our classes and events</p>
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Gallery images will be added soon</p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;