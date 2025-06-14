import { v } from "convex/values";
import { mutation, query, internalAction, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getGroceryList = query({
  args: {
    weekOf: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) throw new Error("User not in a family");

    const groceryList = await ctx.db
      .query("groceryLists")
      .withIndex("by_family_week", (q) => q.eq("familyId", member.familyId).eq("weekOf", args.weekOf))
      .first();

    if (!groceryList) {
      return {
        _id: null,
        familyId: member.familyId,
        weekOf: args.weekOf,
        items: [],
      };
    }

    return groceryList;
  },
});

export const addItemToGroceryList = mutation({
  args: {
    weekOf: v.string(),
    name: v.string(),
    quantity: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) throw new Error("User not in a family");

    let groceryList = await ctx.db
      .query("groceryLists")
      .withIndex("by_family_week", (q) => q.eq("familyId", member.familyId).eq("weekOf", args.weekOf))
      .first();

    const newItem = {
      name: args.name,
      quantity: args.quantity,
      category: args.category,
      bought: false,
      addedBy: userId,
    };

    if (!groceryList) {
      await ctx.db.insert("groceryLists", {
        familyId: member.familyId,
        weekOf: args.weekOf,
        items: [newItem],
      });
    } else {
      const updatedItems = [...groceryList.items, newItem];
      await ctx.db.patch(groceryList._id, {
        items: updatedItems,
      });
    }
  },
});

export const toggleItemBought = mutation({
  args: {
    weekOf: v.string(),
    itemIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) throw new Error("User not in a family");

    const groceryList = await ctx.db
      .query("groceryLists")
      .withIndex("by_family_week", (q) => q.eq("familyId", member.familyId).eq("weekOf", args.weekOf))
      .first();

    if (!groceryList || args.itemIndex >= groceryList.items.length) {
      throw new Error("Item not found");
    }

    const updatedItems = [...groceryList.items];
    updatedItems[args.itemIndex] = {
      ...updatedItems[args.itemIndex],
      bought: !updatedItems[args.itemIndex].bought,
    };

    await ctx.db.patch(groceryList._id, {
      items: updatedItems,
    });
  },
});

export const removeItemFromGroceryList = mutation({
  args: {
    weekOf: v.string(),
    itemIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!member) throw new Error("User not in a family");

    const groceryList = await ctx.db
      .query("groceryLists")
      .withIndex("by_family_week", (q) => q.eq("familyId", member.familyId).eq("weekOf", args.weekOf))
      .first();

    if (!groceryList || args.itemIndex >= groceryList.items.length) {
      throw new Error("Item not found");
    }

    const updatedItems = groceryList.items.filter((_, index) => index !== args.itemIndex);

    await ctx.db.patch(groceryList._id, {
      items: updatedItems,
    });
  },
});

export const getGroceryListInternal = internalQuery({
  args: {
    familyId: v.id("families"),
    weekOf: v.string(),
  },
  handler: async (ctx, args) => {
    const groceryList = await ctx.db
      .query("groceryLists")
      .withIndex("by_family_week", (q) => q.eq("familyId", args.familyId).eq("weekOf", args.weekOf))
      .first();

    if (!groceryList) {
      return {
        _id: null,
        familyId: args.familyId,
        weekOf: args.weekOf,
        items: [],
      };
    }

    return groceryList;
  },
});

export const addItemToGroceryListInternal = internalMutation({
  args: {
    familyId: v.id("families"),
    weekOf: v.string(),
    name: v.string(),
    quantity: v.string(),
    category: v.string(),
    addedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    let groceryList = await ctx.db
      .query("groceryLists")
      .withIndex("by_family_week", (q) => q.eq("familyId", args.familyId).eq("weekOf", args.weekOf))
      .first();

    const newItem = {
      name: args.name,
      quantity: args.quantity,
      category: args.category,
      bought: false,
      addedBy: args.addedBy,
    };

    if (!groceryList) {
      await ctx.db.insert("groceryLists", {
        familyId: args.familyId,
        weekOf: args.weekOf,
        items: [newItem],
      });
    } else {
      const updatedItems = [...groceryList.items, newItem];
      await ctx.db.patch(groceryList._id, {
        items: updatedItems,
      });
    }
  },
});

export const addIngredientsFromRecipe = internalAction({
  args: {
    familyId: v.id("families"),
    recipeId: v.id("recipes"),
    addedBy: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.runQuery(internal.recipes.getRecipeByIdInternal, { recipeId: args.recipeId });
    if (!recipe) return;

    // Calculate the Monday of the week for the given date
    const date = new Date(args.date);
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekOf = monday.toISOString().split('T')[0];

    const groceryList = await ctx.runQuery(internal.groceryLists.getGroceryListInternal, { 
      familyId: args.familyId,
      weekOf 
    });

    for (const ingredient of recipe.ingredients) {
      // Check if ingredient already exists in the list
      const existingItem = groceryList.items.find((item: any) => 
        item.name.toLowerCase() === ingredient.name.toLowerCase()
      );

      if (!existingItem) {
        await ctx.runMutation(internal.groceryLists.addItemToGroceryListInternal, {
          familyId: args.familyId,
          weekOf,
          name: ingredient.name,
          quantity: ingredient.quantity,
          category: ingredient.category,
          addedBy: args.addedBy,
        });
      }
    }
  },
});
