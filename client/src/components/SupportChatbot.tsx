import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, X, Send, MessageSquare } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SupportChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m your Paddock20 AI assistant. How can I help you with automotive questions today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Predefined automotive and app-specific responses for demo purposes
  const predefinedResponses = {
    'tire': 'For tire questions, I recommend checking tire pressure monthly. The recommended PSI is typically found on the driver\'s door jamb. For performance driving, consider reducing pressure by 2-3 PSI when the tires are hot.',
    'oil': 'Regular oil changes are crucial. For synthetic oil in high-performance vehicles, change every 5,000-7,500 miles. Track days may require more frequent changes.',
    'event': 'Paddock20 events are exclusive gatherings for members. Check the Events Calendar in the app for upcoming track days, meetups, and driving experiences.',
    'membership': 'Paddock20 membership provides exclusive access to our marketplace, events, and expert network. You can upgrade your membership in Settings.',
    'weather': 'The Weather Station feature provides real-time weather data for your location, including track conditions for registered racing venues.',
    'service': 'For service recommendations, I suggest consulting your vehicle\'s maintenance schedule. The Maintenance Checklist in the app can help track your service history.',
  };

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Check for keywords in the message to provide relevant predefined responses
      const lowercaseInput = inputMessage.toLowerCase();
      let responseContent = 'I\'m sorry, I don\'t have specific information about that. Could you try asking about tires, oil changes, events, membership, weather features, or service recommendations?';
      
      Object.entries(predefinedResponses).forEach(([keyword, response]) => {
        if (lowercaseInput.includes(keyword)) {
          responseContent = response;
        }
      });
      
      const assistantMessage = { role: 'assistant' as const, content: responseContent };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Handle key press event for the input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50 transition-all duration-300"
        aria-label="Open support chat"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-xl flex flex-col border border-gray-700 z-50 overflow-hidden">
          {/* Chat header */}
          <div className="bg-gray-900 py-3 px-4 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-400" />
              <h3 className="font-bold text-white">Paddock20 Support</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-2 p-2 rounded-lg max-w-[85%] ${
                  message.role === 'user' 
                    ? 'ml-auto bg-green-600 text-white' 
                    : 'bg-gray-800 text-white'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-800 text-white p-2 rounded-lg max-w-[85%] flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 bg-gray-800 text-white p-2 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                rows={2}
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-green-500 hover:bg-green-400 text-black"
                disabled={isLoading || inputMessage.trim() === ''}
                aria-label="Send message"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatbot;