import { v } from "convex/values";
import { mutation, query, action, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getMealPlan = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) throw new Error("User not in a family");

    const mealPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_family_date", (q) => q.eq("familyId", member.familyId).eq("date", args.date))
      .first();

    if (!mealPlan) return null;

    // Get recipe details for each meal
    const meals = {
      breakfast: null as any,
      lunch: null as any,
      dinner: null as any,
    };

    if (mealPlan.meals.breakfast) {
      const recipe = await ctx.db.get(mealPlan.meals.breakfast.recipeId);
      const requestedBy = mealPlan.meals.breakfast.requestedBy 
        ? await ctx.db.get(mealPlan.meals.breakfast.requestedBy)
        : null;
      meals.breakfast = { recipe, requestedBy };
    }

    if (mealPlan.meals.lunch) {
      const recipe = await ctx.db.get(mealPlan.meals.lunch.recipeId);
      const requestedBy = mealPlan.meals.lunch.requestedBy 
        ? await ctx.db.get(mealPlan.meals.lunch.requestedBy)
        : null;
      meals.lunch = { recipe, requestedBy };
    }

    if (mealPlan.meals.dinner) {
      const recipe = await ctx.db.get(mealPlan.meals.dinner.recipeId);
      const requestedBy = mealPlan.meals.dinner.requestedBy 
        ? await ctx.db.get(mealPlan.meals.dinner.requestedBy)
        : null;
      meals.dinner = { recipe, requestedBy };
    }

    return { ...mealPlan, meals };
  },
});

export const addMealToPlan = mutation({
  args: {
    date: v.string(),
    mealType: v.union(v.literal("breakfast"), v.literal("lunch"), v.literal("dinner")),
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) throw new Error("User not in a family");

    // Check if user has permission to add meals
    if (member.role === "viewer") {
      throw new Error("Viewers cannot add meals directly");
    }

    let mealPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_family_date", (q) => q.eq("familyId", member.familyId).eq("date", args.date))
      .first();

    if (!mealPlan) {
      // Create new meal plan
      const meals: any = {
        breakfast: undefined,
        lunch: undefined,
        dinner: undefined,
      };
      meals[args.mealType] = {
        recipeId: args.recipeId,
        requestedBy: userId,
      };

      await ctx.db.insert("mealPlans", {
        familyId: member.familyId,
        date: args.date,
        meals,
      });
    } else {
      // Update existing meal plan
      const updatedMeals = { ...mealPlan.meals };
      updatedMeals[args.mealType] = {
        recipeId: args.recipeId,
        requestedBy: userId,
      };

      await ctx.db.patch(mealPlan._id, {
        meals: updatedMeals,
      });
    }

    // Add ingredients to grocery list
    await ctx.scheduler.runAfter(0, internal.groceryLists.addIngredientsFromRecipe, {
      familyId: member.familyId,
      recipeId: args.recipeId,
      addedBy: userId,
      date: args.date,
    });
  },
});

export const removeMealFromPlan = mutation({
  args: {
    date: v.string(),
    mealType: v.union(v.literal("breakfast"), v.literal("lunch"), v.literal("dinner")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) throw new Error("User not in a family");

    // Check if user has permission
    if (member.role === "viewer") {
      throw new Error("Viewers cannot remove meals");
    }

    const mealPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_family_date", (q) => q.eq("familyId", member.familyId).eq("date", args.date))
      .first();

    if (!mealPlan) return;

    const updatedMeals = { ...mealPlan.meals };
    updatedMeals[args.mealType] = undefined;

    await ctx.db.patch(mealPlan._id, {
      meals: updatedMeals,
    });
  },
});

export const getWeeklyNutrition = query({
  args: {
    startDate: v.string(), // Monday of the week
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) throw new Error("User not in a family");

    const weekDates = [];
    const startDate = new Date(args.startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    const weeklyNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
    };

    const dailyNutrition = [];

    for (const date of weekDates) {
      const mealPlan = await ctx.db
        .query("mealPlans")
        .withIndex("by_family_date", (q) => q.eq("familyId", member.familyId).eq("date", date))
        .first();

      const dayNutrition = {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
      };

      if (mealPlan) {
        for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
          const meal = mealPlan.meals[mealType];
          if (meal) {
            const recipe = await ctx.db.get(meal.recipeId);
            if (recipe) {
              dayNutrition.calories += recipe.nutrition.calories;
              dayNutrition.protein += recipe.nutrition.protein;
              dayNutrition.carbs += recipe.nutrition.carbs;
              dayNutrition.fat += recipe.nutrition.fat;
              dayNutrition.sugar += recipe.nutrition.sugar;
            }
          }
        }
      }

      weeklyNutrition.calories += dayNutrition.calories;
      weeklyNutrition.protein += dayNutrition.protein;
      weeklyNutrition.carbs += dayNutrition.carbs;
      weeklyNutrition.fat += dayNutrition.fat;
      weeklyNutrition.sugar += dayNutrition.sugar;

      dailyNutrition.push(dayNutrition);
    }

    return {
      weekly: weeklyNutrition,
      daily: dailyNutrition,
      calorieGoal: member.calorieGoal || 2000,
    };
  },
});

