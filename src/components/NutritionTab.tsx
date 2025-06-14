import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NutritionTab() {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    return monday.toISOString().split('T')[0];
  });

  const nutritionData = useQuery(api.mealPlans.getWeeklyNutrition, {
    startDate: selectedWeek,
  });

  if (nutritionData === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="glass p-6 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-white/60 mx-auto"></div>
          <p className="text-white/80 mt-3 text-center">Loading nutrition data...</p>
        </div>
      </div>
    );
  }

  const getWeekDates = (startDate: string) => {
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);
  const dailyAverage = {
    calories: Math.round(nutritionData.weekly.calories / 7),
    protein: Math.round(nutritionData.weekly.protein / 7),
    carbs: Math.round(nutritionData.weekly.carbs / 7),
    fat: Math.round(nutritionData.weekly.fat / 7),
  };

  return (
    <div className="p-6 space-y-8">
      <div className="glass p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Nutrition</h1>
          <p className="text-white/70">Weekly tracking and goals</p>
        </div>
        <input
          type="date"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="glass-input px-4 py-3 text-white"
        />
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/60">Weekly Calories</p>
              <p className="text-2xl font-bold text-blue-400">{nutritionData.weekly.calories.toLocaleString()}</p>
              <p className="text-xs text-white/50">Avg: {dailyAverage.calories}/day</p>
            </div>
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((dailyAverage.calories / nutritionData.calorieGoal) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-white/50 mt-2">Goal: {nutritionData.calorieGoal}/day</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Weekly Protein</p>
              <p className="text-2xl font-bold text-green-400">{Math.round(nutritionData.weekly.protein)}g</p>
              <p className="text-xs text-white/50">Avg: {dailyAverage.protein}g/day</p>
            </div>
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Weekly Carbs</p>
              <p className="text-2xl font-bold text-yellow-400">{Math.round(nutritionData.weekly.carbs)}g</p>
              <p className="text-xs text-white/50">Avg: {dailyAverage.carbs}g/day</p>
            </div>
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Weekly Fat</p>
              <p className="text-2xl font-bold text-red-400">{Math.round(nutritionData.weekly.fat)}g</p>
              <p className="text-xs text-white/50">Avg: {dailyAverage.fat}g/day</p>
            </div>
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Daily Breakdown</h2>
        <div className="space-y-4">
          {nutritionData.daily.map((day, index) => (
            <div key={day.date} className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-white">
                    {weekDates[index].toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm text-white/60">
                    {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-400">{day.calories} cal</div>
                  <div className="w-20 bg-white/10 rounded-full h-1 mt-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((day.calories / nutritionData.calorieGoal) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-400">{Math.round(day.protein)}g</div>
                  <div className="text-white/50">Protein</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-400">{Math.round(day.carbs)}g</div>
                  <div className="text-white/50">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-400">{Math.round(day.fat)}g</div>
                  <div className="text-white/50">Fat</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition Goals */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Nutrition Goals</h2>
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h3 className="font-medium text-white/80 mb-4">Daily Targets</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 glass-card rounded-lg">
                <span className="text-white/70">Calories:</span>
                <span className="font-semibold text-white">{nutritionData.calorieGoal}</span>
              </div>
              <div className="flex justify-between items-center p-3 glass-card rounded-lg">
                <span className="text-white/70">Protein:</span>
                <span className="font-semibold text-white">{Math.round(nutritionData.calorieGoal * 0.3 / 4)}g</span>
              </div>
              <div className="flex justify-between items-center p-3 glass-card rounded-lg">
                <span className="text-white/70">Carbs:</span>
                <span className="font-semibold text-white">{Math.round(nutritionData.calorieGoal * 0.4 / 4)}g</span>
              </div>
              <div className="flex justify-between items-center p-3 glass-card rounded-lg">
                <span className="text-white/70">Fat:</span>
                <span className="font-semibold text-white">{Math.round(nutritionData.calorieGoal * 0.3 / 9)}g</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-white/80 mb-4">This Week's Performance</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 glass-card rounded-lg">
                <span className="text-white/70">Days on track:</span>
                <span className="font-semibold text-white">
                  {nutritionData.daily.filter(day => 
                    day.calories >= nutritionData.calorieGoal * 0.8 && 
                    day.calories <= nutritionData.calorieGoal * 1.2
                  ).length}/7
                </span>
              </div>
              <div className="flex justify-between items-center p-3 glass-card rounded-lg">
                <span className="text-white/70">Avg vs Goal:</span>
                <span className={`font-semibold ${
                  dailyAverage.calories > nutritionData.calorieGoal ? 'text-red-400' : 'text-green-400'
                }`}>
                  {dailyAverage.calories > nutritionData.calorieGoal ? '+' : ''}
                  {dailyAverage.calories - nutritionData.calorieGoal} cal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
