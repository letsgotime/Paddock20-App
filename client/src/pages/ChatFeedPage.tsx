import React, { useEffect, useState } from "react";
import { db } from "@/services/firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  text: string;
  createdAt: Timestamp;
  userId: string;
  userEmail?: string;
  displayName?: string;
}

const ChatFeedPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { session } = useAuth();
  
  // Get current user information
  const currentUser = session?.user;
  const userEmail = currentUser?.email || "paddock20@member.com";
  const userId = currentUser?.id || "anonymous";
  const displayName = userEmail.split('@')[0] || "Paddock20 Member";

  useEffect(() => {
    const q = query(collection(db, "chat-messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    await addDoc(collection(db, "chat-messages"), {
      text: newMessage,
      createdAt: Timestamp.now(),
      userId: userId,
      userEmail: userEmail,
      displayName: displayName,
    });
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-500 text-4xl mb-8">💬 Paddock20 Member Chat</h1>

      {/* Chat Box */}
      <div 
        className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8 h-[60vh] overflow-y-auto"
        style={{ display: "flex", flexDirection: "column-reverse" }}
      >
        {messages.map((message) => (
          <div key={message.id} className="mb-4 p-3 rounded-lg bg-[#0a0a0a] border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 text-sm">
                {message.displayName || "Anonymous"}
              </span>
              <span className="text-gray-500 text-xs">
                {message.createdAt && message.createdAt.toDate 
                  ? message.createdAt.toDate().toLocaleString() 
                  : 'Just now'}
              </span>
            </div>
            <p className="text-white font-openSans">{message.text}</p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex gap-4">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="bg-gray-800 text-white p-3 rounded-lg border border-gray-700 w-full h-20 resize-none"
        />
        <button
          onClick={handleSendMessage}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 rounded h-20"
          aria-label="Send message"
        >
          ➤ Send
        </button>
      </div>
    </div>
  );
};

export default ChatFeedPage;