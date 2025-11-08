import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import About from "@/components/home/About";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;