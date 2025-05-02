import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GamePrize } from "@/types";

interface SpinWheelProps {
  prizes: GamePrize[];
  onComplete: () => void;
}

export default function SpinWheel({ prizes, onComplete }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<GamePrize | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinTimeoutRef = useRef<number | null>(null);
  
  // Define colors for the wheel segments
  const colors = [
    "#FF6B35", // primary
    "#2EC4B6", // secondary
    "#FFBC42", // accent
    "#1A2238", // dark
    "#FF6B35", // repeating for more segments
    "#2EC4B6",
    "#FFBC42",
    "#1A2238",
  ];
  
  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Calculate the size of each segment
        const numSegments = prizes.length;
        const arcSize = (2 * Math.PI) / numSegments;
        
        // Draw wheel
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        for (let i = 0; i < numSegments; i++) {
          const startAngle = i * arcSize;
          const endAngle = (i + 1) * arcSize;
          
          // Draw segment
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fillStyle = colors[i % colors.length];
          ctx.fill();
          ctx.stroke();
          
          // Draw prize text
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(startAngle + arcSize / 2);
          ctx.textAlign = "right";
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 14px Arial";
          ctx.fillText(prizes[i].name, radius - 20, 5);
          ctx.restore();
        }
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.stroke();
        
        // Draw pointer
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius - 5);
        ctx.lineTo(centerX - 10, centerY - radius + 10);
        ctx.lineTo(centerX + 10, centerY - radius + 10);
        ctx.closePath();
        ctx.fillStyle = "#FF0000";
        ctx.fill();
      }
    }
  }, [prizes]);
  
  // Function to determine the winner based on probability
  const determineWinner = (): GamePrize => {
    // Calculate total probability
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    
    // Generate a random value between 0 and total probability
    const randomValue = Math.random() * totalProbability;
    
    // Determine which prize was selected
    let cumulativeProbability = 0;
    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (randomValue <= cumulativeProbability) {
        return prize;
      }
    }
    
    // Default to first prize if something goes wrong
    return prizes[0];
  };
  
  // Function to handle spinning the wheel
  const spinWheel = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      setResult(null);
      
      // Determine the winning prize
      const winningPrize = determineWinner();
      setResult(winningPrize);
      
      // Calculate which segment the wheel should land on
      const winningIndex = prizes.findIndex(prize => prize.id === winningPrize.id);
      const numSegments = prizes.length;
      const segmentSize = 360 / numSegments;
      
      // Calculate the target angle (adding multiple rotations for effect)
      const baseAngle = (winningIndex * segmentSize) + 1800; // 5 full rotations (1800 degrees) + segment
      const finalAngle = baseAngle + Math.random() * segmentSize; // Random position within segment
      
      // Animate the wheel spinning
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          let currentAngle = 0;
          let animationSpeed = 10;
          const spinSpeed = 10;
          
          const animate = () => {
            if (currentAngle >= finalAngle) {
              setIsSpinning(false);
              
              // Wait a moment before completing
              spinTimeoutRef.current = window.setTimeout(() => {
                onComplete();
              }, 1000);
              return;
            }
            
            // Increment the angle
            if (currentAngle < finalAngle - 500) {
              // Fast at the beginning
              currentAngle += spinSpeed;
            } else if (currentAngle < finalAngle - 200) {
              // Slow down gradually
              currentAngle += spinSpeed * 0.5;
            } else {
              // Very slow at the end
              currentAngle += spinSpeed * 0.1;
            }
            
            // Rotate the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((currentAngle * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            
            // Redraw the wheel
            const numSegments = prizes.length;
            const arcSize = (2 * Math.PI) / numSegments;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 10;
            
            for (let i = 0; i < numSegments; i++) {
              const startAngle = i * arcSize;
              const endAngle = (i + 1) * arcSize;
              
              // Draw segment
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.arc(centerX, centerY, radius, startAngle, endAngle);
              ctx.closePath();
              ctx.fillStyle = colors[i % colors.length];
              ctx.fill();
              ctx.stroke();
              
              // Draw prize text
              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.rotate(startAngle + arcSize / 2);
              ctx.textAlign = "right";
              ctx.fillStyle = "#FFFFFF";
              ctx.font = "bold 14px Arial";
              ctx.fillText(prizes[i].name, radius - 20, 5);
              ctx.restore();
            }
            
            // Draw center circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
            
            // Draw pointer (not rotated)
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - radius - 5);
            ctx.lineTo(centerX - 10, centerY - radius + 10);
            ctx.lineTo(centerX + 10, centerY - radius + 10);
            ctx.closePath();
            ctx.fillStyle = "#FF0000";
            ctx.fill();
            
            requestAnimationFrame(animate);
          };
          
          animate();
        }
      }
    }
  };
  
  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-xs mx-auto">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
          className="mx-auto"
        />
      </div>
      
      <div className="mt-4 text-center">
        {result && !isSpinning && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="font-bold text-lg">{result.name}</p>
            <p className="text-sm text-gray-600">
              {result.type === "points" 
                ? `You won ${result.value} points!` 
                : "You won a special reward!"}
            </p>
          </div>
        )}
        
        <Button 
          onClick={spinWheel} 
          disabled={isSpinning} 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-lg"
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel"}
        </Button>
      </div>
    </div>
  );
}
