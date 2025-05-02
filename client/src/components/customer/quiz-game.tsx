import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface QuizGameProps {
  onComplete: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function QuizGame({ onComplete }: QuizGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Sample quiz questions related to coffee and cafe culture
  const questions: Question[] = [
    {
      question: "Which coffee brewing method uses pressure to force hot water through finely-ground coffee?",
      options: ["French Press", "Pour Over", "Espresso", "Cold Brew"],
      correctAnswer: "Espresso"
    },
    {
      question: "What is the name for a coffee drink made with espresso and steamed milk?",
      options: ["Americano", "Latte", "Macchiato", "Cappuccino"],
      correctAnswer: "Latte"
    },
    {
      question: "Which country is known as the birthplace of coffee?",
      options: ["Brazil", "Colombia", "Italy", "Ethiopia"],
      correctAnswer: "Ethiopia"
    },
    {
      question: "Which of these coffee varieties is known for its lower caffeine content?",
      options: ["Robusta", "Arabica", "Liberica", "Excelsa"],
      correctAnswer: "Arabica"
    },
    {
      question: "What is the name of the foam that sits on top of an espresso?",
      options: ["Froth", "Crema", "Mousse", "Head"],
      correctAnswer: "Crema"
    }
  ];

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    // Check if the answer is correct
    const currentQuestionData = questions[currentQuestion];
    const isAnswerCorrect = selectedAnswer === currentQuestionData.correctAnswer;
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Move to the next question after a delay
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer("");
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setGameCompleted(true);
        setTimeout(() => {
          setLoading(true);
          setTimeout(() => {
            onComplete();
          }, 1500);
        }, 2000);
      }
    }, 1500);
  };

  // Calculate progress percentage
  const progressPercentage = (currentQuestion / questions.length) * 100;

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
        <div className="mb-6">
          <CheckCircle2 className={`h-16 w-16 mx-auto ${score >= 3 ? 'text-green-500' : 'text-amber-500'}`} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Quiz Completed!</h3>
        <p className="mb-4">Your Score: {score}/{questions.length}</p>
        <Card className="w-full max-w-sm">
          <CardContent className="p-4">
            <p className="text-center font-medium mb-2">
              {score >= 4 ? 'Excellent!' : score >= 3 ? 'Good job!' : 'Nice try!'}
            </p>
            <p className="text-center text-sm text-gray-600">
              {score >= 4 
                ? 'You\'re a coffee expert!' 
                : score >= 3 
                ? 'You know your coffee well!' 
                : 'Keep learning about coffee!'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <h3 className="text-lg font-semibold mb-4">{questions[currentQuestion].question}</h3>

      <RadioGroup 
        value={selectedAnswer} 
        onValueChange={handleAnswerSelection}
        className="mb-4 space-y-3"
      >
        {questions[currentQuestion].options.map((option, index) => (
          <div 
            key={index} 
            className={`flex items-center space-x-2 p-3 rounded-lg border ${
              showResult 
                ? option === questions[currentQuestion].correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : selectedAnswer === option
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <RadioGroupItem value={option} id={`option-${index}`} disabled={showResult} />
            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
              {option}
            </Label>
            {showResult && option === questions[currentQuestion].correctAnswer && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {showResult && selectedAnswer === option && option !== questions[currentQuestion].correctAnswer && (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        ))}
      </RadioGroup>

      <div className="mt-2">
        <Button 
          onClick={handleNextQuestion} 
          className="w-full"
          disabled={!selectedAnswer || showResult}
        >
          {showResult 
            ? isCorrect 
              ? 'Correct!' 
              : 'Incorrect!'
            : currentQuestion === questions.length - 1 
              ? 'Finish Quiz' 
              : 'Next Question'
          }
        </Button>
      </div>
    </div>
  );
}