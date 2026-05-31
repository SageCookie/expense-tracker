import { Link } from 'react-router-dom'
import { TrendingDown, BarChart3, Lock, Zap } from 'lucide-react'
import Button from '../components/Button'

export default function Landing() {
  const features = [
    {
      icon: TrendingDown,
      title: 'Smart Tracking',
      description: 'Effortlessly track every expense with our intuitive interface',
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description: 'Beautiful charts to visualize spending patterns by category',
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry-standard security',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with instant updates and smooth interactions',
    },
  ]

  const benefits = [
    { title: 'Real-time Insights', desc: 'Get instant updates on your spending' },
    { title: 'Budget Control', desc: 'Monitor your expenses across categories' },
    { title: 'Easy Management', desc: 'Add, edit, or delete expenses in seconds' },
    { title: 'Mobile Friendly', desc: 'Works perfectly on desktop, tablet, and mobile' },
    { title: 'No Ads', desc: 'Clean interface without distractions' },
    { title: 'Always Available', desc: 'Access your data anytime, anywhere' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white bg-opacity-95 backdrop-blur-md shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">$</div>
            <span className="text-2xl font-bold text-gray-900">ExpenseTracker</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Take Control of Your
            <span className="block bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Financial Life
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track, manage, and visualize your expenses with ease. Our simple yet powerful app helps you understand your spending patterns and make smarter financial decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Already Have Account?
              </Button>
            </Link>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur-2xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg"></div>
                <div className="h-24 bg-gradient-to-br from-pink-100 to-pink-50 rounded-lg"></div>
                <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg"></div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage your expenses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-lg mb-4">
                    <Icon className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600">Benefits that make a difference</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-pink-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-2">100%</div>
              <p className="text-indigo-100">Free to Use</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">24/7</div>
              <p className="text-indigo-100">Always Available</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">∞</div>
              <p className="text-indigo-100">Unlimited Expenses</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple 3-step process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account in seconds' },
              { step: '2', title: 'Add Expenses', desc: 'Track your spending by category' },
              { step: '3', title: 'Analyze', desc: 'View insights and manage your budget' },
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/3 left-full w-8 h-1 bg-gradient-to-r from-indigo-400 to-transparent"></div>
                )}
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-pink-600 text-white rounded-full font-bold text-2xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Take Control?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of users managing their finances smarter.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Get Started Now
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg"></div>
                <span className="font-bold text-white">ExpenseTracker</span>
              </div>
              <p className="text-sm">Smart expense tracking made simple.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 ExpenseTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}