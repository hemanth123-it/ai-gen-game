import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Point {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;

export default function SnakeGame({ onScoreChange }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [isPaused, setIsPaused] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      };
    } while (currentSnake.some(p => p.x === newFood.x && p.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection({ x: 0, y: -1 });
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    onScoreChange(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (gameOver) resetGame();
          else setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver]);

  useEffect(() => {
    if (isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: (head.x + direction.x + CANVAS_SIZE / GRID_SIZE) % (CANVAS_SIZE / GRID_SIZE),
          y: (head.y + direction.y + CANVAS_SIZE / GRID_SIZE) % (CANVAS_SIZE / GRID_SIZE),
        };

        // Collision with self
        if (prevSnake.some(p => p.x === newHead.x && p.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check if food eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onScoreChange(newScore);
          setFood(generateFood(newSnake));
          setSpeed(prev => Math.max(MIN_SPEED, prev - 2));
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, speed);
    return () => clearInterval(intervalId);
  }, [isPaused, gameOver, direction, food, score, speed, generateFood, onScoreChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid lines (subtle radial-like grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#22d3ee' : `rgba(34, 211, 238, ${0.8 - index * 0.05})`;
      ctx.shadowBlur = index === 0 ? 10 : 0;
      ctx.shadowColor = '#22d3ee';
      const radius = 2;
      const x = segment.x * GRID_SIZE + 1;
      const y = segment.y * GRID_SIZE + 1;
      const size = GRID_SIZE - 2;
      
      // Rounded rect for snake segments
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="relative group">
      <div className="p-1 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-xl shadow-cyan-glow">
        <div className="relative rounded-lg overflow-hidden border border-white/10">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="block"
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-accent-cyan/5 to-transparent h-8 w-full animate-scanline" />

          <AnimatePresence>
            {(isPaused || gameOver) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md"
              >
                <div className="text-center p-8 bg-black/40 border border-white/10 rounded-xl shadow-2xl">
                  <h2 className="font-bold text-2xl mb-4 tracking-tighter uppercase">
                    {gameOver ? 'Neural Halt' : 'Sequence Paused'}
                  </h2>
                  <p className="font-mono text-accent-cyan mb-6 text-sm">
                    {gameOver ? `FINAL SYNC SCORE: ${score}` : 'PRESS SPACE TO INITIALIZE'}
                  </p>
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-accent-cyan text-black font-bold uppercase text-xs tracking-widest rounded transition-transform hover:scale-105 active:scale-95 shadow-cyan"
                  >
                    {gameOver ? 'Reboot System' : 'Resume Sync'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Controls Info */}
      <div className="mt-8 flex justify-center items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-gray-500">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 border border-white/10 rounded bg-white/5 text-white">WASD</span> to sync
        </div>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 border border-white/10 rounded bg-white/5 text-white">SPACE</span> to pause
        </div>
      </div>
    </div>
  );
}
