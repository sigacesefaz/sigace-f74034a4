
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Gavel, FileText, ChevronDown, ChevronUp, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { safeStringValue } from "@/lib/utils";

interface ProcessDecision {
  id: string;
  title: string;
  description: string;
  decision_type: string;
  judge: string;
  decision_date: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

interface ProcessDecisionsProps {
  decisions?: ProcessDecision[];
}

export function ProcessDecisions({ decisions = [] }: ProcessDecisionsProps) {
  const [expandedDecisions, setExpandedDecisions] = useState<Record<string, boolean>>({});

  const toggleDecision = (id: string) => {
    setExpandedDecisions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="space-y-4">
      {decisions && decisions.length > 0 ? (
        decisions.map((decision) => (
          <Card key={decision.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => toggleDecision(decision.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <Gavel className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{safeStringValue(decision.title)}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {safeStringValue(decision.decision_type, "Não informado")}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(safeStringValue(decision.decision_date))}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{safeStringValue(decision.judge, "Juiz não informado")}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="ml-2">
                  {expandedDecisions[decision.id] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {expandedDecisions[decision.id] && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm">{safeStringValue(decision.description)}</div>
                  
                  {decision.attachments && decision.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Anexos</h4>
                      <div className="space-y-2">
                        {decision.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center p-2 border rounded-md">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">{attachment.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-auto" 
                              onClick={() => window.open(attachment.url, '_blank')}
                            >
                              Visualizar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <Gavel className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Nenhuma decisão encontrada para este processo</p>
        </div>
      )}
    </div>
  );
}
