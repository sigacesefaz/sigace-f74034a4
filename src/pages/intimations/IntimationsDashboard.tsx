
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function IntimationsDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#2e3092]">Minhas Intimações</h1>
        <Button 
          className="bg-[#2e3092] hover:bg-[#2e3092]/90 text-white"
          asChild
        >
          <Link to="/intimations/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Intimação
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl mb-1">0</CardTitle>
            <p className="text-sm text-gray-500">Total de Intimações</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="bg-yellow-100 p-3 rounded-full mb-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl mb-1">0</CardTitle>
            <p className="text-sm text-gray-500">Pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="bg-red-100 p-3 rounded-full mb-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl mb-1">0</CardTitle>
            <p className="text-sm text-gray-500">Atrasadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl mb-1">0</CardTitle>
            <p className="text-sm text-gray-500">Concluídas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Intimações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma intimação cadastrada</h3>
            <p className="text-gray-500 mb-6">
              Você ainda não possui nenhuma intimação cadastrada no sistema.
            </p>
            <Button 
              className="bg-[#2e3092] hover:bg-[#2e3092]/90 text-white"
              asChild
            >
              <Link to="/intimations/new">
                Cadastrar Nova Intimação
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
