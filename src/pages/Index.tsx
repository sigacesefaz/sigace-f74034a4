
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  const handleAccessSystem = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Bem-vindo ao SIGACE
          </h1>
          <p className="text-lg text-gray-600">
            Sistema de Gestão de Ações Contra o Estado - Tocantins
          </p>
        </div>

        {/* Call to action button */}
        <div className="text-center mt-8">
          <Button 
            size="lg" 
            className="bg-[#ffd700] hover:bg-[#ffd700]/90 text-black font-bold"
            onClick={handleAccessSystem}
          >
            Acessar Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
