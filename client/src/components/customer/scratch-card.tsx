import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

interface ScratchCardProps {
  onComplete: () => void;
}

export default function ScratchCard({ onComplete }: ScratchCardProps) {
  const [isScratched, setIsScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratchingActive, setIsScratchingActive] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prizeRef = useRef<HTMLDivElement>(null);
  
  // Sample prize (in a real app, this would be fetched from the backend)
  const prize = {
    type: "points",
    value: 50,
    name: "50 Points",
  };
  
  // Initialize the scratch card
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the scratch layer (gray overlay)
        ctx.fillStyle = "#CCCCCC";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a pattern to make it look more like a scratch card
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillStyle = "#BBBBBB";
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Add some text indicating to scratch
        ctx.fillStyle = "#555555";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Scratch here to reveal your prize!", canvas.width / 2, canvas.height / 2);
      }
    }
  }, []);
  
  // Handle scratching
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let isDrawing = false;
    let totalPixels = canvas.width * canvas.height;
    let clearedPixels = 0;
    
    const getMousePosition = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      
      if ((e as TouchEvent).touches) {
        const touch = (e as TouchEvent).touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
      } else {
        return {
          x: (e as MouseEvent).clientX - rect.left,
          y: (e as MouseEvent).clientY - rect.top
        };
      }
    };
    
    const startScratch = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing = true;
      setIsScratchingActive(true);
      draw(e);
    };
    
    const endScratch = () => {
      isDrawing = false;
      setIsScratchingActive(false);
      
      // Check how much has been scratched
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentPixels = 0;
      
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 50) { // Alpha value less than 50 (mostly transparent)
          transparentPixels++;
        }
      }
      
      const percentage = (transparentPixels / (totalPixels)) * 100;
      setScratchPercentage(percentage);
      
      // If more than 50% is scratched, consider it fully scratched
      if (percentage > 50 && !isScratched) {
        setIsScratched(true);
        setTimeout(() => {
          setIsRevealed(true);
          // Clear the entire canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 500);
      }
    };
    
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      
      const pos = getMousePosition(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fill();
    };
    
    // Add mouse and touch event listeners for scratching
    canvas.addEventListener("mousedown", startScratch);
    canvas.addEventListener("touchstart", startScratch);
    
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchmove", draw);
    
    canvas.addEventListener("mouseup", endScratch);
    canvas.addEventListener("touchend", endScratch);
    canvas.addEventListener("mouseleave", endScratch);
    
    // Clean up event listeners
    return () => {
      canvas.removeEventListener("mousedown", startScratch);
      canvas.removeEventListener("touchstart", startScratch);
      
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("touchmove", draw);
      
      canvas.removeEventListener("mouseup", endScratch);
      canvas.removeEventListener("touchend", endScratch);
      canvas.removeEventListener("mouseleave", endScratch);
    };
  }, [isScratched]);
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-full max-w-xs mx-auto rounded-md overflow-hidden"
        style={{ cursor: isScratchingActive ? "grabbing" : "grab" }}
      >
        {/* Prize underneath */}
        <div 
          ref={prizeRef} 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-primary/20 to-accent/20 p-8 text-center"
        >
          {isRevealed ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Gift className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-lg">You won {prize.name}!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 animate-pulse">
                <Gift className="h-10 w-10" />
              </div>
              <div className="h-6 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
          )}
        </div>
        
        {/* Scratch overlay */}
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={200} 
          className={`w-full h-full transition-opacity ${isRevealed ? "opacity-0" : "opacity-100"}`}
        />
      </div>
      
      <div className="mt-6 text-center">
        {!isScratched && (
          <p className="text-sm text-gray-500 mb-2">
            Scratch the card to reveal your prize!
          </p>
        )}
        
        <Button 
          onClick={onComplete} 
          disabled={!isRevealed} 
          size="lg"
          className="bg-primary hover:bg-primary/90 mt-2"
        >
          {isRevealed ? "Claim Your Prize" : "Scratch to Continue"}
        </Button>
        
        {!isScratched && scratchPercentage > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Scratched: {Math.round(scratchPercentage)}% 
            {scratchPercentage < 50 && " (Need to scratch 50%)"}
          </p>
        )}
      </div>
    </div>
  );
}
