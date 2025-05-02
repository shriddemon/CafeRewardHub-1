import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, CheckCircle2, Clock3 } from "lucide-react";

interface WordScrambleGameProps {
  onComplete: () => void;
}

interface Word {
  original: string;
  scrambled: string;
  hint: string;
}

export default function WordScrambleGame({ onComplete }: WordScrambleGameProps) {
  const [words, setWords] = useState<Word[]>([
    { original: "espresso", scrambled: "", hint: "Strong coffee made by forcing hot water through ground coffee beans" },
    { original: "cappuccino", scrambled: "", hint: "Coffee with steamed milk and foam" },
    { original: "latte", scrambled: "", hint: "Coffee made with espresso and steamed milk" },
    { original: "mocha", scrambled: "", hint: "Coffee with chocolate flavor" },
    { original: "americano", scrambled: "", hint: "Espresso diluted with hot water" }
  ]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [correctGuess, setCorrectGuess] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const [score, setScore] = useState<number>(0);

  // Scramble a word
  const scrambleWord = (word: string): string => {
    const letters = word.split("");
    let shuffled = "";
    
    // Keep shuffling until we get a different arrangement
    do {
      shuffled = letters
        .sort(() => Math.random() - 0.5)
        .join("");
    } while (shuffled === word);
    
    return shuffled;
  };

  // Initialize the game
  useEffect(() => {
    // Scramble all words at the start
    const scrambledWords = words.map(word => ({
      ...word,
      scrambled: scrambleWord(word.original)
    }));
    setWords(scrambledWords);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && !correctGuess && !gameCompleted) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !correctGuess && !gameCompleted) {
      // If time's up, move to the next word
      moveToNextWord();
    }
  }, [timer, correctGuess, gameCompleted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value.toLowerCase());
  };

  const checkAnswer = () => {
    setAttempts(prev => prev + 1);
    
    if (userInput.toLowerCase() === words[currentWordIndex].original.toLowerCase()) {
      setCorrectGuess(true);
      setScore(prev => prev + 1);
      setTimeout(() => {
        moveToNextWord();
      }, 1500);
    } else if (attempts >= 2) {
      // After 3 attempts, show hint
      setShowHint(true);
    }
  };

  const moveToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setUserInput("");
      setAttempts(0);
      setShowHint(false);
      setCorrectGuess(false);
      setTimer(30);
    } else {
      // Game completed
      setGameCompleted(true);
      setTimeout(() => {
        setLoading(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 2000);
    }
  };

  const skipWord = () => {
    moveToNextWord();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-center">Processing your reward...</p>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Game Completed!</h3>
        <p className="mb-4">Your Score: {score}/{words.length}</p>
        <p>You unscrambled {score} out of {words.length} words!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline">
          Word {currentWordIndex + 1}/{words.length}
        </Badge>
        <Badge variant="outline" className="flex items-center">
          <Clock3 className="h-3 w-3 mr-1" />
          {timer}s
        </Badge>
      </div>

      <div className="mb-4">
        <Progress value={(timer / 30) * 100} className="h-2" />
      </div>

      <div className="flex flex-col items-center mb-6">
        <h3 className="text-2xl font-bold mb-4 tracking-wide">
          {words[currentWordIndex].scrambled}
        </h3>
        
        {showHint && (
          <div className="bg-blue-50 p-3 rounded-lg w-full mb-4">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Hint:</span> {words[currentWordIndex].hint}
            </p>
          </div>
        )}
        
        <div className="w-full space-y-4">
          <div className="flex space-x-2">
            <Input
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type your answer..."
              className={`flex-1 ${correctGuess ? 'border-green-500 bg-green-50' : ''}`}
              disabled={correctGuess}
            />
            <Button
              onClick={checkAnswer}
              disabled={!userInput || correctGuess}
            >
              {correctGuess ? 'Correct!' : 'Check'}
            </Button>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHint(true)}
              disabled={showHint || correctGuess}
            >
              Show Hint
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={skipWord}
              disabled={correctGuess}
            >
              Skip Word
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}