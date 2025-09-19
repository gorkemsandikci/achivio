import React, { useState } from 'react';
import Image from 'next/image';

interface RoomItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  badgeRequired?: string;
  image: string;
}

const VirtualRoom: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState(1);
  const [showItemStore, setShowItemStore] = useState(false);
  const [userBalance] = useState(24.5); // ACHIV tokens

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

  const availableItems: RoomItem[] = [
    {
      id: 1,
      name: "Modern Desk",
      category: "Furniture",
      price: 5.0,
      rarity: "common",
      image: "/assets/images/virtual_room_preview_1.jpg"
    },
    {
      id: 2,
      name: "Gaming Chair",
      category: "Furniture", 
      price: 8.0,
      rarity: "rare",
      image: "/assets/images/virtual_room_preview_2.jpg"
    },
    {
      id: 3,
      name: "Golden Trophy",
      category: "Special",
      price: 20.0,
      rarity: "legendary",
      badgeRequired: "7-Day Streak",
      image: "/assets/images/achievement-badges.jpg"
    },
    {
      id: 4,
      name: "Smart Monitor",
      category: "Tech",
      price: 12.0,
      rarity: "epic",
      image: "/assets/images/virtual_room_preview_3.jpg"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="virtual-room min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏠 Virtual Room</h1>
            <p className="text-gray-600">Customize your workspace with earned furniture and decorations</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-md">
              <div className="text-sm text-gray-500">ACHIV Balance</div>
              <div className="text-xl font-bold text-green-600">{userBalance} 💎</div>
            </div>
            
            <button 
              onClick={() => setShowItemStore(!showItemStore)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
            >
              🛍️ Item Store
            </button>
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

      {/* Current Room Display */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Current Room</h2>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-96">
            <Image
              src={roomPreviews[selectedRoom - 1].image}
              alt="Current Room"
              fill
              className="object-cover"
            />
            
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
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg">
              <h3 className="font-bold text-lg">{roomPreviews[selectedRoom - 1].name}</h3>
              <p className="text-sm opacity-80">{roomPreviews[selectedRoom - 1].description}</p>
              <div className="mt-2 flex space-x-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded">🛋️ 5 Items</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">🌟 Level 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Store Modal */}
      {showItemStore && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">🛍️ Virtual Item Store</h2>
                <button 
                  onClick={() => setShowItemStore(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-2">Purchase furniture and decorations with your ACHIV tokens</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{item.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">{item.category}</p>
                      
                      {item.badgeRequired && (
                        <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          🏆 Requires: {item.badgeRequired}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-lg font-bold text-green-600">
                          {item.price} ACHIV
                        </span>
                        
                        <button 
                          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                            userBalance >= item.price && !item.badgeRequired
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={userBalance < item.price || !!item.badgeRequired}
                        >
                          {userBalance < item.price ? 'Insufficient Funds' : 
                           item.badgeRequired ? 'Badge Required' : 'Purchase'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Customization Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">🎨 Themes & Backgrounds</h3>
          <div className="space-y-3">
            {['Modern', 'Cyberpunk', 'Cozy', 'Minimalist', 'Gaming'].map((theme) => (
              <button key={theme} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
                <div className="font-medium">{theme}</div>
                <div className="text-sm text-gray-500">Change your room's aesthetic</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">🎵 Background Music</h3>
          <div className="space-y-3">
            {['Ambient Sounds', 'Lo-Fi Beats', 'Nature Sounds', 'Focus Music', 'Synthwave'].map((music) => (
              <button key={music} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300">
                <div className="font-medium">{music}</div>
                <div className="text-sm text-gray-500">Set the mood for productivity</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualRoom;
