import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createFamily = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const familyId = await ctx.db.insert("families", {
      name: args.name,
      adminId: userId,
      createdAt: Date.now(),
    });

    // Add the creator as admin family member
    await ctx.db.insert("familyMembers", {
      familyId,
      userId,
      name: "Me",
      role: "admin",
      onboardingComplete: false,
    });

    return familyId;
  },
});

export const addFamilyMember = mutation({
  args: {
    familyId: v.id("families"),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("viewer"), v.literal("suggestion-only")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is admin of this family
    const family = await ctx.db.get(args.familyId);
    if (!family || family.adminId !== userId) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("familyMembers", {
      familyId: args.familyId,
      userId,
      name: args.name,
      role: args.role,
      onboardingComplete: false,
    });
  },
});

export const updateMemberPreferences = mutation({
  args: {
    memberId: v.id("familyMembers"),
    calorieGoal: v.number(),
    healthGoals: v.array(v.string()),
    preferences: v.object({
      cuisines: v.array(v.string()),
      dietaryRestrictions: v.array(v.string()),
      favoriteIngredients: v.array(v.string()),
      dislikedIngredients: v.array(v.string()),
      mealPrepTime: v.union(v.literal("quick"), v.literal("moderate"), v.literal("long")),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db.get(args.memberId);
    if (!member || member.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.memberId, {
      calorieGoal: args.calorieGoal,
      healthGoals: args.healthGoals,
      preferences: args.preferences,
      onboardingComplete: true,
    });
  },
});

export const getUserFamily = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) return null;

    const family = await ctx.db.get(member.familyId);
    const allMembers = await ctx.db
      .query("familyMembers")
      .withIndex("by_family", (q) => q.eq("familyId", member.familyId))
      .collect();

    return {
      family,
      currentMember: member,
      allMembers,
    };
  },
});

export const getCurrentFamily = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) return null;

    const family = await ctx.db.get(member.familyId);
    
    return {
      family,
      member,
    };
  },
});

export const getFamilyMembers = query({
  args: {
    familyId: v.id("families"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("familyMembers")
      .withIndex("by_family", (q) => q.eq("familyId", args.familyId))
      .collect();
  },
});
