import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { OnboardingFlow } from "./OnboardingFlow";
import { HomeTab } from "./HomeTab";
import { RecipesTab } from "./RecipesTab";
import { NutritionTab } from "./NutritionTab";
import { GroceryTab } from "./GroceryTab";
import { SignOutButton } from "../SignOutButton";

export function MainApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [showMenu, setShowMenu] = useState(false);
  
  const familyData = useQuery(api.families.getCurrentFamily);
  const seedRecipes = useMutation(api.recipes.seedRecipes);

  useEffect(() => {
    if (familyData) {
      seedRecipes();
    }
  }, [familyData, seedRecipes]);

  if (familyData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-white/60 mx-auto"></div>
          <p className="text-white/80 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!familyData || !familyData.member?.onboardingComplete) {
    return <OnboardingFlow />;
  }

  const tabs = [
    { id: "home", name: "Home", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: "recipes", name: "Recipes", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )},
    { id: "nutrition", name: "Nutrition", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: "grocery", name: "Grocery", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
    )},
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab familyData={familyData} />;
      case "recipes":
        return <RecipesTab />;
      case "nutrition":
        return <NutritionTab />;
      case "grocery":
        return <GroceryTab />;
      default:
        return <HomeTab familyData={familyData} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute top-0 right-0 w-80 h-full glass border-l border-white/20 p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-white">Menu</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="glass-button p-2 text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="text-sm text-white/60 mb-4">Navigation</div>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "glass-button bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
            
            <div className="border-t border-white/20 pt-6">
              <div className="text-sm text-white/60 mb-4">Account</div>
              <div className="text-white/90 mb-4 font-medium">
                {familyData.member.name}
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-16">
        {renderActiveTab()}
      </main>

      {/* Bottom Navigation - More Compact */}
      <nav className="glass-nav fixed bottom-0 left-0 right-0 px-2 py-2 z-30">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "text-white bg-white/15"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {tab.icon}
              <span className="text-xs font-medium">{tab.name}</span>
            </button>
          ))}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-white/60 hover:text-white/80 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
