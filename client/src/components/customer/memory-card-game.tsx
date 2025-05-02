import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Coffee, CupSoda, Croissant, Pizza, Cake, IceCream, Salad, Sandwich, 
  Loader2, Trophy, TimerReset
} from "lucide-react";
import { motion } from "framer-motion";

interface MemoryCardGameProps {
  onComplete: () => void;
}

type Card = {
  id: number;
  icon: React.ReactNode;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function MemoryCardGame({ onComplete }: MemoryCardGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCount, setFlippedCount] = useState(0);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds to complete the game

  // Initialize game
  useEffect(() => {
    const icons = [
      <Coffee className="h-10 w-10 text-amber-700" />,
      <CupSoda className="h-10 w-10 text-blue-500" />,
      <Croissant className="h-10 w-10 text-yellow-600" />,
      <Pizza className="h-10 w-10 text-red-500" />,
      <Cake className="h-10 w-10 text-pink-500" />,
      <IceCream className="h-10 w-10 text-cyan-500" />,
      <Salad className="h-10 w-10 text-green-500" />,
      <Sandwich className="h-10 w-10 text-orange-500" />
    ];

    // Create pairs of cards
    const cardPairs = icons.map((icon, index) => [
      {
        id: index * 2,
        icon,
        isFlipped: false,
        isMatched: false
      },
      {
        id: index * 2 + 1,
        icon,
        isFlipped: false,
        isMatched: false
      }
    ]).flat();

    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setMatchedPairs(0);
    setMoves(0);
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || gameOver) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameOver]);

  // Check if game is over
  useEffect(() => {
    if (matchedPairs === 8) {
      setGameOver(true);
      setTimeout(() => {
        setLoading(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 1000);
    }

    if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      setTimeout(() => {
        setLoading(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 1000);
    }
  }, [matchedPairs, timeLeft, gameOver, onComplete]);

  // Handle card flip
  const flipCard = (id: number) => {
    // Don't allow flips while checking for matches
    if (flippedCount === 2) return;
    
    // Find the card that was clicked
    setCards(prevCards => {
      return prevCards.map(card => {
        // If this card was clicked and it's not already flipped, flip it
        if (card.id === id && !card.isFlipped && !card.isMatched) {
          // Add this card's index to flippedIndexes
          setFlippedCount(flippedCount + 1);
          setFlippedIndexes([...flippedIndexes, id]);
          return { ...card, isFlipped: true };
        }
        return card;
      });
    });
  };

  // Check for matches
  useEffect(() => {
    // If we have flipped 2 cards, check if they match
    if (flippedCount === 2) {
      setMoves(moves + 1);
      
      const flippedCardIds = flippedIndexes;
      const flippedCards = cards.filter(card => flippedCardIds.includes(card.id));
      
      // Do the icons match?
      if (flippedCards[0].icon.type === flippedCards[1].icon.type) {
        // Mark the cards as matched
        setCards(prevCards => {
          return prevCards.map(card => {
            if (flippedCardIds.includes(card.id)) {
              return { ...card, isMatched: true };
            }
            return card;
          });
        });
        setMatchedPairs(matchedPairs + 1);
        resetFlippedState();
      } else {
        // No match, flip them back after a delay
        setTimeout(() => {
          setCards(prevCards => {
            return prevCards.map(card => {
              if (flippedCardIds.includes(card.id) && !card.isMatched) {
                return { ...card, isFlipped: false };
              }
              return card;
            });
          });
          resetFlippedState();
        }, 1000);
      }
    }
  }, [flippedCount, flippedIndexes]);

  // Reset flipped state
  const resetFlippedState = () => {
    setFlippedCount(0);
    setFlippedIndexes([]);
  };

  // Restart the game
  const restartGame = () => {
    const shuffledCards = [...cards]
      .map(card => ({ ...card, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
      
    setCards(shuffledCards);
    setFlippedCount(0);
    setFlippedIndexes([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameOver(false);
    setTimeLeft(60);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-center">Processing your reward...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Moves: {moves}</span>
          <span className="text-sm font-medium">Pairs: {matchedPairs}/8</span>
        </div>
        <div className="flex items-center">
          <TimerReset className="h-4 w-4 mr-1" />
          <span className={`text-sm font-medium ${timeLeft < 10 ? 'text-red-500' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      
      <Progress value={(timeLeft / 60) * 100} className="h-2 mb-4" />
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={`aspect-square cursor-pointer bg-gradient-to-br ${
              card.isMatched 
                ? 'from-green-100 to-green-200 border-green-300' 
                : card.isFlipped 
                  ? 'from-blue-100 to-blue-200 border-blue-300' 
                  : 'from-gray-100 to-gray-200 border-gray-300'
            } rounded-lg border-2 flex items-center justify-center shadow-sm`}
            onClick={() => !card.isFlipped && !card.isMatched && !gameOver ? flipCard(card.id) : null}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: card.isFlipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {(card.isFlipped || card.isMatched) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {card.icon}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {gameOver && (
        <div className="text-center">
          {matchedPairs === 8 ? (
            <div className="flex flex-col items-center">
              <Trophy className="h-10 w-10 text-amber-500 mb-2" />
              <p className="font-medium text-lg">Congratulations!</p>
              <p className="text-sm text-gray-600 mb-4">
                You completed the game in {moves} moves!
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="font-medium">Time's up!</p>
              <p className="text-sm text-gray-600">
                You matched {matchedPairs} out of 8 pairs.
              </p>
            </div>
          )}
          
          <Button onClick={restartGame} variant="outline" className="mr-2">
            Play Again
          </Button>
          <Button onClick={() => {
            setLoading(true);
            setTimeout(() => onComplete(), 1000);
          }}>
            Claim Reward
          </Button>
        </div>
      )}
    </div>
  );
}