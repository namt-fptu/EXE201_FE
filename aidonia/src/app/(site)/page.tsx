"use client";

import Home from "@/components/Home";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * 🔧 ABSOLUTE MINIMUM: Zero logic, just show Home
 * - Remove ALL auth checking temporarily
 * - Just show the home page to fix hooks issue
 */
export default function HomePage() {
  // MINIMAL HOOKS - NEVER CHANGE ORDER
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Minimal useEffect - just stop loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Simple conditional rendering
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <Home />;
}
