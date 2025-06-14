import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface OnboardingFlowProps {
  familyData?: any;
}

export function OnboardingFlow({ familyData }: OnboardingFlowProps) {
  const [step, setStep] = useState(familyData ? 2 : 1);
  const [familyName, setFamilyName] = useState("");
  const [familyMembers, setFamilyMembers] = useState([
    { name: "", role: "admin" as const }
  ]);
  const [preferences, setPreferences] = useState({
    calorieGoal: 2000,
    healthGoals: [] as string[],
    cuisines: [] as string[],
    dietaryRestrictions: [] as string[],
    favoriteIngredients: [] as string[],
    dislikedIngredients: [] as string[],
    mealPrepTime: "moderate" as const,
  });

  const createFamily = useMutation(api.families.createFamily);
  const addFamilyMember = useMutation(api.families.addFamilyMember);
  const updatePreferences = useMutation(api.families.updateMemberPreferences);
  const seedRecipes = useMutation(api.recipes.seedRecipes);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      toast.error("Please enter a family name");
      return;
    }

    try {
      await createFamily({ name: familyName });
      await seedRecipes({});
      toast.success("Family created successfully!");
      setStep(2);
    } catch (error) {
      toast.error("Failed to create family");
    }
  };

  const handleSavePreferences = async () => {
    if (!familyData?.member) {
      toast.error("No family member found");
      return;
    }

    try {
      await updatePreferences({
        memberId: familyData.member._id,
        calorieGoal: preferences.calorieGoal,
        healthGoals: preferences.healthGoals,
        preferences: {
          cuisines: preferences.cuisines,
          dietaryRestrictions: preferences.dietaryRestrictions,
          favoriteIngredients: preferences.favoriteIngredients,
          dislikedIngredients: preferences.dislikedIngredients,
          mealPrepTime: preferences.mealPrepTime,
        },
      });
      toast.success("Preferences saved successfully!");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">Welcome! Let's set up your family</h1>
            <p className="text-white/70 text-lg">First, let's create your family group</p>
          </div>

          <div className="glass p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Family Name
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="The Smith Family"
                className="w-full glass-input px-4 py-3 text-white placeholder-white/50"
              />
            </div>

            <button
              onClick={handleCreateFamily}
              className="w-full glass-button py-4 text-white font-medium text-lg"
            >
              Create Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Tell us about your preferences</h1>
          <p className="text-white/70 text-lg">This helps us create personalized meal plans for your family</p>
        </div>

        <div className="glass p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calorie Goal */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Daily Calorie Goal
              </label>
              <input
                type="number"
                value={preferences.calorieGoal}
                onChange={(e) => setPreferences(prev => ({ ...prev, calorieGoal: parseInt(e.target.value) || 2000 }))}
                className="w-full glass-input px-4 py-3 text-white"
              />
            </div>

            {/* Meal Prep Time */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Preferred Meal Prep Time
              </label>
              <select
                value={preferences.mealPrepTime}
                onChange={(e) => setPreferences(prev => ({ ...prev, mealPrepTime: e.target.value as any }))}
                className="w-full glass-input px-4 py-3 text-white"
              >
                <option value="quick">Quick (15-20 minutes)</option>
                <option value="moderate">Moderate (30-45 minutes)</option>
                <option value="long">Long (1+ hours)</option>
              </select>
            </div>
          </div>

          {/* Health Goals */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-4">
              Health Goals (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Weight Loss", "Muscle Gain", "Heart Health", "Lower Cholesterol", "Diabetes Management", "General Wellness"].map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleArrayItem(preferences.healthGoals, goal, (arr) => setPreferences(prev => ({ ...prev, healthGoals: arr })))}
                  className={`px-4 py-3 rounded-xl text-sm transition-all ${
                    preferences.healthGoals.includes(goal)
                      ? "glass-button bg-white/20 text-white"
                      : "glass-card text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisines */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-4">
              Favorite Cuisines
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["American", "Italian", "Mexican", "Asian", "Mediterranean", "Indian", "Thai", "French"].map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => toggleArrayItem(preferences.cuisines, cuisine, (arr) => setPreferences(prev => ({ ...prev, cuisines: arr })))}
                  className={`px-4 py-3 rounded-xl text-sm transition-all ${
                    preferences.cuisines.includes(cuisine)
                      ? "glass-button bg-green-500/30 text-white border-green-400/50"
                      : "glass-card text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-4">
              Dietary Restrictions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb", "Paleo", "Nut-Free"].map(restriction => (
                <button
                  key={restriction}
                  onClick={() => toggleArrayItem(preferences.dietaryRestrictions, restriction, (arr) => setPreferences(prev => ({ ...prev, dietaryRestrictions: arr })))}
                  className={`px-4 py-3 rounded-xl text-sm transition-all ${
                    preferences.dietaryRestrictions.includes(restriction)
                      ? "glass-button bg-red-500/30 text-white border-red-400/50"
                      : "glass-card text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Ingredients */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-4">
              Favorite Ingredients
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Chicken", "Salmon", "Beef", "Tofu", "Quinoa", "Rice", "Pasta", "Avocado", "Spinach", "Broccoli", "Sweet Potato", "Beans"].map(ingredient => (
                <button
                  key={ingredient}
                  onClick={() => toggleArrayItem(preferences.favoriteIngredients, ingredient, (arr) => setPreferences(prev => ({ ...prev, favoriteIngredients: arr })))}
                  className={`px-4 py-3 rounded-xl text-sm transition-all ${
                    preferences.favoriteIngredients.includes(ingredient)
                      ? "glass-button bg-green-500/30 text-white border-green-400/50"
                      : "glass-card text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </div>

          {/* Disliked Ingredients */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-4">
              Disliked Ingredients
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Mushrooms", "Onions", "Cilantro", "Olives", "Seafood", "Spicy Food", "Coconut", "Eggplant"].map(ingredient => (
                <button
                  key={ingredient}
                  onClick={() => toggleArrayItem(preferences.dislikedIngredients, ingredient, (arr) => setPreferences(prev => ({ ...prev, dislikedIngredients: arr })))}
                  className={`px-4 py-3 rounded-xl text-sm transition-all ${
                    preferences.dislikedIngredients.includes(ingredient)
                      ? "glass-button bg-red-500/30 text-white border-red-400/50"
                      : "glass-card text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSavePreferences}
            className="w-full glass-button py-4 text-white font-medium text-lg"
          >
            Save Preferences & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
