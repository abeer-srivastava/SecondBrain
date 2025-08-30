import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
export default function LandingPage() {
    return (
    <div className="bg-gradient-to-br from-[#EFF6E0] to-[#AEC3B0] min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center bg-background/50 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-[#124559]">Second Brain</h1>
        <nav className="space-x-6 hidden md:flex">
          <a href="#features" className="text-[#124559] hover:text-[#598392]">Features</a>
          <a href="#about" className="text-[#124559] hover:text-[#598392]">About</a>
          <a href="#contact" className="text-[#124559] hover:text-[#598392]">Contact</a>
        </nav>
        <Button className="bg-[#124559] hover:bg-[#598392] text-white rounded-xl shadow-md" onClick={()=>{}}>
          <Link to={"/signup"}>Get Started</Link>
        </Button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-[#124559] mb-6"
        >
          Your Second Brain, Organized
        </motion.h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
          Capture ideas, organize knowledge, and unlock your creativity with Second Brain.
        </p>
        <Button className="bg-[#124559] hover:bg-[#598392] text-white px-6 py-3 text-lg rounded-xl shadow-lg">
          Start Free Today
        </Button>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-8 grid md:grid-cols-3 gap-8">
        {[
          { title: "Capture Everything", desc: "Save notes, links, and tasks in one place." },
          { title: "Organize Smartly", desc: "Use tags, folders, and search to stay productive." },
          { title: "Access Anywhere", desc: "Your brain syncs across all devices seamlessly." },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className=" rounded-2xl shadow-lg p-6   bg-[#598392] hover:bg-[#598392]"
          >
            <h3 className="text-xl font-semibold text-[#124559] mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-background/60 backdrop-blur-sm text-center py-6 mt-auto">
        <p className="text-gray-700">
          © {new Date().getFullYear()} Second Brain. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
