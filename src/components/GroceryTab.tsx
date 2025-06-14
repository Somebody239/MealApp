import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function GroceryTab() {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    return monday.toISOString().split('T')[0];
  });
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("other");
  const [showAddForm, setShowAddForm] = useState(false);

  const groceryList = useQuery(api.groceryLists.getGroceryList, {
    weekOf: selectedWeek,
  });
  const addItem = useMutation(api.groceryLists.addItemToGroceryList);
  const toggleItem = useMutation(api.groceryLists.toggleItemBought);
  const removeItem = useMutation(api.groceryLists.removeItemFromGroceryList);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemQuantity.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addItem({
        weekOf: selectedWeek,
        name: newItemName,
        quantity: newItemQuantity,
        category: newItemCategory,
      });
      setNewItemName("");
      setNewItemQuantity("");
      setNewItemCategory("other");
      setShowAddForm(false);
      toast.success("Item added to grocery list!");
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleToggleItem = async (itemIndex: number) => {
    try {
      await toggleItem({
        weekOf: selectedWeek,
        itemIndex,
      });
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleRemoveItem = async (itemIndex: number) => {
    try {
      await removeItem({
        weekOf: selectedWeek,
        itemIndex,
      });
      toast.success("Item removed from list!");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  if (groceryList === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="glass p-6 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-white/60 mx-auto"></div>
          <p className="text-white/80 mt-3 text-center">Loading grocery list...</p>
        </div>
      </div>
    );
  }

  const categories = {
    protein: "🥩 Protein",
    vegetables: "🥬 Vegetables",
    fruits: "🍎 Fruits",
    dairy: "🥛 Dairy",
    grains: "🌾 Grains",
    pantry: "🥫 Pantry",
    other: "📦 Other",
  };

  const groupedItems = groceryList.items.reduce((acc, item, index) => {
    const category = item.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ...item, index });
    return acc;
  }, {} as Record<string, Array<any>>);

  const completedItems = groceryList.items.filter(item => item.bought).length;
  const totalItems = groceryList.items.length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="p-6 space-y-8">
      <div className="glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Grocery List</h1>
            <p className="text-white/70">
              Week of {new Date(selectedWeek).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <input
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="glass-input px-4 py-3 text-white"
          />
        </div>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Shopping Progress</h2>
            <span className="text-sm text-white/60">{completedItems}/{totalItems} items</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-white/60 mt-2">{completionPercentage}% complete</p>
        </div>
      )}

      {/* Add New Item Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full glass-button flex items-center justify-center gap-3 py-4 text-white font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add New Item
      </button>

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Add New Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full glass-input px-4 py-3 text-white placeholder-white/50"
            />
            <input
              type="text"
              placeholder="Quantity"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              className="w-full glass-input px-4 py-3 text-white placeholder-white/50"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full glass-input px-4 py-3 text-white"
            >
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 glass-button py-3 text-white font-medium"
              >
                Add Item
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 glass-card py-3 text-white/80 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grocery List by Category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              {categories[category as keyof typeof categories] || category}
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.index}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.bought 
                      ? "glass-card bg-green-500/20 border-green-400/30" 
                      : "glass-card border-white/10"
                  }`}
                >
                  <button
                    onClick={() => handleToggleItem(item.index)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.bought
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-white/40 hover:border-green-500"
                    }`}
                  >
                    {item.bought && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${item.bought ? "line-through text-white/60" : "text-white"}`}>
                      {item.name}
                    </div>
                    <div className="text-sm text-white/60">{item.quantity}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.index)}
                    className="text-red-400 hover:text-red-300 p-2 glass-card rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalItems === 0 && (
        <div className="text-center py-16">
          <div className="glass-card w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-white/40 text-4xl">🛒</div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No items in your grocery list</h3>
          <p className="text-white/60">Add items above or plan some meals to get started!</p>
        </div>
      )}
    </div>
  );
}
