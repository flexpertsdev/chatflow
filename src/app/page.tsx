import Link from 'next/link'
import { MessageCircle, Users, Zap, Shield, Image as ImageIcon, Hash } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="px-4 py-16 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Chat in Real-Time with Your Community
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Join public rooms or create private spaces
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/chat"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Browse Rooms
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Everything you need for great conversations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-purple-600" />}
              title="Real-time Messaging"
              description="Instant messages with typing indicators and presence awareness"
            />
            <FeatureCard
              icon={<MessageCircle className="w-6 h-6 text-purple-600" />}
              title="Rich Communication"
              description="Share images, react with emojis, and express yourself"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-purple-600" />}
              title="Flexible Rooms"
              description="Create public communities or private group conversations"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-purple-600" />}
              title="Secure & Private"
              description="End-to-end encryption for private rooms and secure authentication"
            />
            <FeatureCard
              icon={<ImageIcon className="w-6 h-6 text-purple-600" />}
              title="Media Sharing"
              description="Share images and files with automatic preview generation"
            />
            <FeatureCard
              icon={<Hash className="w-6 h-6 text-purple-600" />}
              title="Topic Categories"
              description="Find rooms by interest: Gaming, Study, Social, Tech, and more"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to start chatting?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users already connecting on ChatFlow
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            View All Rooms
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

// Feature card component
function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}