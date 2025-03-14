
import React from "react";
import { PublicConsultationWizard } from "./PublicConsultationWizard";

interface PublicConsultationTermsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// This component is kept for backward compatibility
// It now simply wraps the new wizard component
export function PublicConsultationTerms({ open, onOpenChange }: PublicConsultationTermsProps) {
  return (
    <PublicConsultationWizard open={open} onOpenChange={onOpenChange} />
  );
}
