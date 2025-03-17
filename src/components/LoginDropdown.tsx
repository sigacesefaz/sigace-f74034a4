
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
      className="bg-[#ffd700] hover:bg-[#ffd700]/90 text-black font-bold"
    >
      Entrar
    </Button>
  );
}
