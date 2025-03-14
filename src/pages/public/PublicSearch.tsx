
import React, { useState, useEffect } from "react";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { useNavigate } from "react-router-dom";
import { PublicProcessDialog } from "@/components/process/PublicProcessDialog";

export default function PublicSearch() {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(true);

  // If dialog is closed, navigate back to home
  useEffect(() => {
    if (!showDialog) {
      navigate('/');
    }
  }, [showDialog, navigate]);

  return (
    <PublicProcessDialog 
      open={showDialog} 
      onOpenChange={setShowDialog} 
    />
  );
}
