import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const seedRecipes = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if recipes already exist
    const existingRecipes = await ctx.db.query("recipes").take(1);
    if (existingRecipes.length > 0) return;

    const sampleRecipes = [
      {
        name: "Classic Margherita Pizza",
        description: "Traditional Italian pizza with fresh mozzarella, tomato sauce, and basil",
        cuisineType: "Italian",
        dietaryTags: ["vegetarian"],
        prepTime: "moderate" as const,
        nutrition: { calories: 520, protein: 22, carbs: 58, fat: 24, sugar: 8 },
        ingredients: [
          { name: "Pizza dough", quantity: "1 ball", category: "grains" },
          { name: "Tomato sauce", quantity: "1/2 cup", category: "vegetables" },
          { name: "Fresh mozzarella", quantity: "8 oz", category: "dairy" },
          { name: "Fresh basil", quantity: "1/4 cup", category: "herbs" },
          { name: "Olive oil", quantity: "2 tbsp", category: "oils" },
        ],
        instructions: [
          "Preheat oven to 475°F",
          "Roll out pizza dough on floured surface",
          "Spread tomato sauce evenly over dough",
          "Add torn mozzarella pieces",
          "Bake for 12-15 minutes until golden",
          "Top with fresh basil and drizzle with olive oil"
        ],
        allergens: ["gluten", "dairy"],
        estimatedCost: 12.00,
        healthScore: 72,
        tags: ["comfort-food", "italian", "vegetarian"],
      },
      {
        name: "Chicken Caesar Salad",
        description: "Crisp romaine lettuce with grilled chicken, parmesan, and caesar dressing",
        cuisineType: "American",
        dietaryTags: ["high-protein", "low-carb"],
        prepTime: "quick" as const,
        nutrition: { calories: 380, protein: 32, carbs: 12, fat: 24, sugar: 4 },
        ingredients: [
          { name: "Chicken breast", quantity: "6 oz", category: "protein" },
          { name: "Romaine lettuce", quantity: "1 head", category: "vegetables" },
          { name: "Parmesan cheese", quantity: "1/2 cup", category: "dairy" },
          { name: "Caesar dressing", quantity: "3 tbsp", category: "condiments" },
          { name: "Croutons", quantity: "1/2 cup", category: "grains" },
        ],
        instructions: [
          "Season and grill chicken breast until cooked through",
          "Chop romaine lettuce into bite-sized pieces",
          "Slice grilled chicken",
          "Toss lettuce with caesar dressing",
          "Top with chicken, parmesan, and croutons"
        ],
        allergens: ["dairy", "gluten"],
        estimatedCost: 14.00,
        healthScore: 78,
        tags: ["salad", "protein-rich", "quick"],
      },
      {
        name: "Beef Tacos",
        description: "Seasoned ground beef in soft tortillas with fresh toppings",
        cuisineType: "Mexican",
        dietaryTags: ["high-protein"],
        prepTime: "quick" as const,
        nutrition: { calories: 450, protein: 28, carbs: 32, fat: 22, sugar: 6 },
        ingredients: [
          { name: "Ground beef", quantity: "1 lb", category: "protein" },
          { name: "Soft tortillas", quantity: "8 pieces", category: "grains" },
          { name: "Cheddar cheese", quantity: "1 cup", category: "dairy" },
          { name: "Lettuce", quantity: "2 cups", category: "vegetables" },
          { name: "Tomatoes", quantity: "2 medium", category: "vegetables" },
          { name: "Taco seasoning", quantity: "1 packet", category: "spices" },
        ],
        instructions: [
          "Brown ground beef in a large skillet",
          "Add taco seasoning and water, simmer 5 minutes",
          "Warm tortillas in microwave or skillet",
          "Fill tortillas with beef mixture",
          "Top with cheese, lettuce, and diced tomatoes"
        ],
        allergens: ["dairy", "gluten"],
        estimatedCost: 16.00,
        healthScore: 68,
        tags: ["mexican", "comfort-food", "family-friendly"],
      },
      {
        name: "Spaghetti Carbonara",
        description: "Classic Italian pasta with eggs, cheese, pancetta, and black pepper",
        cuisineType: "Italian",
        dietaryTags: ["high-protein"],
        prepTime: "quick" as const,
        nutrition: { calories: 580, protein: 26, carbs: 52, fat: 28, sugar: 4 },
        ingredients: [
          { name: "Spaghetti", quantity: "1 lb", category: "grains" },
          { name: "Pancetta", quantity: "6 oz", category: "protein" },
          { name: "Eggs", quantity: "4 large", category: "protein" },
          { name: "Parmesan cheese", quantity: "1 cup", category: "dairy" },
          { name: "Black pepper", quantity: "2 tsp", category: "spices" },
        ],
        instructions: [
          "Cook spaghetti according to package directions",
          "Crisp pancetta in a large skillet",
          "Whisk eggs with parmesan and black pepper",
          "Toss hot pasta with pancetta and rendered fat",
          "Remove from heat and quickly stir in egg mixture",
          "Serve immediately with extra parmesan"
        ],
        allergens: ["gluten", "dairy", "eggs"],
        estimatedCost: 13.00,
        healthScore: 65,
        tags: ["italian", "pasta", "comfort-food"],
      },
      {
        name: "Chicken Stir Fry",
        description: "Quick and healthy stir-fry with chicken and mixed vegetables",
        cuisineType: "Asian",
        dietaryTags: ["high-protein", "low-carb"],
        prepTime: "quick" as const,
        nutrition: { calories: 320, protein: 28, carbs: 18, fat: 16, sugar: 12 },
        ingredients: [
          { name: "Chicken breast", quantity: "1 lb", category: "protein" },
          { name: "Mixed vegetables", quantity: "4 cups", category: "vegetables" },
          { name: "Soy sauce", quantity: "3 tbsp", category: "condiments" },
          { name: "Garlic", quantity: "3 cloves", category: "vegetables" },
          { name: "Ginger", quantity: "1 tbsp", category: "spices" },
          { name: "Sesame oil", quantity: "2 tbsp", category: "oils" },
        ],
        instructions: [
          "Cut chicken into bite-sized pieces",
          "Heat oil in wok or large skillet over high heat",
          "Stir-fry chicken until cooked through",
          "Add garlic and ginger, cook 30 seconds",
          "Add vegetables and stir-fry 3-4 minutes",
          "Add soy sauce and toss to combine"
        ],
        allergens: ["soy"],
        estimatedCost: 15.00,
        healthScore: 85,
        tags: ["asian", "healthy", "quick"],
      },
      {
        name: "Cheeseburger",
        description: "Classic American cheeseburger with lettuce, tomato, and pickles",
        cuisineType: "American",
        dietaryTags: ["high-protein"],
        prepTime: "quick" as const,
        nutrition: { calories: 650, protein: 35, carbs: 42, fat: 38, sugar: 8 },
        ingredients: [
          { name: "Ground beef", quantity: "1/2 lb", category: "protein" },
          { name: "Hamburger buns", quantity: "2 pieces", category: "grains" },
          { name: "American cheese", quantity: "2 slices", category: "dairy" },
          { name: "Lettuce", quantity: "2 leaves", category: "vegetables" },
          { name: "Tomato", quantity: "1 medium", category: "vegetables" },
          { name: "Pickles", quantity: "4 slices", category: "vegetables" },
        ],
        instructions: [
          "Form ground beef into 2 patties",
          "Season with salt and pepper",
          "Cook patties in skillet 4-5 minutes per side",
          "Add cheese in last minute of cooking",
          "Toast buns lightly",
          "Assemble burgers with lettuce, tomato, and pickles"
        ],
        allergens: ["gluten", "dairy"],
        estimatedCost: 8.00,
        healthScore: 55,
        tags: ["american", "comfort-food", "grilled"],
      },
      {
        name: "Greek Salad",
        description: "Fresh Mediterranean salad with feta, olives, and olive oil dressing",
        cuisineType: "Mediterranean",
        dietaryTags: ["vegetarian", "low-carb"],
        prepTime: "quick" as const,
        nutrition: { calories: 280, protein: 8, carbs: 14, fat: 24, sugar: 10 },
        ingredients: [
          { name: "Cucumber", quantity: "2 medium", category: "vegetables" },
          { name: "Tomatoes", quantity: "3 large", category: "vegetables" },
          { name: "Red onion", quantity: "1/2 medium", category: "vegetables" },
          { name: "Feta cheese", quantity: "6 oz", category: "dairy" },
          { name: "Kalamata olives", quantity: "1/2 cup", category: "vegetables" },
          { name: "Olive oil", quantity: "1/4 cup", category: "oils" },
        ],
        instructions: [
          "Chop cucumber, tomatoes, and red onion",
          "Combine vegetables in large bowl",
          "Add olives and crumbled feta",
          "Drizzle with olive oil and lemon juice",
          "Season with oregano, salt, and pepper",
          "Toss gently and serve"
        ],
        allergens: ["dairy"],
        estimatedCost: 11.00,
        healthScore: 88,
        tags: ["mediterranean", "vegetarian", "fresh"],
      },
      {
        name: "Pancakes",
        description: "Fluffy breakfast pancakes served with butter and maple syrup",
        cuisineType: "American",
        dietaryTags: ["vegetarian"],
        prepTime: "quick" as const,
        nutrition: { calories: 420, protein: 12, carbs: 68, fat: 12, sugar: 24 },
        ingredients: [
          { name: "All-purpose flour", quantity: "2 cups", category: "grains" },
          { name: "Milk", quantity: "1.5 cups", category: "dairy" },
          { name: "Eggs", quantity: "2 large", category: "protein" },
          { name: "Butter", quantity: "4 tbsp", category: "dairy" },
          { name: "Baking powder", quantity: "2 tsp", category: "baking" },
          { name: "Maple syrup", quantity: "1/4 cup", category: "sweeteners" },
        ],
        instructions: [
          "Mix flour, baking powder, and salt in bowl",
          "Whisk milk, eggs, and melted butter separately",
          "Combine wet and dry ingredients until just mixed",
          "Heat griddle or skillet over medium heat",
          "Pour batter to form pancakes",
          "Cook until bubbles form, flip and cook until golden"
        ],
        allergens: ["gluten", "dairy", "eggs"],
        estimatedCost: 6.00,
        healthScore: 45,
        tags: ["breakfast", "comfort-food", "sweet"],
      },
      {
        name: "Fish and Chips",
        description: "Beer-battered fish with crispy fries and tartar sauce",
        cuisineType: "British",
        dietaryTags: ["high-protein"],
        prepTime: "moderate" as const,
        nutrition: { calories: 720, protein: 32, carbs: 58, fat: 38, sugar: 4 },
        ingredients: [
          { name: "White fish fillets", quantity: "1 lb", category: "protein" },
          { name: "Potatoes", quantity: "2 lbs", category: "vegetables" },
          { name: "Beer", quantity: "1 cup", category: "liquids" },
          { name: "Flour", quantity: "2 cups", category: "grains" },
          { name: "Vegetable oil", quantity: "4 cups", category: "oils" },
          { name: "Tartar sauce", quantity: "1/2 cup", category: "condiments" },
        ],
        instructions: [
          "Cut potatoes into thick fries",
          "Make batter with flour, beer, and seasonings",
          "Heat oil to 375°F",
          "Fry potatoes until golden, set aside",
          "Dip fish in batter and fry until crispy",
          "Serve hot with tartar sauce and lemon"
        ],
        allergens: ["gluten", "fish"],
        estimatedCost: 18.00,
        healthScore: 52,
        tags: ["british", "fried", "comfort-food"],
      },
      {
        name: "Chicken Curry",
        description: "Aromatic Indian curry with tender chicken in spiced tomato sauce",
        cuisineType: "Indian",
        dietaryTags: ["high-protein", "gluten-free"],
        prepTime: "moderate" as const,
        nutrition: { calories: 380, protein: 28, carbs: 16, fat: 22, sugar: 8 },
        ingredients: [
          { name: "Chicken thighs", quantity: "2 lbs", category: "protein" },
          { name: "Onions", quantity: "2 large", category: "vegetables" },
          { name: "Tomatoes", quantity: "4 medium", category: "vegetables" },
          { name: "Coconut milk", quantity: "1 can", category: "dairy" },
          { name: "Curry powder", quantity: "3 tbsp", category: "spices" },
          { name: "Ginger-garlic paste", quantity: "2 tbsp", category: "spices" },
        ],
        instructions: [
          "Cut chicken into bite-sized pieces",
          "Sauté onions until golden brown",
          "Add ginger-garlic paste and curry powder",
          "Add tomatoes and cook until soft",
          "Add chicken and cook until done",
          "Stir in coconut milk and simmer 10 minutes"
        ],
        allergens: [],
        estimatedCost: 16.00,
        healthScore: 78,
        tags: ["indian", "spicy", "comfort-food"],
      },
    ];

    for (const recipe of sampleRecipes) {
      await ctx.db.insert("recipes", recipe);
    }
  },
});

export const getAllRecipes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.query("recipes").collect();
  },
});

export const getRecipeById = query({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.get(args.recipeId);
  },
});

export const searchRecipes = query({
  args: {
    searchTerm: v.optional(v.string()),
    cuisineType: v.optional(v.string()),
    dietaryTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let recipes;
    
    if (args.searchTerm) {
      recipes = await ctx.db
        .query("recipes")
        .withSearchIndex("search_recipes", (q) => q.search("name", args.searchTerm!))
        .collect();
    } else {
      recipes = await ctx.db.query("recipes").collect();
    }

    // Filter by cuisine type if specified
    if (args.cuisineType) {
      recipes = recipes.filter(recipe => recipe.cuisineType === args.cuisineType);
    }

    // Filter by dietary tags if specified
    if (args.dietaryTags && args.dietaryTags.length > 0) {
      recipes = recipes.filter(recipe => 
        args.dietaryTags!.some(tag => recipe.dietaryTags.includes(tag))
      );
    }

    return recipes;
  },
});

export const getRecipeByIdInternal = internalQuery({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.recipeId);
  },
});
