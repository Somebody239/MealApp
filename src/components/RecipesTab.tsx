import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function RecipesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const recipes = useQuery(api.recipes.searchRecipes, {
    searchTerm: searchTerm || undefined,
    cuisineType: selectedCuisine || undefined,
    dietaryTags: selectedDietaryTags.length > 0 ? selectedDietaryTags : undefined,
  });

  const toggleDietaryTag = (tag: string) => {
    setSelectedDietaryTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (recipes === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="glass p-6 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-white/60 mx-auto"></div>
          <p className="text-white/80 mt-3 text-center">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="glass p-6">
        <h1 className="text-3xl font-bold gradient-text mb-6">Recipe Library</h1>
        
        {/* Search and Filter Toggle */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input px-4 py-3 text-white placeholder-white/50"
          />
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="glass-button flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {(selectedCuisine || selectedDietaryTags.length > 0) && (
              <span className="glass-card px-2 py-1 text-xs text-white rounded-full">
                {(selectedCuisine ? 1 : 0) + selectedDietaryTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="glass-card p-6 mt-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Cuisine Type
              </label>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full glass-input px-4 py-3 text-white"
              >
                <option value="">All Cuisines</option>
                <option value="American">American</option>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Asian">Asian</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Indian">Indian</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Dietary Preferences
              </label>
              <div className="flex flex-wrap gap-3">
                {["vegetarian", "vegan", "gluten-free", "high-protein", "low-carb", "keto-friendly"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleDietaryTag(tag)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      selectedDietaryTags.includes(tag)
                        ? "glass-button bg-white/20 text-white"
                        : "glass-card text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Grid */}
      <div className="space-y-6">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="glass-card overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center border-b border-white/10">
              <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v-2A2 2 0 0014 6v1a2 2 0 00-2 1.5zM9 11H7a2 2 0 00-2 2v1a2 2 0 002 2h2m-2-3h2m0 0h2a2 2 0 012 2v1a2 2 0 01-2 2h-2m0-3v3" />
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-3">{recipe.name}</h3>
              <p className="text-white/70 mb-4 line-clamp-2">{recipe.description}</p>
              
              <div className="flex items-center justify-between mb-4 text-sm text-white/60">
                <span>{recipe.nutrition.calories} cal</span>
                <span className="capitalize">{recipe.prepTime}</span>
                <span>{recipe.cuisineType}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.dietaryTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 glass-card text-white/80 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div className="metric-card p-3">
                  <div className="font-semibold text-white">{recipe.nutrition.protein}g</div>
                  <div className="text-white/60 text-xs">Protein</div>
                </div>
                <div className="metric-card p-3">
                  <div className="font-semibold text-white">{recipe.nutrition.carbs}g</div>
                  <div className="text-white/60 text-xs">Carbs</div>
                </div>
                <div className="metric-card p-3">
                  <div className="font-semibold text-white">{recipe.nutrition.fat}g</div>
                  <div className="text-white/60 text-xs">Fat</div>
                </div>
                <div className="metric-card p-3">
                  <div className="font-semibold text-white">{recipe.healthScore}</div>
                  <div className="text-white/60 text-xs">Health</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-16">
          <div className="glass-card w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No recipes found</h3>
          <p className="text-white/60">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
