import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Coffee, Gift, Star, Trophy, Heart, Cake, PizzaIcon, IceCream, Candy } from "lucide-react";

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
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Define the icons for the memory game
  const icons = [
    <Coffee className="h-8 w-8" />,
    <Gift className="h-8 w-8" />,
    <Star className="h-8 w-8" />,
    <Trophy className="h-8 w-8" />,
    <Heart className="h-8 w-8" />,
    <Cake className="h-8 w-8" />,
    <PizzaIcon className="h-8 w-8" />,
    <IceCream className="h-8 w-8" />,
  ];

  // Initialize the game
  const initializeGame = () => {
    // Create pairs of cards with the same icon
    const cardPairs = icons.map((icon, index) => [
      { id: index * 2, icon, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, icon, isFlipped: false, isMatched: false },
    ]).flat();

    // Shuffle the cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(true);
    setGameCompleted(false);
  };

  // Handle card click
  const handleCardClick = (id: number) => {
    // Don't allow more than 2 cards to be flipped at once
    if (flippedCards.length === 2) return;
    
    // Don't allow clicking on already matched or flipped cards
    const clickedCard = cards.find(card => card.id === id);
    if (!clickedCard || clickedCard.isMatched || flippedCards.includes(id)) return;
    
    // Flip the card
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    // Update the cards state
    const newCards = cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find(card => card.id === firstId);
      const secondCard = newCards.find(card => card.id === secondId);
      
      // Check if the icons match
      if (firstCard && secondCard && 
          firstCard.icon.type === secondCard.icon.type) {
        // Mark the cards as matched
        const updatedCards = newCards.map(card => 
          card.id === firstId || card.id === secondId 
            ? { ...card, isMatched: true } 
            : card
        );
        setCards(updatedCards);
        setFlippedCards([]);
        setMatchedPairs(prev => prev + 1);
        
        // Check if all pairs are matched
        if (matchedPairs + 1 === icons.length) {
          setGameCompleted(true);
          setTimeout(() => {
            setLoading(true);
            setTimeout(() => {
              onComplete();
            }, 1500);
          }, 1000);
        }
      } else {
        // If no match, flip the cards back after a delay
        setTimeout(() => {
          setCards(newCards.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Auto-start the game on component mount
  useEffect(() => {
    initializeGame();
  }, []);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <h3 className="text-xl font-semibold text-center">Memory Card Game</h3>
        <p className="text-center text-gray-600">
          Match all pairs of cards to win points!
        </p>
        <Button onClick={initializeGame} className="mt-4">
          Start Game
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-center">Processing your reward...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex justify-between w-full mb-4">
        <div className="bg-primary/10 px-3 py-1 rounded-full">
          <span className="font-medium">Moves: {moves}</span>
        </div>
        <div className="bg-primary/10 px-3 py-1 rounded-full">
          <span className="font-medium">Pairs: {matchedPairs}/{icons.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-16 h-16 cursor-pointer flex items-center justify-center rounded-lg transition-all duration-300 ${
              card.isFlipped
                ? card.isMatched
                  ? "bg-green-100 text-green-600"
                  : "bg-primary text-white"
                : "bg-gray-100"
            } ${card.isMatched ? "cursor-default" : ""}`}
          >
            {card.isFlipped ? card.icon : null}
          </div>
        ))}
      </div>

      {gameCompleted && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-semibold text-green-600 mb-2">Congratulations!</h3>
          <p>You've matched all pairs in {moves} moves!</p>
        </div>
      )}
    </div>
  );
}