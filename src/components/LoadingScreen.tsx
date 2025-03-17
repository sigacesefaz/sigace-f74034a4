
import React from "react";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex flex-col items-center">
        <div className="border-4 border-t-primary rounded-full w-12 h-12 animate-spin mb-4"></div>
        <p className="text-lg font-medium text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
