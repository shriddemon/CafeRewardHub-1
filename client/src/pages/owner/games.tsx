import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import OwnerSidebar from "@/components/owner/sidebar";
import { Game } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Award,
  Target,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Game form schema
const gameFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["spin_wheel", "scratch_card", "quiz"]),
  isActive: z.boolean().default(true),
  maxPlaysPerDay: z.coerce.number().min(1, "Must allow at least 1 play per day").max(10, "Maximum 10 plays per day"),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

// Prize form schema
const prizeFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["points", "reward"]),
  value: z.coerce.number().min(1, "Value must be at least 1"),
  probability: z.coerce.number().min(1, "Probability must be at least 1%").max(100, "Probability cannot exceed 100%"),
  rewardId: z.union([z.coerce.number().optional(), z.literal("")]).optional(),
});

type PrizeFormValues = z.infer<typeof prizeFormSchema>;

// Game Card Component
interface GameCardProps {
  game: Game;
  onToggleActive: (id: number, isActive: boolean) => void;
  onEdit: (game: Game) => void;
  onDelete: (id: number) => void;
  onManagePrizes: (game: Game) => void;
}

function GameCard({ game, onToggleActive, onEdit, onDelete, onManagePrizes }: GameCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{game.name}</CardTitle>
            <CardDescription className="mt-1">{game.type === "spin_wheel" ? "Spin Wheel" : game.type === "scratch_card" ? "Scratch Card" : "Quiz"}</CardDescription>
          </div>
          <Badge variant={game.isActive ? "default" : "secondary"}>
            {game.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 mb-4">{game.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Max Plays: <strong>{game.maxPlaysPerDay}/day</strong></span>
          <span>Created: <strong>{new Date(game.createdAt).toLocaleDateString()}</strong></span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 pb-2">
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center px-2"
            onClick={() => onToggleActive(game.id, !game.isActive)}
          >
            {game.isActive ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
            {game.isActive ? "Disable" : "Enable"}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center px-2" 
            onClick={() => onEdit(game)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center px-2"
            onClick={() => onManagePrizes(game)}
          >
            <Award className="h-4 w-4 mr-1" /> Prizes
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center px-2"
            onClick={() => onDelete(game.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Main component
export default function OwnerGames() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  
  // Game form
  const gameForm = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "spin_wheel",
      isActive: true,
      maxPlaysPerDay: 1,
    },
  });
  
  // Prize form
  const prizeForm = useForm<PrizeFormValues>({
    resolver: zodResolver(prizeFormSchema),
    defaultValues: {
      name: "",
      type: "points",
      value: 10,
      probability: 10,
      rewardId: "",
    },
  });
  
  // Fetch games
  const {
    data: games = [],
    isLoading: isLoadingGames,
    error: gamesError,
  } = useQuery({
    queryKey: ["/api/owner/games"],
    queryFn: () => apiRequest("GET", "/api/owner/games").then(res => res.json()),
    enabled: !!user && user.role === "owner",
  });
  
  // Fetch rewards for prize mapping
  const {
    data: rewards = [],
    isLoading: isLoadingRewards,
  } = useQuery({
    queryKey: ["/api/owner/rewards"],
    queryFn: () => apiRequest("GET", "/api/owner/rewards").then(res => res.json()),
    enabled: !!user && user.role === "owner",
  });
  
  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: (data: GameFormValues) => 
      apiRequest("POST", "/api/owner/games", data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/games"] });
      toast({
        title: "Game created successfully",
        description: "Your new game has been added to your cafe",
      });
      setIsGameDialogOpen(false);
      gameForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create game",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update game mutation
  const updateGameMutation = useMutation({
    mutationFn: (data: { id: number, gameData: Partial<GameFormValues> }) => 
      apiRequest("PATCH", `/api/owner/games/${data.id}`, data.gameData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/games"] });
      toast({
        title: "Game updated successfully",
        description: "Your game has been updated",
      });
      setIsGameDialogOpen(false);
      setCurrentGame(null);
      gameForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update game",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Toggle game active status
  const toggleGameActiveMutation = useMutation({
    mutationFn: (data: { id: number, isActive: boolean }) => 
      apiRequest("PATCH", `/api/owner/games/${data.id}`, { isActive: data.isActive }).then(res => res.json()),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/games"] });
      toast({
        title: `Game ${variables.isActive ? "activated" : "deactivated"}`,
        description: `The game is now ${variables.isActive ? "available" : "unavailable"} to your customers`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update game status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/owner/games/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/games"] });
      toast({
        title: "Game deleted",
        description: "The game has been permanently removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete game",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add prize mutation
  const addPrizeMutation = useMutation({
    mutationFn: (data: PrizeFormValues & { gameId: number }) => 
      apiRequest("POST", `/api/owner/games/${data.gameId}/prizes`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/games"] });
      toast({
        title: "Prize added successfully",
        description: "The prize has been added to the game",
      });
      prizeForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add prize",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle game form submission
  const onGameSubmit = (data: GameFormValues) => {
    if (currentGame) {
      updateGameMutation.mutate({ 
        id: currentGame.id, 
        gameData: data 
      });
    } else {
      createGameMutation.mutate(data);
    }
  };
  
  // Handle prize form submission
  const onPrizeSubmit = (data: PrizeFormValues) => {
    if (currentGame) {
      addPrizeMutation.mutate({
        ...data,
        gameId: currentGame.id,
        rewardId: data.type === "reward" && data.rewardId ? Number(data.rewardId) : undefined,
      });
    }
  };
  
  // Handle edit game
  const handleEditGame = (game: Game) => {
    setCurrentGame(game);
    gameForm.reset({
      name: game.name,
      description: game.description,
      type: game.type as "spin_wheel" | "scratch_card" | "quiz",
      isActive: game.isActive,
      maxPlaysPerDay: game.maxPlaysPerDay,
    });
    setIsGameDialogOpen(true);
  };
  
  // Handle manage prizes
  const handleManagePrizes = (game: Game) => {
    setCurrentGame(game);
    prizeForm.reset({
      name: "",
      type: "points",
      value: 10,
      probability: 10,
      rewardId: "",
    });
    setIsPrizeDialogOpen(true);
  };
  
  // Handle delete game with confirmation
  const handleDeleteGame = (id: number) => {
    if (window.confirm("Are you sure you want to delete this game? This action cannot be undone.")) {
      deleteGameMutation.mutate(id);
    }
  };
  
  // Filter games based on active tab
  const filteredGames = games.filter(game => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return game.isActive;
    if (activeTab === "inactive") return !game.isActive;
    if (activeTab === "spin_wheel") return game.type === "spin_wheel";
    if (activeTab === "scratch_card") return game.type === "scratch_card";
    if (activeTab === "quiz") return game.type === "quiz";
    return true;
  });
  
  // Loading state
  if (isLoadingGames) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <OwnerSidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (gamesError) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <OwnerSidebar />
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load games</h3>
              <p className="text-red-600">{(gamesError as Error).message}</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/owner/games"] })}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Games Management</h1>
                <p className="text-gray-600 mt-1">
                  Create and manage gamification elements for your loyalty program
                </p>
              </div>
              
              <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Game
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>{currentGame ? "Edit Game" : "Create New Game"}</DialogTitle>
                    <DialogDescription>
                      {currentGame 
                        ? "Update the details of your existing game." 
                        : "Add a new game to engage your customers and reward them."}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...gameForm}>
                    <form onSubmit={gameForm.handleSubmit(onGameSubmit)} className="space-y-6 py-4">
                      <FormField
                        control={gameForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Game Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Spin & Win" {...field} />
                            </FormControl>
                            <FormDescription>
                              A catchy name that will appear to your customers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={gameForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Spin the wheel for a chance to win points and rewards!" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Explain how the game works to your customers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={gameForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Game Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!!currentGame} // Can't change type if editing
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a game type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="spin_wheel">Spin Wheel</SelectItem>
                                  <SelectItem value="scratch_card">Scratch Card</SelectItem>
                                  <SelectItem value="quiz">Quiz Game</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Type determines game's appearance and mechanics
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={gameForm.control}
                          name="maxPlaysPerDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Plays Per Day</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  max={10} 
                                  {...field} 
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "1" : e.target.value;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Limit daily plays per customer
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={gameForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Status</FormLabel>
                              <FormDescription>
                                Enable or disable this game for your customers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsGameDialogOpen(false);
                            setCurrentGame(null);
                            gameForm.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createGameMutation.isPending || updateGameMutation.isPending}
                        >
                          {(createGameMutation.isPending || updateGameMutation.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {currentGame ? "Update Game" : "Create Game"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          
          {/* Tabs for filtering */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Games</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="spin_wheel">Spin Wheel</TabsTrigger>
              <TabsTrigger value="scratch_card">Scratch Card</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            
            {/* Game list */}
            <TabsContent value={activeTab} className="mt-0">
              {filteredGames.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-white">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  
                  <h3 className="text-lg font-medium mb-2">No games found</h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === "all" 
                      ? "You haven't created any games yet. Create your first game to engage your customers!"
                      : `No ${activeTab === "active" ? "active" : activeTab === "inactive" ? "inactive" : activeTab} games found.`
                    }
                  </p>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setCurrentGame(null);
                      gameForm.reset();
                      setIsGameDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Game
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onToggleActive={(id, isActive) => 
                        toggleGameActiveMutation.mutate({ id, isActive })
                      }
                      onEdit={handleEditGame}
                      onDelete={handleDeleteGame}
                      onManagePrizes={handleManagePrizes}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Prize Management Dialog */}
          <Dialog open={isPrizeDialogOpen} onOpenChange={setIsPrizeDialogOpen}>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Manage Prizes for {currentGame?.name}</DialogTitle>
                <DialogDescription>
                  Configure what your customers can win when playing this game
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <h3 className="text-lg font-medium mb-4">Current Prizes</h3>
                
                {/* Prize list table */}
                <div className="border rounded-md overflow-hidden mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prize Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Probability</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentGame?.prizes?.length > 0 ? (
                        currentGame.prizes.map((prize) => (
                          <TableRow key={prize.id}>
                            <TableCell>{prize.name}</TableCell>
                            <TableCell>
                              <Badge variant={prize.type === "points" ? "default" : "secondary"}>
                                {prize.type === "points" ? "Points" : "Reward"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {prize.type === "points" ? `${prize.value} pts` : `Reward: ${prize.value}`}
                            </TableCell>
                            <TableCell>{prize.probability}%</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  // Implement edit prize
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2 text-red-500 hover:text-red-700"
                                onClick={() => {
                                  // Implement delete prize
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            No prizes configured for this game yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Add New Prize</h3>
                  
                  <Form {...prizeForm}>
                    <form onSubmit={prizeForm.handleSubmit(onPrizeSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={prizeForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prize Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Big Win" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={prizeForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prize Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select prize type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="points">Points</SelectItem>
                                  <SelectItem value="reward">Reward</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={prizeForm.control}
                          name="value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {prizeForm.watch("type") === "points" ? "Points Value" : "Reward Value"}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  {...field} 
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "1" : e.target.value;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                {prizeForm.watch("type") === "points" 
                                  ? "Number of points awarded" 
                                  : "Value of the reward"
                                }
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={prizeForm.control}
                          name="probability"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Win Probability (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  max={100}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "1" : e.target.value;
                                    field.onChange(value);
                                  }} 
                                />
                              </FormControl>
                              <FormDescription>
                                Chance of winning this prize (1-100%)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {prizeForm.watch("type") === "reward" && (
                        <FormField
                          control={prizeForm.control}
                          name="rewardId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Reward</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value?.toString() || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a reward" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingRewards ? (
                                    <div className="flex items-center justify-center py-2">
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Loading rewards...
                                    </div>
                                  ) : rewards.length === 0 ? (
                                    <div className="p-2 text-center text-sm">
                                      No rewards available. Create rewards first.
                                    </div>
                                  ) : (
                                    rewards.map((reward) => (
                                      <SelectItem key={reward.id} value={reward.id.toString()}>
                                        {reward.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Link this prize to an existing reward
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <DialogFooter className="pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsPrizeDialogOpen(false);
                            setCurrentGame(null);
                            prizeForm.reset();
                          }}
                        >
                          Close
                        </Button>
                        <Button 
                          type="submit"
                          disabled={addPrizeMutation.isPending}
                        >
                          {addPrizeMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Add Prize
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Tips and Best Practices */}
          <div className="mt-12 bg-white border rounded-lg p-6">
            <div className="flex items-start">
              <Zap className="h-8 w-8 text-amber-500 mr-4 mt-1" />
              <div>
                <h3 className="text-lg font-medium mb-2">Tips for Effective Gamification</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <ChevronDown className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Balance probability carefully: Make winning possible but not too easy</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronDown className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Set daily play limits to encourage regular visits</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronDown className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Create a mix of point-based prizes and special rewards</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronDown className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Rotate or update games periodically to maintain customer interest</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}