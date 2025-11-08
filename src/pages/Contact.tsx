import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Contact from "@/components/home/Contact";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;