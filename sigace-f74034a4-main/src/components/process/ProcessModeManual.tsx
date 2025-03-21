
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ProcessForm } from "@/components/process/ProcessForm";

interface ProcessModeManualProps {
  importProgress: number;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ProcessModeManual({
  importProgress,
  onSubmit,
  onCancel
}: ProcessModeManualProps) {
  return (
    <>
      <Card className="p-6">
        <ProcessForm onSubmit={onSubmit} onCancel={onCancel} />
        
        {importProgress > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Importando processo...</span>
              <span>{Math.round(importProgress)}%</span>
            </div>
            <Progress value={importProgress} className="h-2" />
          </div>
        )}
      </Card>
    </>
  );
}