export const generateAIMealPlan = action({
  args: {
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.runQuery(internal.mealPlans.getFamilyMemberInternal, { userId });
    if (!member) throw new Error("User not in a family");

    const familyMembers = await ctx.runQuery(internal.mealPlans.getFamilyMembersInternal, {
      familyId: member.familyId,
    });

    const recipes = await ctx.runQuery(internal.mealPlans.getAllRecipesInternal, {});

    // Generate AI meal plan using OpenAI
    const prompt = `Generate a weekly meal plan for a family with the following preferences:

Family Members:
${familyMembers.map((m: any) => `- ${m.name}: ${JSON.stringify(m.preferences || {})}, Calorie Goal: ${m.calorieGoal || 2000}`).join('\n')}

Available Recipes:
${recipes.map((r: any) => `- ${r.name} (${r.cuisineType}, ${r.dietaryTags.join(', ')}, ${r.nutrition.calories} cal, Prep: ${r.prepTime})`).join('\n')}

Please create a balanced weekly meal plan starting from ${args.startDate}. Consider:
1. Family dietary restrictions and preferences
2. Variety in cuisines and ingredients
3. Balanced nutrition across the week
4. Mix of prep times based on family availability
5. Avoid ingredients that family members dislike

Return a JSON object with this structure:
{
  "monday": {"breakfast": "Recipe Name", "lunch": "Recipe Name", "dinner": "Recipe Name"},
  "tuesday": {"breakfast": "Recipe Name", "lunch": "Recipe Name", "dinner": "Recipe Name"},
  ... for all 7 days
}

Only use recipe names from the available recipes list above.`;

    const openai = new (await import("openai")).default({
      baseURL: process.env.CONVEX_OPENAI_BASE_URL,
      apiKey: process.env.CONVEX_OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No AI response received");

    try {
      const mealPlan = JSON.parse(content);
      
      // Convert the AI response to our meal plan format
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const startDate = new Date(args.startDate);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dayName = days[i];

        if (mealPlan[dayName]) {
          const dayMeals = mealPlan[dayName];
          const meals = {
            breakfast: undefined as any,
            lunch: undefined as any,
            dinner: undefined as any,
          };

          for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
            if (dayMeals[mealType]) {
              const recipe = recipes.find((r: any) => r.name === dayMeals[mealType]);
              if (recipe) {
                meals[mealType] = {
                  recipeId: recipe._id,
                  requestedBy: undefined,
                };
              }
            }
          }

          await ctx.runMutation(internal.mealPlans.createOrUpdateMealPlan, {
            familyId: member.familyId,
            date: dateString,
            meals,
          });
        }
      }

      return { success: true, message: "AI meal plan generated successfully!" };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error("Failed to parse AI meal plan response");
    }
  },
});

export const getFamilyMemberInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getFamilyMembersInternal = internalQuery({
  args: { familyId: v.id("families") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("familyMembers")
      .withIndex("by_family", (q) => q.eq("familyId", args.familyId))
      .collect();
  },
});

export const getAllRecipesInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recipes").collect();
  },
});

export const createOrUpdateMealPlan = internalMutation({
  args: {
    familyId: v.id("families"),
    date: v.string(),
    meals: v.object({
      breakfast: v.optional(v.object({
        recipeId: v.id("recipes"),
        requestedBy: v.optional(v.id("users")),
      })),
      lunch: v.optional(v.object({
        recipeId: v.id("recipes"),
        requestedBy: v.optional(v.id("users")),
      })),
      dinner: v.optional(v.object({
        recipeId: v.id("recipes"),
        requestedBy: v.optional(v.id("users")),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const existingPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_family_date", (q) => q.eq("familyId", args.familyId).eq("date", args.date))
      .first();

    if (existingPlan) {
      await ctx.db.patch(existingPlan._id, { meals: args.meals });
    } else {
      await ctx.db.insert("mealPlans", {
        familyId: args.familyId,
        date: args.date,
        meals: args.meals,
      });
    }
  },
});
