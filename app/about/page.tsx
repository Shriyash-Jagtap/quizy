"use client";
"use client";
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FaSnapchatGhost,FaInstagram,FaLinkedin,FaGithub,FaKaggle} from "react-icons/fa";
export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
        <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center justify-between border-b border-gray-800 backdrop-blur-md bg-black/50">
  <Link className="flex items-center" href="/">
    <motion.span 
      className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
      whileHover={{ scale: 1.05 }}
    >
      Quizify
    </motion.span>
  </Link>

  {/* Desktop Navigation */}
  <nav className="hidden md:flex items-center gap-6 ml-auto">
    <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Features</Link>
    <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">About</Link>
    {/* <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Pricing</Link>
    <Button variant="ghost" className="text-gray-400">Sign In</Button> */}
    <Button>Get Started</Button>
  </nav>

  {/* Mobile Menu Button */}
  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
    <Menu className="h-6 w-6" />
  </Button>
</header>


      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-black pt-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center gap-4 p-4">
              <Link className="text-lg font-medium hover:text-gray-300 transition-colors" href="#">Features</Link>
              <Link className="text-lg font-medium hover:text-gray-300 transition-colors" href="#">Resources</Link>
              <Link className="text-lg font-medium hover:text-gray-300 transition-colors" href="#">Pricing</Link>
              <Button className="w-full mt-4">Get Started</Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="flex-1">
        {/* Hero Section with Parallax */}
        <section id="about" className="w-full min-h-screen relative overflow-hidden flex items-center py-12 md:py-0">
          <motion.div 
            style={{ scale, opacity: backgroundOpacity }}
            className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20"
          />
          
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div 
              className="flex flex-col lg:flex-row items-center gap-8 md:gap-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Profile Card - Mobile Optimized */}
              <Card className="w-full m-10 p-10 lg:w-1/2 bg-gray-900/50 border-gray-800 backdrop-blur-lg">
                <CardContent className="p-4 md:p-6">
                  <motion.div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                    <motion.div 
                      className="relative w-32 h-32 md:w-48 md:h-48 group"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"/>
                      <div className="absolute inset-[2px] bg-gray-900 rounded-full"/>
                      <img 
                        src="Shriyash.jpg" 
                        alt="Shriyash Jagtap"
                        className="relative w-full h-full rounded-full object-cover transition-all duration-300 group-hover:grayscale-0"
                      />
                    </motion.div>
                    
                    <motion.div>
                      <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Shriyash Jagtap
                      </h2>
                      <p className="text-gray-400 mt-2 text-base md:text-lg">Developer</p>
                    </motion.div>

                    {/* Social Links - Responsive Grid */}
                    <motion.div 
                      className="flex justify-center gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {[
                        { href: "https://www.instagram.com/shriyash.jagtap/", icon: FaInstagram, color: "purple" },
                        { href: "https://www.linkedin.com/in/shriyashjagtap/", icon: FaLinkedin , color: "blue" },
                        { href: "https://www.snapchat.com/add/shyshriyash", icon: FaSnapchatGhost, color: "yellow" },
                        { href: "https://github.com/Shriyash-Jagtap", icon: FaGithub , color: "blue" },
                        { href: "https://www.kaggle.com/shriyashjagtap", icon: FaKaggle , color: "blue" }
                      ].map(({ href, icon: Icon, color }) => (
                        <Link key={href} href={href} target="_blank">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className={`hover:bg-${color}-500/10 hover:text-${color}-400 transition-colors duration-300`}
                            >
                              <Icon className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        </Link>
                      ))}
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>

              {/* About Content - Mobile Optimized */}
              <motion.div 
                className="w-full lg:w-1/2 space-y-4 md:space-y-6 text-center lg:text-left"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold">About the Developer</h3>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                  Passionate about creating innovative educational solutions, Shriyash brings technical expertise 
                  and creative vision to Quizify. With a deep understanding of both education and technology, 
                  he&#39;s committed to transforming how students prepare for their assessments.
                </p>
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">Skills & Expertise</h4>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                    {['Flutter', 'Next.js', 'Data Science', 'Node.js', 'UI/UX Design', 'EdTech'].map((skill) => (
                      <motion.span
                        key={skill}
                        className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-gray-800/50 backdrop-blur-sm text-sm font-medium"
                        whileHover={{ 
                          scale: 1.05, 
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          boxShadow: '0 0 20px rgba(59, 130, 246, 0.7)'
                        }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Quizify Section with Animated Cards */}
        <section className="w-full py-32 bg-gray-950">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold tracking-tighter mb-4">
                About{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Quizify
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-[600px] mx-auto">
                Transforming quiz preparation into an engaging, game-like experience.
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {[
                {
                  title: "Our Mission",
                  description: "Quizify is dedicated to transforming quiz preparation into an engaging, game-like experience. We're revolutionizing how IITM BS students prepare for their assessments by combining effective learning strategies with elements of gamification.",
                  features: ['Interactive progress tracking', 'Achievement milestones', 'Competitive leaderboards', 'Personalized paths'],
                  accent: "blue"
                },
                {
                  title: "Our Approach",
                  description: "We believe learning should be as exciting as it is effective. By introducing game-like elements into our platform, we're creating an environment where each study session feels like leveling up in a game, building both knowledge and resilience.",
                  features: ['Detailed solutions', 'Performance analytics', 'Adaptive learning', 'Subject coverage'],
                  accent: "purple"
                }
              ].map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg h-full">
                    <CardContent className="p-8">
                      <motion.div 
                        className="space-y-6"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-2xl text-gray-400 font-bold">{section.title}</h3>
                        <p className="text-gray-400 leading-relaxed">{section.description}</p>
                        <ul className="space-y-4">
                          {section.features.map((feature, i) => (
                            <motion.li 
                              key={feature}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <span className={`h-2 w-2 rounded-full bg-${section.accent}-400`}/>
                              <span className="text-gray-300">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="w-full py-32 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-8 text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold tracking-tighter">
                Join the{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Learning Revolution
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Experience the future of quiz preparation with Quizify&#39;s innovative approach to learning.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-medium"
                >
                  Start Learning Now
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}