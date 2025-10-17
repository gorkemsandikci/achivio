import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
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
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl text-center mb-16 gradient-text">
            Why Achivio?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-10 text-center transition-all duration-400 hover:-translate-y-2">
              <span className="text-5xl mb-6 block">🌐</span>
              <h3 className="text-2xl mb-4 text-cyan-400">Full VR Experience</h3>
              <p className="text-blue-200 leading-relaxed">
                Complete your habits in a 3D virtual environment. Every task becomes a physical action in VR, 
                explore your room and unlock new areas as you progress.
              </p>
            </div>
            
            <div className="glass-card p-10 text-center transition-all duration-400 hover:-translate-y-2">
              <span className="text-5xl mb-6 block">💎</span>
              <h3 className="text-2xl mb-4 text-cyan-400">NFT Rooms & Items</h3>
              <p className="text-blue-200 leading-relaxed">
                Customize your living space with earned NFTs. Furniture, decorations, theme packages - 
                each one is your property on the blockchain.
              </p>
            </div>
            
            <div className="glass-card p-10 text-center transition-all duration-400 hover:-translate-y-2">
              <span className="text-5xl mb-6 block">🪙</span>
              <h3 className="text-2xl mb-4 text-cyan-400">ACHIV Token Economy</h3>
              <p className="text-blue-200 leading-relaxed">
                Earn ACHIV tokens for every completed task. Maintain streaks, climb the leaderboard 
                and claim your rewards.
              </p>
            </div>
            
            <div className="glass-card p-10 text-center transition-all duration-400 hover:-translate-y-2">
              <span className="text-5xl mb-6 block">👥</span>
              <h3 className="text-2xl mb-4 text-cyan-400">Social & Multiplayer</h3>
              <p className="text-blue-200 leading-relaxed">
                Invite friends, visit their rooms, join challenges together. Share your achievements on X 
                and become part of the community.
              </p>
            </div>
            
            <div className="glass-card p-10 text-center transition-all duration-400 hover:-translate-y-2">
              <span className="text-5xl mb-6 block">🎯</span>
              <h3 className="text-2xl mb-4 text-cyan-400">Gamified Habit Tracking</h3>
              <p className="text-blue-200 leading-relaxed">
                Instead of boring lists, gamified tasks, level system, badges and achievement system 
                to boost your motivation to the peak.
              </p>
            </div>
            
            <div className="glass-card p-10 text-center transition-all duration-400 hover:-translate-y-2">
              <span className="text-5xl mb-6 block">⛓️</span>
              <h3 className="text-2xl mb-4 text-cyan-400">Blockchain Integration</h3>
              <p className="text-blue-200 leading-relaxed">
                Built on Stacks blockchain, transparent, secure and offering real value ecosystem. 
                Your achievements are carved into the blockchain.
              </p>
            </div>
          </div>
        </section>

        {/* Problem Solution Section */}
        <section className="py-24 bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="glass-card p-12 bg-black/40">
                <div className="text-purple-400 text-sm uppercase tracking-widest mb-4">🧩 PROBLEM</div>
                <h3 className="text-3xl mb-6">Habit Apps Are Boring</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Current habit trackers are just simple lists and check-boxes. Users lose motivation, 
                  forget to open the app and abandon it in the long run because there's no real reward system.
                </p>
              </div>
              
              <div className="glass-card p-12 bg-black/40">
                <div className="text-purple-400 text-sm uppercase tracking-widest mb-4">💡 SOLUTION</div>
                <h3 className="text-3xl mb-6">VR + Blockchain + Social</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Achivio transforms habit tracking into an immersive VR experience. With crypto rewards, 
                  NFT collection, social competition and customizable virtual spaces, it turns daily routine 
                  into an exciting adventure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-24 text-center">
          <h2 className="text-5xl md:text-6xl mb-16 gradient-text">Technology</h2>
          <div className="flex flex-wrap gap-8 justify-center max-w-5xl mx-auto">
            <div className="glass-card px-8 py-6 text-lg transition-all duration-300 hover:bg-purple-500/20 hover:scale-105">
              ⛓️ Stacks Blockchain
            </div>
            <div className="glass-card px-8 py-6 text-lg transition-all duration-300 hover:bg-purple-500/20 hover:scale-105">
              🎮 Unity VR
            </div>
            <div className="glass-card px-8 py-6 text-lg transition-all duration-300 hover:bg-purple-500/20 hover:scale-105">
              💎 NFT Smart Contracts
            </div>
            <div className="glass-card px-8 py-6 text-lg transition-all duration-300 hover:bg-purple-500/20 hover:scale-105">
              🪙 ACHIV Token
            </div>
            <div className="glass-card px-8 py-6 text-lg transition-all duration-300 hover:bg-purple-500/20 hover:scale-105">
              🌐 WebXR
            </div>
            <div className="glass-card px-8 py-6 text-lg transition-all duration-300 hover:bg-purple-500/20 hover:scale-105">
              🔐 Web3 Integration
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="py-24 bg-gradient-to-r from-black/50 to-purple-500/5">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="text-5xl md:text-6xl text-center mb-16 gradient-text">Roadmap</h2>
            <div className="space-y-8">
              <div className="glass-card p-8 border-l-4 border-purple-500 transition-all duration-300 hover:bg-white/5 hover:translate-x-2">
                <div className="text-cyan-400 font-semibold mb-2">PHASE 1 - MVP</div>
                <div className="text-xl mb-2">Basic VR & Token System</div>
                <div className="text-blue-200">
                  Simple VR environment, habit tracking, ACHIV token distribution and first NFT room items
                </div>
              </div>
              
              <div className="glass-card p-8 border-l-4 border-purple-500 transition-all duration-300 hover:bg-white/5 hover:translate-x-2">
                <div className="text-cyan-400 font-semibold mb-2">PHASE 2 - Social</div>
                <div className="text-xl mb-2">Multiplayer & Leaderboard</div>
                <div className="text-blue-200">
                  Friend invitations, room visits, global and local leaderboards, X integration
                </div>
              </div>
              
              <div className="glass-card p-8 border-l-4 border-purple-500 transition-all duration-300 hover:bg-white/5 hover:translate-x-2">
                <div className="text-cyan-400 font-semibold mb-2">PHASE 3 - Marketplace</div>
                <div className="text-xl mb-2">NFT Marketplace & Customization</div>
                <div className="text-blue-200">
                  NFT trading, custom room designs, creator tools, theme packages
                </div>
              </div>
              
              <div className="glass-card p-8 border-l-4 border-purple-500 transition-all duration-300 hover:bg-white/5 hover:translate-x-2">
                <div className="text-cyan-400 font-semibold mb-2">PHASE 4 - Expansion</div>
                <div className="text-xl mb-2">Advanced Features</div>
                <div className="text-blue-200">
                  AI coach system, team challenges, branded spaces, mobile AR integration
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 bg-black/50">
          <h3 className="text-2xl mb-4">Join the Achivio Universe</h3>
          <p className="text-blue-200 mb-8">
            Live your habits in VR, earn crypto, collect your NFTs
          </p>
          <div className="flex gap-8 justify-center mb-8">
            <a href="#" className="text-cyan-400 text-2xl transition-all duration-300 hover:text-purple-400 hover:scale-125">𝕏</a>
            <a href="#" className="text-cyan-400 text-2xl transition-all duration-300 hover:text-purple-400 hover:scale-125">📺</a>
            <a href="#" className="text-cyan-400 text-2xl transition-all duration-300 hover:text-purple-400 hover:scale-125">💬</a>
          </div>
          <p className="text-purple-400">
            Built on Stacks • Powered by Community
          </p>
        </footer>
      </MobileLayout>
    </>
  );
}
