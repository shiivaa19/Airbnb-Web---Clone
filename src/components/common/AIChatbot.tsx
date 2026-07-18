'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Home, DollarSign, MapPin } from 'lucide-react';
import { useSearchStore } from '../../store/search-store';
import { useToastStore } from '../../store/toast-store';
import apiClient from '../../services/api-client';
import Link from 'next/link';
interface Message {
  sender: 'user' | 'ai';
  text: string;
  links?: { title: string; href: string }[];
}

const typoDictionary: Record<string, string> = {
  hyderabas: 'Hyderabad',
  hydrabad: 'Hyderabad',
  hyderbad: 'Hyderabad',
  hyd: 'Hyderabad',
  goaa: 'Goa',
  goas: 'Goa',
  banglore: 'Bangalore',
  banaglore: 'Bangalore',
  bngl: 'Bangalore',
  chennai: 'Chennai',
  punne: 'Pune',
  pune: 'Pune',
  mumabi: 'Mumbai',
  mumbay: 'Mumbai',
  kerela: 'Kerala',
  keral: 'Kerala',
  himalaya: 'Himalayas',
  himalayaas: 'Himalayas',
  rajasthan: 'Rajasthan',
  tokyo: 'Tokyo',
  tokio: 'Tokyo',
  paris: 'Paris',
  priss: 'Paris',
  aspen: 'Aspen',
  santorini: 'Santorini',
  kyoto: 'Kyoto',
  malibu: 'Malibu',
  rome: 'Rome',
  sydney: 'Sydney',
  cairo: 'Cairo',
  london: 'London',
  'new york': 'New York',
  newyork: 'New York',
  bali: 'Bali',
  maui: 'Maui',
  rio: 'Rio',
  munich: 'Munich',
  berlin: 'Berlin',
  india: 'India',
  ind: 'India',
  japan: 'Japan',
  france: 'France',
  italy: 'Italy',
  egypt: 'Egypt',
  greece: 'Greece',
  usa: 'United States',
  'united states': 'United States',
  america: 'United States'
};

const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
};

const findFuzzyLocationMatch = (inputWord: string): string | null => {
  const target = inputWord.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  if (target.length < 3) return null;
  
  if (typoDictionary[target]) {
    return typoDictionary[target];
  }

  const knownLocations = [
    'Hyderabad', 'Goa', 'Mumbai', 'Bangalore', 'Kerala', 'Himalayas', 'Rajasthan',
    'Tokyo', 'Paris', 'Aspen', 'Santorini', 'Kyoto', 'Malibu', 'Rome', 
    'Sydney', 'Cairo', 'London', 'New York', 'Bali', 'Maui', 'Rio',
    'India', 'Japan', 'France', 'Italy', 'Egypt', 'Greece', 'United States'
  ];

  let bestMatch = null;
  let minDistance = 999;
  
  for (const loc of knownLocations) {
    const distance = getLevenshteinDistance(target, loc.toLowerCase());
    const maxAllowedTypos = loc.length > 6 ? 3 : 2;
    if (distance <= maxAllowedTypos && distance < minDistance) {
      minDistance = distance;
      bestMatch = loc;
    }
  }

  return bestMatch;
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hi there! I am your Airbnb AI Concierge. Ask me to find properties, filter by budget, or show stays in specific cities!',
    },
  ]);

  const searchStore = useSearchStore();
  const addToast = useToastStore((state) => state.addToast);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      processQuery(textToSend);
    }, 1000);
  };

  const processQuery = async (query: string) => {
    try {
      // Build request payloads matching backend schema
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      history.push({ role: 'user', content: query });

      const res = await apiClient.post('/ai/chat', { messages: history });
      const responseText = res.data.response;

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: responseText }
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '⚠️ Failed to connect to AI Concierge. Please make sure the backend is active.' }
      ]);
    }
  };

  const quickPrompts = [
    { text: 'Show beachfront stays 🏖️', query: 'Show beachfront stays' },
    { text: 'Stays under $300 💸', query: 'Find properties under $300' },
    { text: 'Villas in Tokyo 🇯🇵', query: 'Any villas in Tokyo?' },
    { text: 'Pet friendly homes 🐾', query: 'Which stays are pet friendly?' }
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40 select-none font-normal text-xs">
      
      {/* Closed Pulsing Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-12 h-12 rounded-full airbnb-gradient text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative group animate-bounce"
        >
          <Sparkles size={20} className="animate-pulse" />
          <span className="absolute right-14 bg-neutral-850 dark:bg-neutral-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            AI Assistant
          </span>
        </button>
      )}

      {/* Expanded Chat Assistant Panel */}
      {isOpen && (
        <div className="w-80 h-[430px] rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 airbnb-gradient text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="animate-spin duration-1000" />
              <span className="font-extrabold text-sm tracking-wide">Airbnb AI Concierge</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:scale-110 transition-transform cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Log area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 max-h-[250px] scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1 max-w-[85%] ${
                  msg.sender === 'user' ? 'align-self-end ml-auto' : 'align-self-start mr-auto'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-[#FF385C] text-white rounded-tr-none'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-neutral-200/40 dark:border-neutral-700/40'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  
                  {/* Dynamic recommendations links list */}
                  {msg.links && msg.links.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50">
                      {msg.links.map((link, lidx) => (
                        <Link
                          key={lidx}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 font-bold hover:underline"
                        >
                          <Home size={10} className="shrink-0" />
                          <span className="truncate">{link.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing status indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 font-medium">
                <Sparkles size={12} className="animate-spin text-rose-500" />
                <span>Concierge is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Action Prompts Ribbon */}
          <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none select-none shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt.query}
                type="button"
                onClick={() => handleSend(prompt.query)}
                className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full hover:border-[#FF385C] dark:hover:border-[#FF385C] text-[10px] font-bold text-neutral-600 dark:text-neutral-350 cursor-pointer shadow-xs active:scale-97 transition-all shrink-0"
              >
                {prompt.text}
              </button>
            ))}
          </div>

          {/* Message Input block */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-neutral-100 dark:border-neutral-800 flex gap-2 items-center bg-white dark:bg-[#1C1C1E]"
          >
            <input
              type="text"
              placeholder="Ask AI Concierge..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 focus:outline-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl airbnb-gradient text-white hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
