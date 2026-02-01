// SidebarChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import pb from '../lib/pocketbase';

export default function SidebarChat({ receiver, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    // 1. Load History
    async function loadMessages() {
      try {
        const records = await pb.collection('messages').getList(1, 50, {
          filter: `(sender="${pb.authStore.model.id}" && receiver="${receiver.id}") || (sender="${receiver.id}" && receiver="${pb.authStore.model.id}")`,
          sort: 'created',
        });
        setMessages(records.items);
      } catch (err) { console.error("History fetch failed", err); }
    }

    loadMessages();

    // 2. Real-time Subscription
    pb.collection('messages').subscribe('*', ({ action, record }) => {
      if (action === 'create') {
        // Ensure message belongs to this specific conversation
        const isFromMe = record.sender === pb.authStore.model.id && record.receiver === receiver.id;
        const isToMe = record.sender === receiver.id && record.receiver === pb.authStore.model.id;
        if (isFromMe || isToMe) {
          setMessages(prev => [...prev, record]);
        }
      }
    });

    return () => pb.collection('messages').unsubscribe();
  }, [receiver.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await pb.collection('messages').create({
        sender: pb.authStore.model.id,
        receiver: receiver.id,
        content: newMessage
      });
      setNewMessage("");
    } catch (err) { console.error("Transmission failed", err); }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex flex-col h-80 bg-[var(--bg-color)] border-t border-[var(--accent-color)]/40">
      <div className="p-3 bg-white/5 flex justify-between items-center border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-color)]">Comms // {receiver.username}</span>
          <span className="text-[7px] font-mono opacity-40 uppercase">Encrypted Link Active</span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === pb.authStore.model.id ? 'items-end' : 'items-start'}`}>
            <div className={`p-2 text-[11px] max-w-[85%] ${
              msg.sender === pb.authStore.model.id 
              ? 'bg-[var(--accent-color)] text-black font-medium' 
              : 'bg-white/5 border border-white/10 text-white'
            }`}>
              {msg.content}
            </div>
            <span className="text-[7px] font-mono opacity-25 mt-1">{formatTime(msg.created)}</span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-2 border-t border-white/5 flex gap-1">
        <input 
          className="flex-1 bg-black/40 border border-white/10 text-[10px] p-2 outline-none focus:border-[var(--accent-color)]"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="ENTER SECURE MESSAGE..."
        />
        <button className="bg-[var(--accent-color)] text-black px-4 text-[9px] font-bold uppercase">Sync</button>
      </form>
    </div>
  );
}