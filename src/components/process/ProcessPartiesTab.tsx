
import React from "react";
import { User, Building2, Phone, Mail, MapPin, FileText, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { safeStringValue } from "@/lib/utils";
import ProcessParties from "./ProcessParties";

interface ProcessParty {
  id: string;
  name: string;
  document: string;
  type: "AUTHOR" | "DEFENDANT" | "MP";
  subtype?: string;
  personType: "physical" | "legal";
  contacts?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  lawyers?: Array<{
    name: string;
    oab: string;
  }>;
}

interface ProcessPartiesTabProps {
  processId: string;
  parties?: ProcessParty[];
}

export function ProcessPartiesTab({ processId, parties = [] }: ProcessPartiesTabProps) {
  const getPartyTypeLabel = (type: string) => {
    switch (type) {
      case "AUTHOR": return "Autor";
      case "DEFENDANT": return "Réu";
      case "MP": return "Ministério Público";
      default: return type;
    }
  };

  const getPersonTypeIcon = (type: string) => {
    return type === "physical" ? (
      <User className="h-5 w-5 text-blue-600" />
    ) : (
      <Building2 className="h-5 w-5 text-blue-600" />
    );
  };

  const getPersonTypeLabel = (type: string) => {
    return type === "physical" ? "Pessoa Física" : "Pessoa Jurídica";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Partes do Processo</h3>
      </div>

      {parties && parties.length > 0 ? (
        <div className="space-y-4">
          {parties.map((party) => (
            <Card key={party.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    {getPersonTypeIcon(party.personType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{safeStringValue(party.name)}</h3>
                      <Badge className="ml-2">
                        {getPartyTypeLabel(party.type)}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{safeStringValue(party.document, "Documento não informado")}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{getPersonTypeLabel(party.personType)}</span>
                      </div>
                      
                      {party.contacts?.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{party.contacts.phone}</span>
                        </div>
                      )}
                      
                      {party.contacts?.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>{party.contacts.email}</span>
                        </div>
                      )}
                      
                      {party.contacts?.address && (
                        <div className="flex items-center text-sm text-gray-500 col-span-2">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>{party.contacts.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {party.lawyers && party.lawyers.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="text-sm font-medium mb-2">Advogados</h4>
                        <div className="space-y-2">
                          {party.lawyers.map((lawyer, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{lawyer.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                OAB: {lawyer.oab}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ProcessParties processId={processId} />
      )}
    </div>
  );
}
