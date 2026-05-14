"use client"
import { Pencil, Zap, Users, Download, Smartphone, Lock,} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';


function App() {


  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Pencil className="w-8 h-8 text-gray-900" strokeWidth={2} />
              <span className="text-2xl font-bold text-gray-900">Excalidraw</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href='/signin'>
                <Button size="md" variant="secondary">
                  Sign In
                </Button>
              </Link>
              <Link href='/signup'>
                <Button size="md" variant="primary">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-6xl sm:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Virtual whiteboard for
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                sketching diagrams
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Excalidraw is an open source virtual hand-drawn style whiteboard.
              Collaborative and end-to-end encrypted. Perfect for creating beautiful diagrams,
              wireframes, and illustrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="primary" 
                onClick={() => alert('You hit on Button')} >
                  Get Started Free 
              </Button>
              <Button size="lg" variant="secondary" 
                onClick={() => alert('You hit on Button')} >
                  View Demo
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why choose Excalidraw?
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to bring your ideas to life
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Pencil className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Hand-drawn Feel
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Create diagrams with a natural, hand-drawn aesthetic that makes
                  your content feel more approachable and human.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Real-time Collaboration
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Work together with your team in real-time. See changes instantly
                  and brainstorm ideas simultaneously.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  End-to-end Encrypted
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Your data is encrypted and secure. Only you and your collaborators
                  can access your drawings.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Optimized for performance. Create and edit complex diagrams
                  without any lag or slowdown.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Export Anywhere
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Export your drawings as PNG, SVG, or clipboard. Integrate
                  seamlessly with your workflow.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Works Everywhere
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Use Excalidraw on any device. Fully responsive and works
                  seamlessly on desktop, tablet, and mobile.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to start sketching?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Join thousands of teams using Excalidraw to visualize their ideas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="primary" 
                onClick={() => alert('You hit onClick')} >
                  Sign Up Now
                </Button>
              <Button size="lg" variant="secondary" 
                onClick={() => alert('You hit onClick')} >
                  Sign In
                </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Pencil className="w-6 h-6" />
              <span className="text-xl font-bold">Excalidraw</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2026 Excalidraw. Open source virtual whiteboard.
            </div>
          </div>
        </div>
        
      </footer>
    </div>
  );
}

export default App;