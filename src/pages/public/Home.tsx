import { useEffect, useState } from "react";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion, type Variants } from 'framer-motion';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Paintbrush, Users, Mail, Palette, Brush, Send, Award, GalleryThumbnails, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import API from "../../lib/api";
import 'flowbite';
import { initFlowbite } from 'flowbite';

// Define types
type Artwork = {
  id: number;
  title: string;
  artist: string;
  image_url: string;
  category: string;
  medium: string;
};

type Event = {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
};

type NewsletterForm = {
  email: string;
};

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

// Custom arrow components for the artwork carousel
const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <Button
    variant="outline"
    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-sm bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:bg-teal-500 hover:text-white transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md"
    onClick={onClick}
    aria-label="Previous slide"
  >
    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
  </Button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <Button
    variant="outline"
    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-sm bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:bg-teal-500 hover:text-white transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md"
    onClick={onClick}
    aria-label="Next slide"
  >
    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
  </Button>
);

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { register: registerNewsletter, handleSubmit: handleNewsletterSubmit, reset: resetNewsletter, formState: { errors: newsletterErrors } } = useForm<NewsletterForm>();
  const { register: registerContact, handleSubmit: handleContactSubmit, reset: resetContact, formState: { errors: contactErrors } } = useForm<ContactForm>();

  // Initialize Flowbite
  useEffect(() => {
    initFlowbite();
  }, []);

  // Fetch featured artworks and upcoming events
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await API.get("/featured-artworks/");
        setArtworks(res.data.results);
      } catch (err) {
        console.error("Failed to load artworks:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await API.get("/events/");
        setEvents(res.data.results);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    };

    fetchArtworks();
    fetchEvents();
  }, []);

  // Handle newsletter subscription
  const onNewsletterSubmit = async (data: NewsletterForm) => {
    try {
      await API.post("/newsletter/subscribe/", { email: data.email });
      toast.success("Subscribed successfully!");
      resetNewsletter();
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  // Handle contact form submission
  const onContactSubmit = async (data: ContactForm) => {
    try {
      await API.post("/contact/", data);
      toast.success("Message sent successfully!");
      resetContact();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Carousel settings for artwork slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { 
        breakpoint: 1024, 
        settings: { 
          slidesToShow: 2,
          dots: true
        } 
      },
      { 
        breakpoint: 640, 
        settings: { 
          slidesToShow: 1,
          dots: true
        } 
      },
    ],
  };

  // Animation variants
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: "easeOut" as const,
        staggerChildren: 0.1
      } 
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Hero Section with Flowbite Carousel */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="relative w-full py-0"
      >
        <div id="hero-carousel" className="relative w-full" data-carousel="slide">
          {/* Carousel wrapper */}
          <div className="relative h-[70vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] overflow-hidden">
            {/* Slide 1 */}
            <div className="duration-700 ease-in-out" data-carousel-item="active">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-teal-900/70 dark:from-gray-900/90 dark:to-teal-900/80 flex items-center justify-center">
                  <div className="text-center max-w-4xl mx-auto px-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="mb-8"
                    >
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
                        Visual Arts Collective
                      </h1>
                      <div className="flex justify-center items-center">
                        <div className="w-16 h-1 bg-teal-400 rounded-full mx-2"></div>
                        <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-teal-300" />
                        <div className="w-16 h-1 bg-teal-400 rounded-full mx-2"></div>
                      </div>
                    </motion.div>
                    <motion.p
                      className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8 font-light"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Where creativity meets community in a celebration of artistic expression
                    </motion.p>
                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <Button
                        className="text-base px-8 py-6 bg-teal-600 hover:bg-teal-700 text-white transform hover:scale-105 transition-all duration-300 shadow-lg"
                        onClick={() => setDialogOpen(true)}
                      >
                        <Users className="w-5 h-5 mr-2" />
                        Join Our Community
                      </Button>
                      <Button
                        variant="outline"
                        className="text-base px-8 py-6 border-white text-white hover:bg-white/10 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        asChild
                      >
                        <a href="/gallery">
                          <GalleryThumbnails className="w-5 h-5 mr-2" />
                          Explore Gallery
                        </a>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
            {/* Slide 2 */}
            <div className="hidden duration-700 ease-in-out" data-carousel-item>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578926375605-eaf7559b1458?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1934&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-blue-900/70 dark:from-gray-900/90 dark:to-blue-900/80 flex items-center justify-center">
                  <div className="text-center max-w-4xl mx-auto px-6">
                    <motion.h1
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      Discover Emerging Talent
                    </motion.h1>
                    <motion.p
                      className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8 font-light"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Curated collections from our diverse community of artists and creators
                    </motion.p>
                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <Button
                        className="text-base px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 transition-all duration-300 shadow-lg"
                        asChild
                      >
                        <a href="/submit">
                          <Paintbrush className="w-5 h-5 mr-2" />
                          Submit Your Work
                        </a>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
            {/* Slide 3 */}
            <div className="hidden duration-700 ease-in-out" data-carousel-item>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2045&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-purple-900/70 dark:from-gray-900/90 dark:to-purple-900/80 flex items-center justify-center">
                  <div className="text-center max-w-4xl mx-auto px-6">
                    <motion.h1
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      Creative Gatherings
                    </motion.h1>
                    <motion.p
                      className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8 font-light"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Workshops, exhibitions, and networking events for artists at all levels
                    </motion.p>
                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <Button
                        className="text-base px-8 py-6 bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105 transition-all duration-300 shadow-lg"
                        asChild
                      >
                        <a href="/events">
                          <Calendar className="w-5 h-5 mr-2" />
                          View Events Calendar
                        </a>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Carousel controls */}
          <button
            type="button"
            className="absolute top-1/2 left-4 z-30 flex items-center justify-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 focus:outline-none backdrop-blur-sm transition-all duration-300"
            data-carousel-prev
          >
            <ChevronLeft className="w-6 h-6 text-white" />
            <span className="sr-only">Previous</span>
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-4 z-30 flex items-center justify-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 focus:outline-none backdrop-blur-sm transition-all duration-300"
            data-carousel-next
          >
            <ChevronRight className="w-6 h-6 text-white" />
            <span className="sr-only">Next</span>
          </button>
          {/* Carousel indicators */}
          <div className="absolute z-30 flex -translate-x-1/2 bottom-8 left-1/2 space-x-3">
            <button
              type="button"
              className="w-3 h-3 rounded-full bg-white/50 hover:bg-white focus:outline-none transition-all duration-300"
              aria-current="true"
              aria-label="Slide 1"
              data-carousel-slide-to="0"
            ></button>
            <button
              type="button"
              className="w-3 h-3 rounded-full bg-white/50 hover:bg-white focus:outline-none transition-all duration-300"
              aria-current="false"
              aria-label="Slide 2"
              data-carousel-slide-to="1"
            ></button>
            <button
              type="button"
              className="w-3 h-3 rounded-full bg-white/50 hover:bg-white focus:outline-none transition-all duration-300"
              aria-current="false"
              aria-label="Slide 3"
              data-carousel-slide-to="2"
            ></button>
          </div>
        </div>
      </motion.section>

      {/* Value Propositions */}
      <motion.section 
        className="py-16 px-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full mb-6 mx-auto">
              <Brush className="w-8 h-8 text-teal-600 dark:text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Creative Development</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Enhance your skills with our workshops, critiques, and artist development programs.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6 mx-auto">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Artist Community</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Connect with fellow artists, collaborate on projects, and grow your creative network.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-6 mx-auto">
              <Award className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Exhibition Opportunities</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Showcase your work in our curated exhibitions and gain exposure to collectors and galleries.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Artwork Carousel */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-20 px-6 max-w-7xl mx-auto bg-white dark:bg-gray-900"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800 dark:text-white">Featured Artwork</h2>
          <div className="w-20 h-1 bg-teal-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A selection of exceptional works from our community members
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading artworks...</p>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No artworks currently available. Check back soon!
          </div>
        ) : (
          <Slider {...sliderSettings} className="px-2 sm:px-4">
            {artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                className="px-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative group rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 transition-all duration-300">
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{artwork.title}</h3>
                      <p className="text-sm text-teal-300 mb-2">by {artwork.artist}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-teal-600/30 text-teal-100 rounded-full">{artwork.category}</span>
                        <span className="text-xs px-2 py-1 bg-blue-600/30 text-blue-100 rounded-full">{artwork.medium}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Slider>
        )}
        
        <div className="text-center mt-12">
          <Button
            asChild
            className="px-8 py-6 text-base bg-gray-900 hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow-lg transition-all duration-300"
          >
            <a href="/gallery">
              View Full Gallery
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-20 px-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Artists at work" 
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-1 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-800/50 to-transparent"></div>
          </div>
          
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Our Creative Community
            </h2>
            <div className="w-20 h-1 bg-teal-500 mb-8"></div>
            
            <div className="space-y-6 text-gray-600 dark:text-gray-300">
              <p className="text-lg">
                Founded in 2021, the Visual Arts Collective has grown into a vibrant hub for artists of all disciplines 
                and experience levels. We believe in the transformative power of art to connect, inspire, and elevate.
              </p>
              
              <p className="text-lg">
                Our community includes painters, sculptors, photographers, digital artists, and mixed media creators 
                who come together to share their passion and grow their practice.
              </p>
              
              <div className="mt-8">
                <Button
                  className="px-8 py-6 text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-all duration-300"
                  onClick={() => setDialogOpen(true)}
                >
                  <HeartHandshake className="w-5 h-5 mr-2" />
                  Join Our Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Upcoming Events */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-20 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>
          <div className="w-20 h-1 bg-teal-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join us for workshops, exhibitions, and creative gatherings
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No upcoming events scheduled. Check back soon for updates!</p>
            </div>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-48 bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: 'long',
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {event.description}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Location: {event.location}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        {events.length > 0 && (
          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              className="px-8 py-6 text-base border-teal-500 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/30 shadow-lg transition-all duration-300"
            >
              <a href="/events">
                View All Events
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        )}
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-20 px-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800 dark:text-white">What Our Members Say</h2>
          <div className="w-20 h-1 bg-teal-500 mx-auto mb-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
              "Joining this collective transformed my artistic practice. The feedback and support from fellow artists has been invaluable."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mr-3">
                <span className="text-teal-600 dark:text-teal-300 font-medium">SM</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Brook A.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Painter</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
              "The exhibition opportunities helped me get my first gallery representation. This community truly supports artist growth."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                <span className="text-blue-600 dark:text-blue-300 font-medium">JD</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Dawit M.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Photographer</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
              "As a beginner, the workshops gave me the confidence and skills to start showing my work publicly."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                <span className="text-purple-600 dark:text-purple-300 font-medium">ET</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Biruk T.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mixed Media Artist</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-20 px-6 bg-gradient-to-br from-gray-900 to-teal-900"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Mail className="w-12 h-12 mx-auto text-teal-300 mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Stay Connected</h2>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-8">
            Subscribe to our newsletter for exhibition announcements, artist spotlights, and creative inspiration.
          </p>
          
          <form
            onSubmit={handleNewsletterSubmit(onNewsletterSubmit)}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Your email address"
              className="text-base bg-white/10 border border-white/20 text-white placeholder-teal-200 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 w-full"
              {...registerNewsletter("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              aria-invalid={newsletterErrors.email ? "true" : "false"}
            />
            <Button
              type="submit"
              className="px-6 py-6 text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-all duration-300"
            >
              Subscribe
              <Send className="w-5 h-5 ml-2" />
            </Button>
          </form>
          {newsletterErrors.email && (
            <p className="text-sm text-teal-200 mt-2">{newsletterErrors.email.message}</p>
          )}
          
          <p className="text-sm text-teal-200/70 mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-20 px-6 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800 dark:text-white">Get In Touch</h2>
            <div className="w-20 h-1 bg-teal-500 mb-8"></div>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Have questions about our programs or want to collaborate? We'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-lg">
                  <Mail className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-1">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">contact@visualartscollective.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-1">Community Forum</h3>
                  <p className="text-gray-600 dark:text-gray-400">Join our Telegram community</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-1">Visit Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">ASTU, Mini-media, B-307 R18</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <form onSubmit={handleContactSubmit(onContactSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <Input
                  id="name"
                  type="text"
                  className="text-base bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500 w-full"
                  {...registerContact("name", { required: "Name is required" })}
                  aria-invalid={contactErrors.name ? "true" : "false"}
                />
                {contactErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{contactErrors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  className="text-base bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500 w-full"
                  {...registerContact("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                  })}
                  aria-invalid={contactErrors.email ? "true" : "false"}
                />
                {contactErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{contactErrors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Message
                </label>
                <Textarea
                  id="message"
                  rows={5}
                  className="text-base bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500 w-full"
                  {...registerContact("message", { required: "Message is required" })}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full py-6 text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-all duration-300"
              >
                Send Message
                <Send className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </motion.section>

      {/* Join Club Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white text-center">
              Join Our Creative Community
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-teal-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Become a member to unlock all the benefits of our creative collective:
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-lg mt-1">
                  <Paintbrush className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Exhibit Your Work</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showcase your art in our curated exhibitions and online gallery
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg mt-1">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Artist Network</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect with fellow artists for collaboration and feedback
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg mt-1">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Professional Development</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access workshops, critiques, and career-building resources
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Button
                asChild
                className="py-6 text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-all duration-300"
              >
                <a href="/register">
                  Sign Up Now
                  <ChevronRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button
                variant="outline"
                className="py-6 text-base border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                onClick={() => setDialogOpen(false)}
              >
                Learn More
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}