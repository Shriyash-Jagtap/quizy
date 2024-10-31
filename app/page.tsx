// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Menu, Clock, BookOpen, BarChart3, GraduationCap, FileText, Users } from 'lucide-react'
import PerformanceChart from '@/components/PerformanceChart' // Ensure the path is correct

export default function QuizifyVercelLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const handleResize = () => setIsMenuOpen(false)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center justify-between border-b border-gray-800 backdrop-blur-md bg-black/50">
  <Link className="flex items-center" href="/">
    <motion.span 
      className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
      whileHover={{ scale: 1.05 }}
    >
      quizify
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

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20 opacity-50"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <motion.h1 
                  className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
                  style={{ opacity }}
                >
                  Excel in Your{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    IITM BS Journey
                  </span>
                </motion.h1>
                <p className="text-xl text-gray-400 max-w-[600px] mx-auto">
                  The most comprehensive quiz preparation platform built for IITM BS students.
                  Practice, learn, and succeed.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                  Start Practicing Now
                </Button>
                <Link href="/subjects">
                  <Button size="lg" variant="outline" className="bg-white text-black hover:bg-gray-200">
                    View Quizzes
                  </Button>
                </Link>
              </div>
              <div className="pt-8 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <Users size={20} />
                  <span>10,000+ Students</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText size={20} />
                  <span>105+ Quizes</span>
                </div>
                <div className="flex items-center justify-center gap-2 col-span-2 md:col-span-1">
                  <GraduationCap size={20} />
                  <span>All Foundation Courses</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-20 md:py-32 bg-gray-950">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="grid gap-12 lg:grid-cols-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <FeatureCard 
                icon={<BookOpen className="h-8 w-8" />}
                title="Comprehensive Solutions"
                description="Detailed explanations with step-by-step solutions. Access textbook references, video explanations, and related resources."
              />
              <FeatureCard 
                icon={<Clock className="h-8 w-8" />}
                title="Timed Practice Exams"
                description="Simulate real quiz conditions with our timed practice exams. Get instant feedback and performance analytics."
              />
              <FeatureCard 
                icon={<BarChart3 className="h-8 w-8" />}
                title="Progress Dashboard"
                description="Track your performance across subjects, identify weak areas, and monitor your improvement over time."
              />
            </motion.div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="w-full py-20 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col lg:flex-row items-center gap-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Your Learning Journey,{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Visualized
                  </span>
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="rounded-full p-1 bg-blue-500/10 text-blue-400">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Performance Analytics</h3>
                      <p className="text-sm text-gray-400">Track your scores and completion rates across all subjects</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full p-1 bg-purple-500/10 text-purple-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Time Management</h3>
                      <p className="text-sm text-gray-400">Monitor your quiz completion times and pace improvement</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full p-1 bg-green-500/10 text-green-400">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Topic Mastery</h3>
                      <p className="text-sm text-gray-400">See your proficiency levels in different topics</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <PerformanceChart />
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-gray-950 to-black">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-6 text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to Transform Your{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Quiz Performance?
                </span>
              </h2>
              <p className="text-gray-400">
                Join thousands of IITM BS students who are already improving their scores with quizify.
              </p>
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                Get Started for Free
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
     
      {/* Footer */}
      <footer className="w-full py-8 px-4 md:px-6 border-t border-gray-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2024 quizify. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Terms</Link>
            <Link className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Privacy</Link>
            <Link className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="flex flex-col space-y-4 p-6 rounded-lg border border-gray-800 bg-gray-900/50"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="p-2 w-fit rounded-lg bg-blue-500/10">
        <div className="text-blue-400">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}
