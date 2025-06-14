import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInForm } from "./SignInForm";
import { MainApp } from "./components/MainApp";

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">🍽️ FamilyMeal</h1>
              <p className="text-gray-400">Plan meals together, eat better</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <MainApp />
      </Authenticated>
    </div>
  );
}

export default App;
