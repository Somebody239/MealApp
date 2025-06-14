import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  families: defineTable({
    name: v.string(),
    adminId: v.id("users"),
    createdAt: v.number(),
  }),

  familyMembers: defineTable({
    familyId: v.id("families"),
    userId: v.id("users"),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("viewer"), v.literal("suggestion-only")),
    calorieGoal: v.optional(v.number()),
    healthGoals: v.optional(v.array(v.string())),
    preferences: v.optional(v.object({
      cuisines: v.array(v.string()),
      dietaryRestrictions: v.array(v.string()),
      favoriteIngredients: v.array(v.string()),
      dislikedIngredients: v.array(v.string()),
      mealPrepTime: v.union(v.literal("quick"), v.literal("moderate"), v.literal("long")),
    })),
    onboardingComplete: v.optional(v.boolean()),
  }).index("by_family", ["familyId"])
    .index("by_user", ["userId"]),

  recipes: defineTable({
    name: v.string(),
    description: v.string(),
    cuisineType: v.string(),
    dietaryTags: v.array(v.string()),
    prepTime: v.union(v.literal("quick"), v.literal("moderate"), v.literal("long")),
    nutrition: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      sugar: v.number(),
    }),
    ingredients: v.array(v.object({
      name: v.string(),
      quantity: v.string(),
      category: v.string(),
    })),
    instructions: v.array(v.string()),
    allergens: v.array(v.string()),
    estimatedCost: v.number(),
    healthScore: v.number(),
    tags: v.array(v.string()),
  }).searchIndex("search_recipes", {
    searchField: "name",
    filterFields: ["cuisineType", "dietaryTags"],
  }),

  mealPlans: defineTable({
    familyId: v.id("families"),
    date: v.string(), // YYYY-MM-DD format
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
  }).index("by_family_date", ["familyId", "date"]),

  groceryLists: defineTable({
    familyId: v.id("families"),
    items: v.array(v.object({
      name: v.string(),
      quantity: v.string(),
      category: v.string(),
      recipeId: v.optional(v.id("recipes")),
      bought: v.boolean(),
      addedBy: v.id("users"),
    })),
    weekOf: v.string(), // YYYY-MM-DD format (Monday of the week)
  }).index("by_family_week", ["familyId", "weekOf"]),

  mealSuggestions: defineTable({
    familyId: v.id("families"),
    recipeId: v.id("recipes"),
    suggestedBy: v.id("users"),
    mealType: v.union(v.literal("breakfast"), v.literal("lunch"), v.literal("dinner")),
    date: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reason: v.optional(v.string()),
  }).index("by_family_status", ["familyId", "status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
