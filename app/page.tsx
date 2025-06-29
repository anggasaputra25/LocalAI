'use client'

import { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function Home() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setloading] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); 

  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // reset
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height
    }
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    setloading(true);
    if (!input.trim()) {
      setloading(false);
      return;
    }

    // Tambahkan pesan user ke array
    setMessages(prev => [...prev, { role: 'user', text: input }]);

    setInput('');
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const fullConversation = [...conversationHistory, { role: 'user', parts: [{ text: input }] }];

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullConversation,
      });

      if (!result || !result.text) {
        console.error("Cannot get response");
        setMessages(prev => [...prev, { role: 'ai', text: "Cannot get response from Gemini." }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'ai', text: result.text as string }]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // reset height
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Something wrong." }]);
      console.error(error);
    } finally {
      setloading(false);
    }
  };

  // Delete chat
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This data will be permanently deleted!',
      icon: 'warning',
      background: '#262626',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      setMessages([]);
      Swal.fire({
        title: 'Deleted!',
        text: 'Data has been deleted.',
        icon: 'success',
        background: '#262626',
        color: '#ffffff',
        confirmButtonColor: '#2563eb',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-5 md:w-2/3 md:p-0 m-auto">
      <div className="flex justify-center">
        <h1 className='my-2 p-3 text-2xl font-semibold'>LOCAL<span className='bg-white px-2 py-1 rounded-sm text-neutral-900'>AI</span></h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-2 py-3 rounded-md rounded-t-none rounded-l-md max-w-full ${msg.role === 'user' ? 'bg-neutral-800 self-end ml-auto w-fit px-3' : 'text-white self-start mr-auto'}`}
          >
            {msg.text}
          </div>
        ))}
        <div className={`my-2 ${loading ? 'block' : 'hidden'}`}>
          <div className="flex space-x-2 items-center h-16">
            <div className="w-2 h-2 bg-gray-50 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-50 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-gray-50 rounded-full animate-bounce [animation-delay:-0.3s]" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-neutral-800 mb-8 rounded-sm relative overflow-hidden">
        <div className={`flex gap-2 items-end`}>
          <textarea
            ref={textareaRef}
            className="w-full p-2 border-0 focus:outline-none focus:ring-0 resize-none overflow-hidden"
            placeholder="Ask anything"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={handleSend}
            className={`bg-gray-50 px-3 py-3 rounded-md hover:bg-gray-300 ${loading ? 'opacity-20' : 'opacity-100'}`}
            disabled={loading}
          >
            <FaPaperPlane className="w-4 h-4 text-neutral-900" />
          </button>
          <button
            onClick={handleDelete}
            className={`bg-red-700 px-3 py-3 rounded-md hover:bg-red-800 ${loading ? 'opacity-20' : 'opacity-100'}`}
            disabled={loading}
          >
            <FaTrash className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}