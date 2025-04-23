
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function LoginDropdown() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <Button 
      onClick={handleLogin}
      className="bg-primary hover:bg-primary-dark text-white font-bold"
    >
      Entrar
    </Button>
  );
}
