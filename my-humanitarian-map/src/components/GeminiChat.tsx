import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { findCrisisAnswer, getRandomQuickQuestions } from '../data/crisisQA';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface GeminiChatProps {
  crisisData?: any[];
  selectedCountry?: string;
  currentChart?: string;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ 
  crisisData = [], 
  selectedCountry, 
  currentChart 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your CrisisCompass AI assistant. Ask me about crisis data, funding gaps, or country insights. I'll give you direct answers!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContextString = () => {
    let context = "You are analyzing humanitarian crisis data from CrisisCompass. ";
    
    if (selectedCountry) {
      context += `The user is currently looking at ${selectedCountry}. `;
    }
    
    if (currentChart) {
      context += `They're viewing the ${currentChart} chart. `;
    }
    
    if (crisisData.length > 0) {
      const topCrises = crisisData.slice(0, 5).map(d => d.name || d.ISO3).join(', ');
      context += `Top crisis countries in the data: ${topCrises}. `;
    }
    
    context += "Provide helpful, concise insights about humanitarian crises, funding gaps, and health needs. Be specific and data-driven.";
    
    return context;
  };

  const callGeminiAPI = async (message: string): Promise<string> => {
    const API_KEY = "AIzaSyCHXyS__UJprOxuDK3ZpwTMQFiPPEsqzDY";
    const context = getContextString();
    const fullPrompt = `${context}\n\nUser question: ${message}\n\nIMPORTANT: Provide ONLY the final answer/result. Do NOT show your analysis, reasoning, or step-by-step process. Give direct, actionable insights.`;
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that request. Please try again.";
    } catch (error) {
      // console.error('Gemini API error:', error);
      return "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Try to find answer in our knowledge base first
      const qaAnswer = findCrisisAnswer(inputText.trim());
      
      let botResponse: string;
      if (qaAnswer) {
        // Use pre-defined answer from knowledge base
        botResponse = qaAnswer.answer;
      } else {
        // Fallback to Gemini API for questions not in knowledge base
        botResponse = await callGeminiAPI(inputText.trim());
      }
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = getRandomQuickQuestions(5).map(qa => qa.question);

  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-50"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          style={{ 
            background: '#2563eb', 
            border: 'none', 
            borderRadius: '50%', 
            padding: '16px',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}
        >
          <MessageCircle size={24} />
        </button>
        <div 
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse"
          style={{ 
            position: 'absolute', 
            top: '-8px', 
            right: '-8px', 
            background: '#ef4444', 
            color: 'white', 
            borderRadius: '50%', 
            width: '24px', 
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
        >
          AI
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl"
      style={{ 
        position: 'fixed', 
        bottom: '24px', 
        right: '24px', 
        zIndex: 50,
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        width: '400px',
        height: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div 
        className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between"
        style={{ 
          background: '#2563eb', 
          color: 'white', 
          padding: '16px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <div>
            <h3 className="font-semibold">CrisisCompass AI</h3>
            <p className="text-xs opacity-90">Humanitarian Data Assistant</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          style={{ background: 'none', border: 'none', color: 'white', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Quick Questions */}
      <div className="p-3 border-b" style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
        <p className="text-xs text-gray-800 mb-2 font-medium" style={{ color: '#1f2937' }}>Quick Questions:</p>
        <div className="flex flex-wrap gap-1">
          {quickQuestions.slice(0, 2).map((question, index) => (
            <button
              key={index}
              onClick={() => setInputText(question)}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-full transition-colors text-white"
              style={{ 
                background: '#374151', 
                border: 'none', 
                borderRadius: '12px', 
                padding: '4px 8px', 
                fontSize: '12px',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              {question.length > 30 ? question.substring(0, 30) + '...' : question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <div 
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: '#2563eb', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-white'
              }`}
              style={{ 
                background: message.sender === 'user' ? '#2563eb' : '#1f2937',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                maxWidth: '80%'
              }}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.sender === 'user' && (
              <div 
                className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: '#9ca3af', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div 
              className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
              style={{ 
                background: '#2563eb', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bot size={16} className="text-white" />
            </div>
            <div 
              className="bg-gray-800 p-3 rounded-lg"
              style={{ background: '#1f2937', padding: '12px', borderRadius: '12px' }}
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div 
        className="p-4 border-t"
        style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for crisis insights..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              flex: 1, 
              padding: '8px 12px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px',
              fontSize: '14px',
              color: '#000000'
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: (!inputText.trim() || isLoading) ? '#9ca3af' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              color: 'white',
              cursor: (!inputText.trim() || isLoading) ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
