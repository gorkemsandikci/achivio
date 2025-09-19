import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import MobileLayout from '../components/MobileLayout';
import { useWallet } from '../contexts/WalletContext';

export default function VirtualRoom() {
  const { isConnected } = useWallet();
  const [selectedRoom, setSelectedRoom] = useState(1);
  const [placedItems, setPlacedItems] = useState<{id: number, x: number, y: number, item: string}[]>([
    { id: 1, x: 20, y: 30, item: 'Motivational Poster' },
    { id: 2, x: 70, y: 60, item: 'Trophy Shelf' }
  ]);

  const roomPreviews = [
    {
      id: 1,
      name: "Modern Minimalist",
      image: "/assets/images/virtual_room_preview_1.jpg",
      description: "Clean, modern workspace perfect for focused productivity"
    },
    {
      id: 2, 
      name: "Cozy Study",
      image: "/assets/images/virtual_room_preview_2.jpg",
      description: "Warm and inviting space with comfortable furniture"
    },
    {
      id: 3,
      name: "Gaming Setup",
      image: "/assets/images/virtual_room_preview_3.jpg", 
      description: "High-tech gaming environment with RGB lighting"
    }
  ];

  // Available NFT items (unlocked through badges)
  const nftItems = [
    {
      id: 1,
      name: 'Motivational Poster',
      description: 'Unlocked by First Steps badge',
      image: '/assets/images/success_illustration.jpg',
      unlocked: true,
      placed: placedItems.some(item => item.item === 'Motivational Poster')
    },
    {
      id: 2,
      name: 'Trophy Shelf',
      description: 'Unlocked by Week Warrior badge',
      image: '/assets/images/milestone_celebration.jpg',
      unlocked: true,
      placed: placedItems.some(item => item.item === 'Trophy Shelf')
    },
    {
      id: 3,
      name: 'Achievement Wall',
      description: 'Unlocked by Task Master badge',
      image: '/assets/images/achievement_unlock_animation.jpg',
      unlocked: false,
      placed: false
    },
    {
      id: 4,
      name: 'Crystal Token Display',
      description: 'Unlocked by Token Collector badge',
      image: '/assets/images/3d_rendered_crypto_tokens.jpg',
      unlocked: false,
      placed: false
    }
  ];

  const placeItem = (itemName: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    // Random placement for demo
    const newItem = {
      id: Date.now(),
      x: Math.random() * 60 + 20, // 20-80% of room width
      y: Math.random() * 40 + 30, // 30-70% of room height
      item: itemName
    };

    setPlacedItems(prev => [...prev, newItem]);
    alert(`✅ ${itemName} placed in your room!`);
  };

  const removeItem = (itemId: number) => {
    setPlacedItems(prev => prev.filter(item => item.id !== itemId));
    alert('🗑️ Item removed from room');
  };

  return (
    <>
      <Head>
        <title>Virtual Room - Achivio</title>
        <meta name="description" content="Customize your 3D virtual workspace" />
      </Head>

      <MobileLayout>
        <div className="px-4 pt-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Virtual Room</h1>
              <p className="text-gray-600">Customize your workspace with earned furniture and decorations</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                <div className="text-sm text-gray-500">ACHIV Balance</div>
                <div className="text-xl font-bold text-green-600">24.5 💎</div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Choose Your Room Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roomPreviews.map((room) => (
              <div 
                key={room.id}
                className={`cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 ${
                  selectedRoom === room.id ? 'ring-4 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRoom(room.id)}
              >
                <div className="relative h-48">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                  {selectedRoom === room.id && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-2">
                        <span className="text-blue-500 text-2xl">✓</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-4">
                  <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                  <p className="text-gray-600 text-sm">{room.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Room Display with Interactive Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your 3D Room</h2>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="relative h-96">
              <Image
                src={roomPreviews[selectedRoom - 1].image}
                alt="Current Room"
                fill
                className="object-cover"
              />
              
              {/* Placed NFT Items */}
              {placedItems.map((item) => (
                <div
                  key={item.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  onClick={() => removeItem(item.id)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg animate-pulse group-hover:scale-110 transition-all duration-300">
                    {item.item.includes('Poster') ? '🖼️' : 
                     item.item.includes('Trophy') ? '🏆' : 
                     item.item.includes('Wall') ? '🎯' : '💎'}
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.item} (Click to remove)
                  </div>
                </div>
              ))}
              
              {/* Room Controls Overlay */}
              <div className="absolute top-4 right-4 space-y-2">
                <button className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md hover:bg-white transition-all duration-300">
                  🔄 Rotate View
                </button>
                <button className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md hover:bg-white transition-all duration-300">
                  🔍 Zoom In
                </button>
                <button className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md hover:bg-white transition-all duration-300">
                  🎨 Change Theme
                </button>
              </div>
              
              {/* Room Info */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-gray-900 p-4 rounded-lg">
                <h3 className="font-bold text-lg">{roomPreviews[selectedRoom - 1].name}</h3>
                <p className="text-sm opacity-80">{roomPreviews[selectedRoom - 1].description}</p>
                <div className="mt-2 flex space-x-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">🛋️ {placedItems.length} Items</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">🌟 Level 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Items Inventory */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎒 Your NFT Items</h2>
          <div className="grid grid-cols-2 gap-4">
            {nftItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white/10 backdrop-blur-xl rounded-2xl p-4 border transition-all duration-300 ${
                  item.unlocked 
                    ? 'border-white/30 hover:border-white/50' 
                    : 'border-white/10 opacity-50'
                }`}
              >
                <div className="relative mb-3">
                  <div className="w-full h-24 relative rounded-xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {!item.unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-2xl">🔒</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="text-gray-900 font-bold text-sm mb-1">{item.name}</h3>
                <p className="text-gray-500 text-xs mb-3">{item.description}</p>
                
                {item.unlocked && (
                  <button
                    onClick={() => placeItem(item.name)}
                    disabled={item.placed}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                      item.placed
                        ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-gray-900 hover:from-blue-600 hover:to-purple-600'
                    }`}
                  >
                    {item.placed ? '✅ Placed' : '📍 Place in Room'}
                  </button>
                )}
                
                {!item.unlocked && (
                  <div className="w-full py-2 text-center text-gray-400 text-xs">
                    🔒 Earn badge to unlock
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        </div>
      </MobileLayout>
    </>
  );
}
