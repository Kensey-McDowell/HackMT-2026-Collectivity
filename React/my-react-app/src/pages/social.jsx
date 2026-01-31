import React from 'react';

export default function SocialPage() {
  return (
    // "h-screen" and "overflow-hidden" lock the page so it doesn't scroll
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="w-1/3" /> {/* Left Spacer */}
        
        <div className="w-1/3 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Platform
          </h1>
        </div>

        {/* TOP RIGHT: Profile Name only */}
        <div className="w-1/3 flex justify-end items-center">
          <span className="font-bold text-slate-700 hover:text-indigo-600 cursor-pointer transition">
            Alex Rivera
          </span>
        </div>
      </nav>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: Recently Viewed */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden lg:block overflow-hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Recently Viewed
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </aside>

        {/* CENTER: The Scrollable Box */}
        <main className="flex-1 p-6 bg-slate-100 flex flex-col">
          {/* This container has overflow-y-auto, making it the only scrollable part */}
          <div className="flex-1 bg-white rounded-2xl shadow-inner border border-slate-200 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Dummy boxes for future pictures */}
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-300 font-medium"
                >
                  Box {i + 1}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT: Search & Filters */}
        <aside className="w-80 bg-white border-l border-slate-200 p-6 hidden md:flex flex-col gap-6">
          <h2 className="font-bold text-slate-800">Discovery</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
              <input type="text" placeholder="Search..." className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
              <select className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 outline-none">
                <option>All Items</option>
                <option>Digital</option>
                <option>Physical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {['#Art', '#Tech', '#Web3'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-bold cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}