import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import CustomerSidebar from "@/components/customer/sidebar";
import GameCard from "@/components/customer/game-card";
import SpinWheel from "@/components/customer/spin-wheel";
import ScratchCard from "@/components/customer/scratch-card";
import MemoryCardGame from "@/components/customer/memory-card-game";
import QuizGame from "@/components/customer/quiz-game";
import WordScrambleGame from "@/components/customer/word-scramble-game";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Gift } from "lucide-react";
import { Game, GamePrize } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CustomerGames() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>("spin_wheel");
  const [gamePrizes, setGamePrizes] = useState<GamePrize[]>([]);
  
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/customer/games"],
  });
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/customer/profile"],
  });
  
  // Query for game prizes when a game is selected
  const { data: prizes, isLoading: prizesLoading, refetch: refetchPrizes } = useQuery<GamePrize[]>({
    queryKey: ["/api/customer/games", activeGame?.id, "prizes"],
    queryFn: async () => {
      if (!activeGame) return [];
      const res = await apiRequest("GET", `/api/customer/games/${activeGame.id}/prizes`);
      return res.json();
    },
    enabled: !!activeGame, // Only run when activeGame is set
  });
  
  // Update gamePrizes state when prizes data changes
  useEffect(() => {
    if (prizes && prizes.length > 0) {
      setGamePrizes(prizes);
    }
  }, [prizes]);
  
  const playGameMutation = useMutation({
    mutationFn: async (gameId: number) => {
      const res = await apiRequest("POST", `/api/customer/games/${gameId}/play`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer/games"] });
      
      if (data.result === "win") {
        toast({
          title: "Congratulations!",
          description: `You won ${data.pointsWon} points!`,
          variant: "default",
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: "Keep playing to win rewards.",
          variant: "default",
        });
      }
      
      setIsPlaying(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Game play failed",
        description: error.message,
        variant: "destructive",
      });
      setIsPlaying(false);
    },
  });
  
  const handlePlayGame = (game: Game) => {
    setActiveGame(game);
    setSelectedGame(game.type);
    setIsPlaying(true);
  };
  
  const handleCompleteGame = () => {
    if (activeGame) {
      playGameMutation.mutate(activeGame.id);
    }
  };
  
  const handleCloseDialog = () => {
    setActiveGame(null);
    setIsPlaying(false);
  };
  
  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <CustomerSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  // Filter active games
  const activeGames = games?.filter(game => game.isActive) || [];
  
  // Sample game prizes for demonstration
  const samplePrizes: GamePrize[] = [
    { id: 1, gameId: 1, name: "10 Points", type: "points", value: 10, probability: 30 },
    { id: 2, gameId: 1, name: "20 Points", type: "points", value: 20, probability: 20 },
    { id: 3, gameId: 1, name: "50 Points", type: "points", value: 50, probability: 10 },
    { id: 4, gameId: 1, name: "Free Coffee", type: "reward", value: 0, probability: 5, rewardId: 1 },
    { id: 5, gameId: 1, name: "Try Again", type: "points", value: 0, probability: 35 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar />
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Games & Challenges</h1>
            <p className="text-gray-600">Play fun games to earn rewards</p>
          </div>
          <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
            <Trophy className="h-6 w-6 text-accent mr-3" />
            <div>
              <p className="text-sm text-gray-500">Your Points</p>
              <p className="text-xl font-bold">{profile?.points || 0}</p>
            </div>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Games</CardTitle>
            <CardDescription>Play daily to earn points and unlock rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {activeGames.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No games available at the moment.</p>
                <p className="text-gray-500">Check back later for exciting games and challenges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    onPlay={() => handlePlayGame(game)} 
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>How Games Work</CardTitle>
              <CardDescription>Learn how to play and win rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Daily Games</h3>
                    <p className="text-sm text-gray-600">
                      Each game can be played once daily. Come back every day for more chances to win!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Win Points</h3>
                    <p className="text-sm text-gray-600">
                      Games can award points or direct rewards. Points can be accumulated and redeemed for rewards of your choice.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Instant Rewards</h3>
                    <p className="text-sm text-gray-600">
                      Some games may give you instant rewards like free drinks or discounts. These will appear in your rewards section.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top players this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Rahul S.</p>
                      <p className="text-xs text-gray-500">Played 24 games</p>
                    </div>
                  </div>
                  <Badge className="bg-primary">780 pts</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold mr-3">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Priya M.</p>
                      <p className="text-xs text-gray-500">Played 20 games</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-secondary">650 pts</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-dark font-bold mr-3">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Amit K.</p>
                      <p className="text-xs text-gray-500">Played 18 games</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-accent">540 pts</Badge>
                </div>
                
                {user?.username === "customer1" && (
                  <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold mr-3">
                        12
                      </div>
                      <div>
                        <p className="font-medium">You</p>
                        <p className="text-xs text-gray-500">Played 8 games</p>
                      </div>
                    </div>
                    <Badge variant="outline">{profile?.points || 0} pts</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isPlaying} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeGame?.name || "Play Game"}</DialogTitle>
            <DialogDescription>
              {activeGame?.description || "Try your luck and win rewards!"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedGame === "spin_wheel" && (
              <SpinWheel prizes={samplePrizes} onComplete={handleCompleteGame} />
            )}
            
            {selectedGame === "scratch_card" && (
              <ScratchCard onComplete={handleCompleteGame} />
            )}
            
            {selectedGame === "quiz" && (
              <QuizGame onComplete={handleCompleteGame} />
            )}
            
            {selectedGame === "memory_card" && (
              <MemoryCardGame onComplete={handleCompleteGame} />
            )}
            
            {selectedGame === "word_scramble" && (
              <WordScrambleGame onComplete={handleCompleteGame} />
            )}
            
            {selectedGame === "coffee_quiz" && (
              <QuizGame onComplete={handleCompleteGame} />
            )}
          </div>
          
          {playGameMutation.isPending && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Processing your game...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
