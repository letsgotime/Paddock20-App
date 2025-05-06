import React, { useEffect, useState } from "react";
import { db } from "@/services/firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UsersRound, Car, Trophy, Calendar, Heart, Users, Wrench, Map, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  text: string;
  createdAt: Timestamp;
  userId: string;
  userEmail?: string;
  displayName?: string;
  chatRoomId: string;
  isEvent?: boolean;
  eventId?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unreadCount: number;
  members?: number;
  isActive: boolean;
  lastActivity?: string;
}

const ChatFeedPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeRoom, setActiveRoom] = useState<string>("general");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const { session } = useAuth();
  
  // Get current user information
  const currentUser = session?.user;
  const userEmail = currentUser?.email || "paddock20@member.com";
  const userId = currentUser?.id || "anonymous";
  const displayName = userEmail.split('@')[0] || "Paddock20 Member";

  // Initialize chat rooms
  useEffect(() => {
    const defaultRooms: ChatRoom[] = [
      { 
        id: "general",
        name: "General Discussion",
        description: "The central hub for all Paddock20 members to connect, share, and discuss",
        icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
        unreadCount: 0,
        members: 247,
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      { 
        id: "vehicle-showcase",
        name: "Vehicle Showcase",
        description: "Share your latest builds, modifications, and proud moments with your vehicles",
        icon: <Car className="w-5 h-5 text-red-400" />,
        unreadCount: 0,
        members: 186,
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      { 
        id: "track-day",
        name: "Track Day Central",
        description: "Discuss upcoming track days, share experiences, and find driving partners",
        icon: <Map className="w-5 h-5 text-green-400" />,
        unreadCount: 0,
        members: 129,
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      { 
        id: "modifications",
        name: "Mods & Upgrades",
        description: "Technical discussions on vehicle modifications, upgrades, and performance enhancements",
        icon: <Wrench className="w-5 h-5 text-yellow-400" />,
        unreadCount: 0,
        members: 152,
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      { 
        id: "achievements",
        name: "Goals & Achievements",
        description: "Share your progress on manifestation goals and celebrate milestones",
        icon: <Trophy className="w-5 h-5 text-purple-400" />,
        unreadCount: 0,
        members: 95,
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      { 
        id: "events",
        name: "Events & Meetups",
        description: "Discuss GoTime events, meetups, and organize regional gatherings",
        icon: <Calendar className="w-5 h-5 text-orange-400" />,
        unreadCount: 0,
        members: 178,
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      { 
        id: "charity",
        name: "Charitable Actions",
        description: "Coordinate volunteer opportunities and discuss ways to give back to the community",
        icon: <Heart className="w-5 h-5 text-pink-400" />,
        unreadCount: 0,
        members: 68,
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      { 
        id: "new-members",
        name: "New Member Welcome",
        description: "Introduce yourself and connect with other new Paddock20 members",
        icon: <UsersRound className="w-5 h-5 text-cyan-400" />,
        unreadCount: 0,
        members: 124,
        isActive: true,
        lastActivity: new Date().toISOString()
      }
    ];
    
    setChatRooms(defaultRooms);
  }, []);

  // Load messages for active room
  useEffect(() => {
    const q = query(
      collection(db, "chat-messages"), 
      where("chatRoomId", "==", activeRoom),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(fetchedMessages);
    });
    
    return () => unsubscribe();
  }, [activeRoom]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    await addDoc(collection(db, "chat-messages"), {
      text: newMessage,
      createdAt: Timestamp.now(),
      userId: userId,
      userEmail: userEmail,
      displayName: displayName,
      chatRoomId: activeRoom
    });
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRoomChange = (roomId: string) => {
    setActiveRoom(roomId);
    
    // Update the unread count for the selected room
    setChatRooms(rooms => rooms.map(room => 
      room.id === roomId 
        ? { ...room, unreadCount: 0 }
        : room
    ));
  };

  const getActiveRoomName = () => {
    const room = chatRooms.find(r => r.id === activeRoom);
    return room ? room.name : "Chat Room";
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-6">💬 Paddock20 Member Chat</h1>
      <p className="text-gray-400 mb-8">Connect with fellow enthusiasts, share experiences, and build community</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Rooms Sidebar */}
        <div className="lg:col-span-1 bg-gradient-to-b from-[#111111] to-[#0a0a0a] rounded-lg border border-gray-800 p-4 h-[75vh] overflow-y-auto">
          <h2 className="text-green-400 text-lg font-bold mb-4 flex items-center">
            <Users className="mr-2" /> Chat Rooms
          </h2>
          
          <div className="space-y-2">
            {chatRooms.map(room => (
              <button 
                key={room.id}
                onClick={() => handleRoomChange(room.id)}
                className={`w-full text-left p-3 rounded-lg flex items-center transition-colors
                  ${activeRoom === room.id 
                    ? 'bg-blue-900/30 border border-blue-800' 
                    : 'bg-gray-900 hover:bg-gray-800 border border-gray-800'}`}
              >
                <div className="mr-3">
                  {room.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${activeRoom === room.id ? 'text-blue-400' : 'text-white'}`}>
                      {room.name}
                    </span>
                    {room.unreadCount > 0 && (
                      <Badge variant="outline" className="bg-blue-500 text-white">
                        {room.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{room.members} members</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-[75vh]">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] rounded-t-lg border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-blue-400 font-bold text-lg">{getActiveRoomName()}</h2>
                <p className="text-xs text-gray-400">
                  {chatRooms.find(r => r.id === activeRoom)?.description}
                </p>
              </div>
              <div className="text-sm text-gray-400">
                {chatRooms.find(r => r.id === activeRoom)?.members} members
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div 
            className="flex-1 bg-gradient-to-br from-[#0f0f0f] to-[#151515] border-x border-gray-800 p-4 overflow-y-auto"
            style={{ display: "flex", flexDirection: "column-reverse" }}
          >
            {messages.length > 0 ? (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-4 p-3 rounded-lg ${message.userId === userId 
                    ? 'bg-blue-900/20 border border-blue-800/30 ml-8' 
                    : 'bg-[#0a0a0a] border border-gray-800 mr-8'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${message.userId === userId ? 'text-blue-400' : 'text-green-400'}`}>
                      {message.displayName || "Anonymous"}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {message.createdAt && message.createdAt.toDate 
                        ? message.createdAt.toDate().toLocaleString() 
                        : 'Just now'}
                    </span>
                  </div>
                  <p className="text-white">{message.text}</p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No messages yet in this chat room. Be the first to say hello!
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="bg-[#0a0a0a] rounded-b-lg border border-gray-800 p-4">
            <div className="flex gap-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Type a message in ${getActiveRoomName()}...`}
                className="bg-gray-800 text-white p-3 rounded-lg border border-gray-700 w-full h-20 resize-none"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 rounded"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatFeedPage;