import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const classroomImages = [
    { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b", caption: "Interactive Math Session" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7", caption: "Classroom Learning" },
    { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6", caption: "Group Study Session" },
    { url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d", caption: "Problem Solving Class" },
  ];

  const onlineSessionImages = [
    { url: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b", caption: "Online Interactive Learning" },
    { url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04", caption: "Virtual Classroom" },
    { url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8", caption: "Remote Math Tutoring" },
    { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3", caption: "Digital Learning Platform" },
  ];

  const achievementImages = [
    { url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1", caption: "Math Olympiad Winners" },
    { url: "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e", caption: "Board Exam Toppers" },
    { url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173", caption: "Academic Excellence Awards" },
    { url: "https://images.unsplash.com/photo-1517842645767-c639042777db", caption: "Student Success Stories" },
  ];

  const allGalleries = {
    classroom: classroomImages,
    online: onlineSessionImages,
    achievements: achievementImages,
  };

  const ImageModal = ({ url, onClose }: { url: string; onClose: () => void }) => (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={url}
        alt="Gallery"
        className="max-w-full max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  const GalleryGrid = ({ images }: { images: typeof classroomImages }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image, index) => (
        <Card
          key={index}
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedImage(image.url)}
        >
          <div className="aspect-video overflow-hidden">
            <img
              src={image.url}
              alt={image.caption}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4">
            <p className="text-sm font-medium text-center">{image.caption}</p>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 to-accent/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Our Gallery
              </h1>
              <p className="text-lg text-muted-foreground">
                A glimpse into our learning environment, online sessions, and student achievements at Tilin's Math
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Tabs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="classroom" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
                <TabsTrigger value="classroom">Classroom</TabsTrigger>
                <TabsTrigger value="online">Online Sessions</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="classroom">
                <GalleryGrid images={allGalleries.classroom} />
              </TabsContent>

              <TabsContent value="online">
                <GalleryGrid images={allGalleries.online} />
              </TabsContent>

              <TabsContent value="achievements">
                <GalleryGrid images={allGalleries.achievements} />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />

      {selectedImage && (
        <ImageModal url={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

export default GalleryPage;
