"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import GallerySection from "@/components/GallerySection";
import BookingSection from "@/components/BookingSection";
import LocationWeather from "@/components/LocationWeather";
import Footer from "@/components/Footer";

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"), {
  ssr: false,
});

const RiverBackground = dynamic(() => import("@/components/RiverBackground"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#06140e] text-[#f5f0e8] overflow-x-hidden">
      {/* Fixed Continuous 3D Mtkvari River Surface Simulation Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <RiverBackground />
      </div>

      {/* Navigation Layer */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Main Content Layers */}
      <div className="relative z-10 flex flex-col">
        {/* Hero Section */}
        <HeroSection />

        {/* Services & Experience Section */}
        <AboutSection />

        {/* Touch-Optimized Photo Gallery Carousel */}
        <GallerySection />

        {/* Booking with Calendar & Time-Slot Picker */}
        <BookingSection />

        {/* Symmetrical Location & Weather Masterclass */}
        <LocationWeather />

        {/* Footer */}
        <Footer />
      </div>

      {/* Floating WhatsApp Action Button */}
      <div className="relative z-50">
        <WhatsAppButton />
      </div>
    </main>
  );
}
