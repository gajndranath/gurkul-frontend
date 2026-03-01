import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wifi, 
  MapPin, 
  Clock, 
  Wind, 
  Coffee, 
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Star,
  Mail,
  Phone,
  MessageSquare
} from "lucide-react";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleLogin = () => {
    navigate("/student/login");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2 rounded-xl">
              <BookOpen className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              Lib<span className="text-blue-600">Sync</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <a href="#about" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">About</a>
            <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">Features</a>
            <a href="#gallery" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">Gallery</a>
            <a href="#pricing" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">Plans</a>
            <a href="#contact" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">Contact</a>
            <Button 
                onClick={handleLogin}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-slate-200"
            >
              Sign In
            </Button>
          </div>

          <Button 
            className="lg:hidden bg-slate-900 px-6 rounded-xl"
            size="sm"
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 md:pt-56 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Premium Learning Space</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase italic">
              Focus is <br />
              <span className="text-blue-600 underline decoration-slate-100 underline-offset-8">Power.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
              Experience the pinnacle of academic environments. High-performance facilities for students who demand the best from their study time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic rounded-2xl shadow-xl shadow-blue-200"
              >
                Get Started <ArrowRight className="ml-2" size={18} />
              </Button>
              <a href="#about">
                <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-14 px-10 border-2 border-slate-100 font-black uppercase tracking-widest italic rounded-2xl hover:bg-slate-50"
                >
                    The Space
                </Button>
              </a>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-slate-100">
                <div>
                    <p className="text-3xl font-black italic">24/7</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Full Access</p>
                </div>
                <div>
                    <p className="text-3xl font-black italic">100+</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Workstations</p>
                </div>
                <div>
                    <p className="text-3xl font-black italic">300</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Mbps Speed</p>
                </div>
            </div>
          </div>
          
          <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="absolute -inset-10 bg-blue-100/40 rounded-full blur-3xl group-hover:bg-blue-200/40 transition-colors" />
            <div className="relative bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-2xl p-4">
                <div className="bg-slate-50 rounded-[32px] aspect-[4/3] flex items-center justify-center relative overflow-hidden">
                    <img 
                        src="/C:/Users/gajen/.gemini/antigravity/brain/e27d1527-cc10-4be4-bd25-5d56d31bab9b/modern_library_about_1772190524436.png" 
                        alt="Library Interior" 
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent" />
                    
                    <div className="absolute top-8 left-8 p-5 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <Clock className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Status</p>
                                <p className="text-sm font-black italic uppercase italic">Available</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
             <div className="order-2 lg:order-1 relative h-[600px] rounded-[64px] overflow-hidden border border-slate-100 shadow-2xl group">
                <img 
                    src="/C:/Users/gajen/.gemini/antigravity/brain/e27d1527-cc10-4be4-bd25-5d56d31bab9b/library_entrance_facade_1772190582462.png" 
                    alt="Our Premise" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                />
                <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-1000" />
                <div className="absolute bottom-10 left-10 p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl max-w-xs transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Main Registry</p>
                    <p className="text-sm font-bold text-slate-800 leading-tight">Biometric access control ensures full security for all members.</p>
                </div>
             </div>
             
             <div className="order-1 lg:order-2 space-y-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white italic">The Vision</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] translate-x-[-4px]">
                       Sanctuary for <br />
                       <span className="text-blue-600 underline underline-offset-8 decoration-slate-200">The Driven.</span>
                    </h2>
                </div>
                
                <div className="space-y-6 text-slate-500 font-medium leading-relaxed max-w-xl text-lg">
                    <p>
                        LibSync was established with a singular mission: to eliminate the friction between a student and their potential. We've optimized every square inch for cognitive peak performance.
                    </p>
                    <p>
                        Our space is more than just a library; it's a productivity machine. From ergonomic seating that supports 12-hour grinds to acoustic management that eliminates distractions, we've built the ultimate terminal for academic success.
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-6">
                    {[
                        { label: "Quietude", desc: "Acoustic walls" },
                        { label: "Stability", desc: "100% Power backup" },
                        { label: "Focus", desc: "Ergonomic zone" },
                        { label: "Utility", desc: "High-speed nodes" }
                    ].map((item) => (
                        <div key={item.label} className="flex items-start gap-4 group">
                            <div className="mt-1 w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <CheckCircle2 size={12} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight italic text-slate-900">{item.label}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
                { title: "Quiet Control", icon: <Wind size={24}/>, desc: "Surgical-grade acoustic panels reduce sound by 45dB." },
                { title: "Luminosity", icon: <Star size={24}/>, desc: "Personalized task lighting calibrated for eye health." },
                { title: "Fluidity", icon: <Coffee size={24}/>, desc: "Dedicated rest zones to recharge without leaving the hub." }
            ].map((card) => (
                <div key={card.title} className="p-10 bg-slate-50/50 rounded-[40px] border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-100/50 transition-all group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
                    <h3 className="text-lg font-black uppercase tracking-tight italic mb-3">{card.title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{card.desc}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-slate-900 text-white px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600 opacity-10 blur-[120px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-24">
            <div className="space-y-4">
                <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Technical Superiority</div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                The Infrastructure <br /><span className="text-blue-500">of Success.</span>
                </h2>
            </div>
            <p className="max-w-xs text-slate-400 font-medium text-sm leading-relaxed">
                We've invested in industrial-grade technology to ensure your workflow is never interrupted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DarkFeatureCard 
              icon={<Wifi />}
              title="300Mbps Fiber"
              description="Dedicated bandwidth with zero buffering for research, coding, and heavy downloads."
            />
            <DarkFeatureCard 
              icon={<Wind />}
              title="Climate Ctrl."
              description="Surgical-grade air filtration and 22°C constant cooling for maximum comfort."
            />
            <DarkFeatureCard 
              icon={<Clock />}
              title="Smart Reserve"
              description="Book your favorite seat in advance via the mobile terminal in seconds."
            />
            <DarkFeatureCard 
              icon={<Coffee />}
              title="Nitro Brew"
              description="Unlimited premium coffee & tea to fuel those late-night grind sessions."
            />
            <DarkFeatureCard 
              icon={<MapPin />}
              title="Central Hub"
              description="Zero commute stress, located centrally with secure bike and scooter parking."
            />
            <DarkFeatureCard 
              icon={<MessageSquare />}
              title="Social Space"
              description="Connect with like-minded high-achievers in our dedicated collaboration zone."
            />
          </div>
        </div>
      </section>

      <section id="gallery" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-24">
                <div className="space-y-4">
                    <div className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Operational Gallery</div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                        Inside the <span className="text-blue-600">Infrastructure.</span>
                    </h2>
                </div>
                <p className="max-w-xs text-slate-500 font-medium text-sm leading-relaxed">
                    A visual walkthrough of our high-performance learning environment.
                </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
                <div className="md:col-span-8 rounded-[48px] overflow-hidden relative group border border-slate-100 shadow-xl">
                    <img 
                        src="/C:/Users/gajen/.gemini/antigravity/brain/e27d1527-cc10-4be4-bd25-5d56d31bab9b/library_gallery_1_study_zone_1772190541234.png" 
                        alt="Study Zone" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-10 left-10 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20">
                        <p className="text-[10px] font-black uppercase tracking-widest italic text-blue-600">The Silent Core</p>
                    </div>
                </div>

                <div className="md:col-span-4 rounded-[48px] overflow-hidden relative group border border-slate-100 shadow-xl">
                    <img 
                        src="/C:/Users/gajen/.gemini/antigravity/brain/e27d1527-cc10-4be4-bd25-5d56d31bab9b/library_gallery_study_booth_closeup_1772216475388.png" 
                        alt="Study Booth" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="md:col-span-4 rounded-[48px] overflow-hidden relative group border border-slate-100 shadow-xl">
                    <img 
                        src="/C:/Users/gajen/.gemini/antigravity/brain/e27d1527-cc10-4be4-bd25-5d56d31bab9b/library_gallery_discussion_room_1772216445397.png" 
                        alt="Discussion Room" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                </div>

                <div className="md:col-span-5 rounded-[48px] overflow-hidden relative group border border-slate-100 shadow-xl">
                    <img 
                        src="/C:/Users/gajen/.gemini/antigravity/brain/e27d1527-cc10-4be4-bd25-5d56d31bab9b/library_gallery_coffee_bar_1772216459559.png" 
                        alt="Refreshment Hub" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                </div>

                <div className="md:col-span-3 rounded-[48px] bg-blue-600 flex flex-col items-center justify-center p-8 text-center group transition-all hover:bg-blue-700 shadow-2xl shadow-blue-200">
                     <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                        <BookOpen size={32} />
                     </div>
                     <h3 className="text-white text-2xl font-black tracking-tighter uppercase italic leading-tight mb-4">Space is <br />Limited.</h3>
                     <Button 
                        onClick={handleLogin}
                        className="bg-white text-blue-600 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] h-10 px-8 rounded-xl"
                    >
                        Secure Access
                     </Button>
                </div>
             </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/3 space-y-6">
                    <div className="w-16 h-1 bg-blue-600" />
                    <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-tight">
                        What Our <br /><span className="text-blue-600">Comrades Say.</span>
                    </h2>
                    <p className="text-slate-500 font-medium">Join 500+ students who transformed their grades at LibSync.</p>
                </div>
                
                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TestimonialCard 
                        name="Aryan Sharma"
                        role="JEE Aspirant"
                        quote="The silence here is therapeutic. I cleared my concepts twice as fast as I did at home. Truly a heaven for focused study."
                    />
                    <TestimonialCard 
                        name="Isha Gupta"
                        role="CA Student"
                        quote="300Mbps internet and the most comfortable chairs I've ever used. The cafe zone is perfect for short breaks."
                    />
                    <TestimonialCard 
                        name="Devansh Verma"
                        role="Medical Student"
                        quote="I used to struggle with consistency. Being surrounded by other driven students at LibSync changed my mindset completely."
                    />
                    <TestimonialCard 
                        name="Sneha Kapoor"
                        role="UPSC Aspirant"
                        quote="The private cabins are a game changer. Being able to leave my books in a secure locker is so convenient."
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Pricing / Membership */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                    Pricing <span className="text-blue-600">Model.</span>
                </h2>
                <p className="text-slate-500 font-medium">Premium amenities, accessible pricing.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <PricingCard 
                    tier="Standard"
                    price="1,200"
                    period="Month"
                    features={["Non-AC Zone Access", "High Speed Wi-Fi", "Common Charging", "Mobile Desk App"]}
                />
                <PricingCard 
                    tier="Premium"
                    price="1,800"
                    period="Month"
                    featured
                    features={["Full AC Quiet Zone", "Dedicated Workstation", "Lockable Cabinets", "Unlimited Coffee", "Priority Booking"]}
                />
                <PricingCard 
                    tier="Elite"
                    price="2,500"
                    period="Month"
                    features={["Private VIP Cabin", "24/7 Unlimited Access", "Personal Storage", "Meal Discounts", "Resource Suite"]}
                />
            </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 underline decoration-blue-600 decoration-8 underline-offset-8">
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Common Queries</h2>
            </div>
            
            <div className="space-y-4">
                {[
                    { q: "Is there a trial period?", a: "Yes, we offer a 1-day free experience pass for all new prospective members. Visit us with your ID." },
                    { q: "Can I switch my slot timing?", a: "Absolutory. You can change your preferred study slot anytime via the Student Portal based on availability." },
                    { q: "What security measures are in place?", a: "We have 24/7 CCTV surveillance, biometric entry, and dedicated security personnel on-site." },
                    { q: "Is technical support available?", a: "Yes, our on-site admins assist with network connectivity and hardware troubleshooting 24/7." }
                ].map((faq, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all duration-300">
                        <button 
                            className="w-full px-8 py-6 flex items-center justify-between text-left"
                            onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        >
                            <span className="text-sm font-black uppercase tracking-tight italic">{faq.q}</span>
                            <ChevronDown className={`text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
                        </button>
                        <div className={`px-8 transition-all duration-300 ease-in-out ${activeFaq === idx ? "max-h-40 pb-6" : "max-h-0 opacity-0"}`}>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="bg-slate-900 rounded-[64px] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-800">
                <div className="lg:w-1/2 p-12 lg:p-20 space-y-12">
                     <div className="space-y-4">
                        <h2 className="text-white text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                            Establish <br /><span className="text-blue-500">Contact.</span>
                        </h2>
                        <p className="text-slate-400 font-medium">Reach out for bookings, tours, or general inquiries.</p>
                     </div>
                     
                     <div className="space-y-8">
                        <div className="flex items-center gap-6 group cursor-pointer">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Protocol Email</p>
                                <p className="text-white font-bold tracking-tight">ops@libsync.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 group cursor-pointer">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Voice Terminal</p>
                                <p className="text-white font-bold tracking-tight">+91 987 654 3210</p>
                            </div>
                        </div>
                     </div>
                     
                     <div className="w-full h-[200px] bg-white/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <MapPin className="text-blue-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Location Node</p>
                        <p className="text-white text-lg font-black uppercase italic italic">Main St. Education Hub, <br />Global City, IN 40001</p>
                        <a href="#" className="inline-block mt-4 text-[10px] font-black uppercase text-blue-500 border-b border-blue-500/30 pb-0.5 hover:border-blue-500 transition-colors">Launch Directions</a>
                     </div>
                </div>
                
                <div className="lg:w-1/2 bg-white p-12 lg:p-20">
                     <form className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identiy</label>
                                <Input placeholder="Full Name" className="h-14 bg-slate-50 border-transparent rounded-2xl font-bold focus-visible:ring-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Address</label>
                                <Input placeholder="Email Address" className="h-14 bg-slate-50 border-transparent rounded-2xl font-bold focus-visible:ring-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</label>
                            <Input placeholder="What is it about?" className="h-14 bg-slate-50 border-transparent rounded-2xl font-bold focus-visible:ring-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transmission Payload</label>
                            <Textarea placeholder="Type your message here..." className="min-h-[160px] bg-slate-50 border-transparent rounded-2xl font-bold focus-visible:ring-blue-600 p-6 resize-none" />
                        </div>
                        <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic rounded-[24px] shadow-xl shadow-blue-100">
                           Submit Transmission
                        </Button>
                     </form>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-slate-50 pb-16">
            <div className="space-y-6 max-w-xs">
                <div className="flex items-center gap-2.5">
                    <div className="bg-blue-600 p-2 rounded-xl">
                    <BookOpen className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase italic">
                    Lib<span className="text-blue-600">Sync</span>
                    </span>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    The ultimate learning sanctuary for dedicated students and future leaders.
                </p>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                        <span className="font-black italic">T</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                        <span className="font-black italic">I</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                        <span className="font-black italic">Y</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Hub</h4>
                    <ul className="space-y-4 text-[11px] font-black uppercase tracking-tight text-slate-500">
                        <li><a href="#about" className="hover:text-blue-600 transition-colors">The Space</a></li>
                        <li><a href="#features" className="hover:text-blue-600 transition-colors">Technology</a></li>
                        <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                        <li><a href="#gallery" className="hover:text-blue-600 transition-colors">Gallery</a></li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Access</h4>
                    <ul className="space-y-4 text-[11px] font-black uppercase tracking-tight text-slate-500">
                        <li><a href="/student/login" className="hover:text-blue-600 transition-colors">Student Entry</a></li>
                        <li><a href="/student/register" className="hover:text-blue-600 transition-colors">New Command</a></li>
                        <li><a href="/admin/login" className="hover:text-blue-600 transition-colors">Staff Terminal</a></li>
                    </ul>
                </div>
                <div className="space-y-6 hidden md:block">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Policy</h4>
                    <ul className="space-y-4 text-[11px] font-black uppercase tracking-tight text-slate-500">
                        <li><a href="#" className="hover:text-blue-600 transition-colors">Rules</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition-colors">Ethics</a></li>
                    </ul>
                </div>
            </div>
          </div>
          
          <div className="pt-12 text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              © MMRXXVI LIBSYNC SYSTEM INFRASTRUCTURE. OPERATIONAL GLOBALLY.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DarkFeatureCard = ({ icon, title, description }: { icon: React.ReactElement, title: string, description: string }) => (
    <div className="p-10 bg-white/5 border border-white/5 rounded-[40px] hover:border-blue-500/50 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] group-hover:bg-blue-500/20 transition-all" />
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 text-blue-500">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 32 })}
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4 text-white group-hover:translate-x-1 transition-transform">{title}</h3>
        <p className="text-slate-400 font-medium leading-relaxed text-sm group-hover:text-slate-300 transition-colors">{description}</p>
    </div>
);

const TestimonialCard = ({ name, role, quote }: { name: string, role: string, quote: string }) => (
    <div className="p-10 bg-white border border-slate-100 rounded-[40px] shadow-sm relative overflow-hidden group">
        <div className="absolute top-8 right-8 text-blue-100 group-hover:text-blue-200 transition-colors">
            <span className="text-8xl font-black leading-none opacity-20">"</span>
        </div>
        <div className="flex gap-1 text-yellow-500 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
        </div>
        <p className="text-slate-600 font-bold leading-relaxed mb-8 relative z-10 italic">"{quote}"</p>
        <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black italic">{name[0]}</div>
            <div>
                <h4 className="text-xs font-black uppercase tracking-tight italic">{name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role}</p>
            </div>
        </div>
    </div>
);

const PricingCard = ({ tier, price, period, features, featured = false }: { tier: string, price: string, period: string, features: string[], featured?: boolean }) => (
    <div className={`
        p-12 rounded-[48px] border transition-all duration-500 relative flex flex-col h-full
        ${featured ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-105 z-10 lg:translate-y-[-10px]" : "bg-white border-slate-100 text-slate-900 hover:border-blue-100"}
    `}>
        {featured && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-xl">
                Most Popular
            </div>
        )}
        <div className="mb-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-blue-500">{tier}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold italic">₹</span>
                <span className="text-6xl font-black tracking-tighter italic">{price}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ml-1 ${featured ? "text-slate-500" : "text-slate-400"}`}>/ {period}</span>
            </div>
        </div>
        
        <div className="space-y-4 mb-12 flex-1">
            {features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className={featured ? "text-blue-500" : "text-blue-600"} />
                    <span className={`text-[11px] font-bold uppercase tracking-tight italic ${featured ? "text-slate-300" : "text-slate-500"}`}>{f}</span>
                </div>
            ))}
        </div>
        
        <Button className={`
            w-full h-16 rounded-[24px] font-black uppercase tracking-widest italic
            ${featured ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-900"}
        `}>
            Secure Pass
        </Button>
    </div>
);

export default LandingPage;
