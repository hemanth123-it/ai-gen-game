/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SnakeGame from './components/SnakeGame';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  color: string;
  genre: string;
}

const DUMMY_TRACKS: Track[] = [
  { id: 1, title: 'Midnight Pulse', artist: 'AI Core Alpha', duration: '03:45', color: '#06b6d4', genre: 'Synth Wave' },
  { id: 2, title: 'Cyber Runner', artist: 'Glitch Synth', duration: '03:42', color: '#a855f7', genre: 'Industrial' },
  { id: 3, title: 'Neon Rainfall', artist: 'Lofi Vapor', duration: '04:15', color: '#bcfe2f', genre: 'Chill' },
];

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(5800);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 225) { // 3:45 = 225s
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % DUMMY_TRACKS.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setCurrentTrackIndex(prev => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <div className="w-full h-screen bg-bg-dark text-white font-sans overflow-hidden flex flex-col">
      {/* Header Navigation */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-accent-cyan rounded-sm flex items-center justify-center shadow-cyan">
            <div className="w-4 h-4 bg-black"></div>
          </div>
          <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">
            Neon<span className="text-accent-cyan">Synth</span> Snake
          </span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <span className="text-accent-cyan cursor-pointer">Arcade</span>
          <span className="hover:text-white transition-colors cursor-pointer">Playlist</span>
          <span className="hover:text-white transition-colors cursor-pointer">Leaderboard</span>
          <span className="hover:text-white transition-colors cursor-pointer">Settings</span>
        </div>
        <div className="text-xs font-mono text-accent-cyan/80">LVL: 04 / BPM: 128</div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Music Library */}
        <aside className="w-80 border-r border-white/10 flex flex-col bg-black/20 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-cyan mb-6">Now Playing</h2>
            <div className="relative group">
              <div className="aspect-square bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-lg shadow-2xl overflow-hidden border border-white/10 flex items-center justify-center relative">
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={currentTrack.id}
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 1.1, opacity: 0 }}
                     className="absolute inset-0 flex items-center justify-center"
                   >
                     <div className="absolute inset-0 opacity-20 mix-blend-overlay flex items-center justify-center">
                        <div className="w-48 h-48 border-[10px] border-white rounded-full"></div>
                     </div>
                     <div className="absolute bottom-4 left-4">
                        <div className="text-xl font-bold leading-tight">{currentTrack.title.replace(' ', '\n')}</div>
                        <div className="text-[10px] text-accent-cyan font-mono uppercase tracking-wider">{currentTrack.artist}</div>
                     </div>
                   </motion.div>
                 </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="px-6 flex-1">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Playlist Queue</h2>
            <div className="space-y-4">
              {DUMMY_TRACKS.map((track, index) => (
                <div 
                  key={track.id} 
                  onClick={() => { setCurrentTrackIndex(index); setProgress(0); }}
                  className={`flex items-center gap-4 group cursor-pointer transition-opacity ${index === currentTrackIndex ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                >
                  <div className={`w-10 h-10 rounded flex items-center justify-center text-xs ${index === currentTrackIndex ? 'bg-accent-cyan text-black font-bold' : 'bg-white/5 text-gray-500'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium transition-colors ${index === currentTrackIndex ? 'text-accent-cyan' : 'group-hover:text-accent-cyan'}`}>
                      {track.title}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      {track.genre} • {track.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Area: Snake Game */}
        <section className="flex-1 flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,_#111_0%,_#050505_100%)]">
          {/* Score Floating Panel */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-12 z-10">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Session Synced</div>
              <div className="text-4xl font-black text-white">{score.toLocaleString()}</div>
            </div>
            <div className="w-[1px] h-12 bg-white/10"></div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">High Terminal</div>
              <div className="text-4xl font-black text-accent-cyan">{highScore.toLocaleString()}</div>
            </div>
          </div>

          <SnakeGame onScoreChange={setScore} />
        </section>
      </main>

      {/* Bottom Player Controls */}
      <footer className="h-24 bg-black border-t border-white/10 px-8 flex items-center z-20">
        <div className="flex items-center gap-4 w-1/4">
          <div className="w-12 h-12 bg-gray-900 rounded-md bg-[url('https://placehold.co/100x100/06b6d4/fff?text=💿')] bg-cover"></div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold truncate max-w-[120px]">{currentTrack.title}</div>
            <div className="text-[10px] text-accent-cyan font-mono tracking-tighter">
              {formatTime(progress)} / {currentTrack.duration}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-8">
            <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
            </button>
            <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors">
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>
          <div className="w-full max-w-md h-1 bg-white/10 rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute h-full bg-accent-cyan rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              animate={{ width: `${(progress / 225) * 100}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
        </div>

        <div className="w-1/4 flex justify-end items-center gap-6">
          <div className="hidden lg:flex items-center gap-2">
            <Volume2 size={16} className="text-gray-500" />
            <div className="w-24 h-1 bg-white/10 rounded-full">
              <div className="w-2/3 h-full bg-white/40 rounded-full"></div>
            </div>
          </div>
          <button className="hidden sm:block px-3 py-2 border border-white/20 rounded-md text-[10px] text-gray-400 uppercase tracking-widest hover:border-accent-cyan hover:text-accent-cyan transition-colors">
            Visualizer
          </button>
        </div>
      </footer>
    </div>
  );
}


