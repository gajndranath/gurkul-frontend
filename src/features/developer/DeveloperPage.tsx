import { Button } from "@/components/ui/button";
import { 
  Linkedin, 
  Instagram, 
  MessageCircle, 
  ArrowLeft,
  Code2,
  Cpu,
  Layers,
  Facebook,
  Github,
  Award,
  BookOpen,
  Terminal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const DeveloperPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 selection:text-blue-200 font-sans">
      <SEO 
        title="Gajendra Nath Tripathi | Full Stack Developer & Digital Architect"
        description="Official portfolio of Gajendra Nath Tripathi - The architect behind Gurukul Self Study Center. Expert in building high-performance management systems and student ecosystems."
        keywords="Gajendra Nath Tripathi, Full Stack Developer, Software Engineer, Portfolio, Varanasi, Gurukul Library, React Developer"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 md:py-8 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10 gap-2 rounded-full px-4 md:px-6 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="flex gap-2 md:gap-4">
             <a href="https://github.com/gajndranath" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-slate-800 transition-all">
                <Github size={18} />
             </a>
             <a href="https://www.facebook.com/rohit.tripathi.16718" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-blue-600 transition-all">
                <Facebook size={18} />
             </a>
             <a href="https://www.linkedin.com/in/gajndra/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-blue-600 transition-all">
                <Linkedin size={18} />
             </a>
             <a href="https://www.instagram.com/_.gajndra._" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-pink-600 transition-all">
                <Instagram size={18} />
             </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-12">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-500/20 text-blue-400">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Full Stack System Architect</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    Gajendra <br />
                    <span className="text-blue-500">Tripathi.</span>
                </h1>
            </div>

            <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                <p className="text-xl text-slate-400 font-medium leading-relaxed">
                    Engineering digital infrastructure that empowers educational growth. Specialist in the MERN stack with a focus on scalable management systems.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="#projects">
                        <Button className="h-14 px-10 bg-white text-slate-950 hover:bg-slate-200 font-black uppercase tracking-widest italic rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                           My Work <Terminal size={18} className="ml-2" />
                        </Button>
                    </a>
                    <a href="https://wa.me/919721567165" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="h-14 px-10 border-2 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest italic rounded-2xl transition-all">
                           Hire Me <MessageCircle size={18} className="ml-2" />
                        </Button>
                    </a>
                </div>
            </div>
        </div>
      </section>

      {/* Core Specialties (About Snippet) */}
      <section className="py-24 px-6 relative border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SpecialtyCard 
                    icon={<Code2 size={28} />}
                    title="System Engineering"
                    description="Architecting robust backends with Node.js and SQL, ensuring data integrity and high-speed retrieval for enterprise management."
                />
                <SpecialtyCard 
                    icon={<Cpu size={28} />}
                    title="Digital Transformation"
                    description="Converting analogue study hubs into smart ecosystems. Integrating automated tracking, real-time analytics, and student hubs."
                />
                <SpecialtyCard 
                    icon={<Layers size={28} />}
                    title="Interface Mastery"
                    description="Building breathtaking user experiences with React and Tailwind CSS. Modern, dark-mode-first designs that users fall in love with."
                />
            </div>
        </div>
      </section>

      {/* Featured Project Section */}
      <section id="projects" className="py-32 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">Infrastructure Showcase</p>
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Featured <br />Engineering.</h2>
                </div>
                <p className="max-w-md text-slate-400 font-medium text-sm">
                    A selection of systems I've developed that solve real-world operational challenges.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Project 1: Gurukul System */}
                <div className="group space-y-8">
                    <div className="aspect-video bg-white/5 rounded-[48px] border border-white/10 overflow-hidden relative shadow-2xl transition-all group-hover:border-blue-500/50">
                        <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-slate-950/90 to-transparent">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Gurukul Hub</h3>
                            <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Library Management Ecosystem</p>
                        </div>
                        <div className="absolute top-8 right-8 flex gap-2">
                             <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold">MERN</span>
                             <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold">WebRTC</span>
                        </div>
                    </div>
                    <div className="px-4 space-y-4">
                        <p className="text-slate-400 leading-relaxed font-medium">
                            A complete digital transformation for the Gurukul Self Study Center. Features include real-time slot management, automated fee reminders, integrated student chat, and a high-performance administration dashboard.
                        </p>
                        <Button variant="link" className="text-blue-500 font-black uppercase tracking-widest text-[10px] p-0 h-auto hover:text-white transition-colors">
                            Built with Passion & Precision →
                        </Button>
                    </div>
                </div>

                {/* Project 2: University Infrastructure */}
                <div className="group space-y-8">
                    <div className="aspect-video bg-white/5 rounded-[48px] border border-white/10 overflow-hidden relative shadow-2xl transition-all group-hover:border-blue-500/50">
                        <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-slate-950/90 to-transparent">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Campus Terminal</h3>
                            <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Academic Resource Management</p>
                        </div>
                        <div className="absolute top-8 right-8 flex gap-2">
                             <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold">Full Stack</span>
                        </div>
                    </div>
                    <div className="px-4 space-y-4">
                        <p className="text-slate-400 leading-relaxed font-medium">
                            Advanced resource tracking system designed during my university projects. It leverages cloud infrastructure to manage large datasets of students and institutional assets with zero latency.
                        </p>
                        <Button variant="link" className="text-blue-500 font-black uppercase tracking-widest text-[10px] p-0 h-auto hover:text-white transition-colors">
                            Technical Documentation View →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Skills Matrix */}
      <section className="py-24 px-6 relative overflow-hidden bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Technical <span className="text-blue-500">Arsenal.</span></h2>
                <p className="text-slate-500 font-medium">The technologies I use to build empires.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Vite', 'Firebase', 'Socket.io', 'WebRTC'].map((skill) => (
                    <div key={skill} className="p-6 bg-white/5 border border-white/5 rounded-3xl text-center hover:bg-blue-600 hover:border-blue-500 transition-all group cursor-default">
                        <p className="text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">{skill}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto space-y-20">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">The <span className="text-blue-500">Timeline.</span></h2>
            </div>
            
            <div className="space-y-12">
                <ExperienceItem 
                    year="2024 - Present"
                    role="Lead Developer & Founder"
                    company="System Architecture Studio"
                    description="Leading the digital transformation of educational spaces. Developing the Gurukul Ecosystem and scaling automated management solutions."
                />
                <ExperienceItem 
                    year="2021 - 2024"
                    role="Full Stack Engineer"
                    company="Independent Technical Consultant"
                    description="Built high-performance web applications for diverse industries. Specialized in React-based dashboards and Node.js backend infrastructure."
                />
                <ExperienceItem 
                    year="University Era"
                    role="Systems Researcher"
                    company="Technical Projects Division"
                    description="Focused on large-scale data systems and user interface research. Developed early prototypes for campus-wide resource management."
                />
            </div>
        </div>
      </section>

      {/* Education & Connection Section */}
      <section className="py-32 px-6 bg-white/[0.03] rounded-t-[100px]">
         <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="space-y-8">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Foundation of <br /><span className="text-blue-500">Excellence.</span></h2>
                <div className="space-y-6">
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black uppercase italic tracking-tight">University Education</h4>
                            <p className="text-slate-400 text-sm">Specialization in Computer Applications & System Design. Focused on database optimization and front-end engineering.</p>
                        </div>
                    </div>
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                            <Award size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black uppercase italic tracking-tight">Technical Certifications</h4>
                            <p className="text-slate-400 text-sm">MERN Stack Mastery, Cloud Infrastructure (AWS/Vercel), and Advanced UI/UX Patterns.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Direct <br /><span className="text-blue-500">Gateway.</span></h2>
                <div className="grid grid-cols-2 gap-4">
                    <SocialBox href="https://github.com/gajndranath" icon={<Github size={24} />} label="GitHub" />
                    <SocialBox href="https://www.linkedin.com/in/gajndra/" icon={<Linkedin size={24} />} label="LinkedIn" />
                    <SocialBox href="https://www.facebook.com/rohit.tripathi.16718" icon={<Facebook size={24} />} label="Facebook" />
                    <SocialBox href="https://www.instagram.com/_.gajndra._" icon={<Instagram size={24} />} label="Instagram" />
                </div>
                <a href="mailto:contact@gajendra-tripathi.com" className="block p-8 bg-blue-600 rounded-[32px] text-center hover:bg-blue-500 transition-all group">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Start a Conversation</p>
                    <p className="text-2xl font-black italic uppercase tracking-tighter">Contact the Source</p>
                </a>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 text-center border-t border-white/5 bg-slate-950">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
           BUILDING ARCHITECTURES OF FREEDOM. © 2026
         </p>
      </footer>
    </div>
  );
};

const SpecialtyCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-10 bg-white/5 border border-white/5 rounded-[48px] space-y-6 group hover:border-blue-500/30 transition-all hover:-translate-y-2 duration-500">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
            {icon}
        </div>
        <h3 className="text-xl font-black uppercase italic tracking-tight">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
            {description}
        </p>
    </div>
);

const ExperienceItem = ({ year, role, company, description }: { year: string, role: string, company: string, description: string }) => (
    <div className="flex flex-col md:flex-row gap-8 md:gap-20 group">
        <div className="md:w-32 pt-1">
            <p className="text-blue-500 font-black tracking-widest text-[10px] uppercase">{year}</p>
        </div>
        <div className="flex-1 space-y-4 pb-12 border-b border-white/5">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-500 transition-colors">{role}</h3>
            <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">{company}</p>
            <p className="text-slate-400 text-sm leading-relaxed font-semibold">{description}</p>
        </div>
    </div>
);

const SocialBox = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center h-28 bg-white/5 rounded-[32px] border border-white/5 hover:bg-white/[0.08] hover:border-blue-500/30 transition-all group">
        <div className="text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-2">
            {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{label}</p>
    </a>
)

export default DeveloperPage;
