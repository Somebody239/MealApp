import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface HomeTabProps {
  familyData: any;
}

export function HomeTab({ familyData }: HomeTabProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const mealPlan = useQuery(api.mealPlans.getMealPlan, { date: selectedDate });
  const recipes = useQuery(api.recipes.getAllRecipes);
  const addMealToPlan = useMutation(api.mealPlans.addMealToPlan);
  const removeMealFromPlan = useMutation(api.mealPlans.removeMealFromPlan);
  const generateAIMealPlan = useAction(api.mealPlans.generateAIMealPlan);

  const handleAddMeal = (mealType: "breakfast" | "lunch" | "dinner") => {
    setSelectedMealType(mealType);
    setShowRecipeModal(true);
  };

  const handleSelectRecipe = async (recipeId: string) => {
    if (!selectedMealType) return;

    try {
      await addMealToPlan({
        date: selectedDate,
        mealType: selectedMealType,
        recipeId: recipeId as any,
      });
      toast.success("Meal added to plan!");
      setShowRecipeModal(false);
      setSelectedMealType(null);
    } catch (error) {
      toast.error("Failed to add meal");
    }
  };

  const handleRemoveMeal = async (mealType: "breakfast" | "lunch" | "dinner") => {
    try {
      await removeMealFromPlan({
        date: selectedDate,
        mealType,
      });
      toast.success("Meal removed from plan!");
    } catch (error) {
      toast.error("Failed to remove meal");
    }
  };

  const handleGenerateAIMealPlan = async () => {
    try {
      const startDate = getMonday(new Date(selectedDate));
      await generateAIMealPlan({
        startDate: startDate.toISOString().split('T')[0],
      });
      toast.success("AI meal plan generated!");
    } catch (error) {
      toast.error("Failed to generate AI meal plan");
    }
  };

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      default:
        return '🍽️';
    }
  };

  const getNextMeal = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < 10) return 'breakfast';
    if (currentHour < 15) return 'lunch';
    return 'dinner';
  };

  const getMealDisplay = (mealType: "breakfast" | "lunch" | "dinner") => {
    const meal = mealPlan?.meals[mealType];
    if (!meal || !meal.recipe) {
      return {
        isEmpty: true,
        name: `Add ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
        calories: 0,
      };
    }
    return {
      isEmpty: false,
      name: meal.recipe.name,
      calories: meal.recipe.nutrition.calories,
      recipe: meal.recipe,
    };
  };

  if (mealPlan === undefined || recipes === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="glass p-6 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-white/60 mx-auto"></div>
          <p className="text-white/80 mt-3 text-center">Loading meals...</p>
        </div>
      </div>
    );
  }

  const nextMeal = getNextMeal();
  const nextMealData = getMealDisplay(nextMeal);

  return (
    <div className="p-4 space-y-6">
      {/* Date and Time */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">{formatDate(selectedDate)}</h1>
        <p className="text-white/60">{formatTime()}</p>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="glass-input px-3 py-2 text-white text-sm mt-2"
        />
      </div>

      {/* Next Meal */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Next: {nextMeal.charAt(0).toUpperCase() + nextMeal.slice(1)}</h2>
          <span className="text-2xl">{getMealIcon(nextMeal)}</span>
        </div>
        
        {nextMealData.isEmpty ? (
          <button
            onClick={() => handleAddMeal(nextMeal)}
            className="w-full flex items-center justify-center gap-3 py-4 border border-dashed border-white/30 rounded-lg hover:border-white/50 hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-white/60">Add meal</span>
          </button>
        ) : (
          <button
            onClick={() => setSelectedRecipe(nextMealData.recipe)}
            className="w-full text-left p-3 glass-card hover:bg-white/10 transition-all rounded-lg"
          >
            <h3 className="font-semibold text-white">{nextMealData.name}</h3>
            <p className="text-white/60 text-sm">{nextMealData.calories} calories</p>
          </button>
        )}
      </div>

      {/* All Meals - Compact Icons */}
      <div className="grid grid-cols-3 gap-3">
        {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
          const meal = getMealDisplay(mealType);
          return (
            <button
              key={mealType}
              onClick={() => meal.isEmpty ? handleAddMeal(mealType) : setSelectedRecipe(meal.recipe)}
              className="glass-card p-4 text-center hover:bg-white/10 transition-all"
            >
              <div className="text-3xl mb-2">{getMealIcon(mealType)}</div>
              <div className="text-sm font-medium text-white capitalize mb-1">{mealType}</div>
              {meal.isEmpty ? (
                <div className="text-xs text-white/50">Not planned</div>
              ) : (
                <div className="text-xs text-white/70 truncate">{meal.name}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Generate Button */}
      <button
        onClick={handleGenerateAIMealPlan}
        className="w-full glass-button py-3 text-white font-medium flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generate AI Meal Plan
      </button>

      {/* Recipe Selection Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 z-50">
          <div className="glass w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl">
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Choose {selectedMealType}
                </h3>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="glass-button p-2 text-white/80 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-3 overflow-y-auto max-h-96">
              <div className="space-y-2">
                {recipes?.map((recipe) => (
                  <button
                    key={recipe._id}
                    onClick={() => handleSelectRecipe(recipe._id)}
                    className="w-full text-left p-3 glass-card hover:bg-white/10 transition-all rounded-lg"
                  >
                    <h4 className="font-semibold text-white text-sm">{recipe.name}</h4>
                    <p className="text-xs text-white/60 mt-1">{recipe.nutrition.calories} cal • {recipe.prepTime}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl">
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">{selectedRecipe.name}</h3>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="glass-button p-2 text-white/80 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh] space-y-4">
              <p className="text-white/80">{selectedRecipe.description}</p>
              
              <div className="grid grid-cols-4 gap-3 text-center text-sm">
                <div className="metric-card p-2">
                  <div className="font-semibold text-white">{selectedRecipe.nutrition.calories}</div>
                  <div className="text-white/60 text-xs">Calories</div>
                </div>
                <div className="metric-card p-2">
                  <div className="font-semibold text-white">{selectedRecipe.nutrition.protein}g</div>
                  <div className="text-white/60 text-xs">Protein</div>
                </div>
                <div className="metric-card p-2">
                  <div className="font-semibold text-white">{selectedRecipe.nutrition.carbs}g</div>
                  <div className="text-white/60 text-xs">Carbs</div>
                </div>
                <div className="metric-card p-2">
                  <div className="font-semibold text-white">{selectedRecipe.nutrition.fat}g</div>
                  <div className="text-white/60 text-xs">Fat</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Ingredients</h4>
                <div className="space-y-1">
                  {selectedRecipe.ingredients.map((ingredient: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-white/80">{ingredient.name}</span>
                      <span className="text-white/60">{ingredient.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Instructions</h4>
                <div className="space-y-2">
                  {selectedRecipe.instructions.map((instruction: string, index: number) => (
                    <div key={index} className="flex gap-3 text-sm">
                      <span className="text-white/60 font-medium">{index + 1}.</span>
                      <span className="text-white/80">{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedRecipe.dietaryTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 glass-card text-white/80 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
