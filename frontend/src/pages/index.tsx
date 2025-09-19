import Head from 'next/head';
import Image from 'next/image';
import MobileLayout from '../components/MobileLayout';
import HeroSection from '../components/HeroSection';

export default function Home() {
  return (
    <>
      <Head>
        <title>Achivio - Blockchain Habit Tracker</title>
        <meta name="description" content="Motivational habit tracking meets blockchain rewards and NFT achievements" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://achivio.app/" />
        <meta property="og:title" content="Achivio - Blockchain Habit Tracker" />
        <meta property="og:description" content="Transform your daily habits into blockchain rewards. Earn ACHIV tokens, collect NFT badges, and customize your 3D virtual workspace." />
        <meta property="og:image" content="/assets/images/social_sharing_card.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://achivio.app/" />
        <meta property="twitter:title" content="Achivio - Blockchain Habit Tracker" />
        <meta property="twitter:description" content="Transform your daily habits into blockchain rewards. Earn ACHIV tokens, collect NFT badges, and customize your 3D virtual workspace." />
        <meta property="twitter:image" content="/assets/images/social_sharing_card.jpg" />
      </Head>

      <MobileLayout>
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Achivio?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The world's first blockchain-powered habit tracker that rewards your consistency 
                with real digital assets and customizable virtual experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <Image
                    src="/assets/images/3d_rendered_crypto_tokens.jpg"
                    alt="ACHIV Tokens"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Earn Real Rewards</h3>
                <p className="text-gray-600">
                  Complete daily habits and earn ACHIV tokens that have real blockchain value. 
                  Your consistency pays off with tangible digital assets.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <Image
                    src="/assets/images/achievement-badges.jpg"
                    alt="NFT Badges"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Collect NFT Badges</h3>
                <p className="text-gray-900/70">
                  Unlock unique NFT achievement badges for reaching milestones. 
                  Show off your dedication with rare, collectible digital trophies.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <Image
                    src="/assets/images/virtual_room_preview_1.jpg"
                    alt="Virtual Room"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Customize Your Space</h3>
                <p className="text-gray-900/70">
                  Use earned tokens to buy virtual furniture and decorate your 3D workspace. 
                  Create a motivating environment that reflects your achievements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-500 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Habits?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of users who are already earning blockchain rewards for their daily habits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/wallet" className="bg-white text-green-600 font-bold py-4 px-8 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 text-center">
                🔗 Connect Testnet Wallet
              </a>
              <a href="/dashboard" className="border-2 border-gray-300 text-gray-700 font-bold py-4 px-8 rounded-full text-lg hover:bg-white hover:text-green-600 transition-all duration-300 text-center">
                📊 View Dashboard
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src="/assets/images/logo-achivio.png"
                  alt="Achivio Logo"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-400 mb-6">
                Blockchain-powered habit tracking with real rewards
              </p>
              <div className="flex justify-center space-x-6">
                <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </a>
                <a href="/achievements" className="text-gray-400 hover:text-white transition-colors">
                  Achievements
                </a>
                <a href="/room" className="text-gray-400 hover:text-white transition-colors">
                  Virtual Room
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Docs
                </a>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                <p>&copy; 2024 Achivio. Built on Stacks blockchain.</p>
              </div>
            </div>
          </div>
        </footer>
      </MobileLayout>
    </>
  );
}
