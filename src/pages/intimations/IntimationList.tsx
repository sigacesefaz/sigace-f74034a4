import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getIntimations } from "@/services/intimations";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { Plus, Search, RefreshCw, Trash2, Loader2, FileText, CheckSquare } from "lucide-react";
interface Intimation {
  id: string;
  title: string;
  description: string;
  process_number: string;
  deadline: string;
  status: string;
  created_at: string;
}
export default function IntimationList() {
  const [intimations, setIntimations] = useState<Intimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredIntimations, setFilteredIntimations] = useState<Intimation[]>([]);
  const [selectedIntimations, setSelectedIntimations] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;
  useEffect(() => {
    fetchIntimations();
  }, []);
  useEffect(() => {
    const filtered = intimations.filter(intimation => {
      const searchLower = searchQuery.toLowerCase();
      return intimation.process_number && intimation.process_number.toLowerCase().includes(searchLower) || intimation.title && intimation.title.toLowerCase().includes(searchLower) || intimation.description && intimation.description.toLowerCase().includes(searchLower) || intimation.status && intimation.status.toLowerCase().includes(searchLower) || intimation.deadline && intimation.deadline.toLowerCase().includes(searchLower);
    });
    setFilteredIntimations(filtered);
    setCurrentPage(1);
  }, [searchQuery, intimations]);
  const fetchIntimations = async () => {
    try {
      setLoading(true);
      const data = await getIntimations();
      setIntimations(data);
    } catch (error) {
      console.error("Erro ao buscar intimações:", error);
      toast.error("Erro ao buscar intimações");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteIntimation = async (intimationId: string) => {
    try {
      setIsDeleting(true);

      // First check if the intimation exists
      const {
        data,
        error: checkError
      } = await supabase.from('intimations').select('id').eq('id', intimationId).single();
      if (checkError) {
        console.error("Erro ao verificar intimação:", checkError);
        toast.error("Erro ao excluir a intimação");
        return;
      }

      // Delete the intimation
      const {
        error
      } = await supabase.from('intimations').delete().eq('id', intimationId);
      if (error) {
        console.error("Erro ao excluir intimação:", error);
        toast.error("Erro ao excluir a intimação");
        return;
      }

      // Update the state
      setIntimations(prev => prev.filter(item => item.id !== intimationId));
      setSelectedIntimations(prev => prev.filter(id => id !== intimationId));
      toast.success("Intimação excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir intimação:", error);
      toast.error("Erro ao excluir a intimação");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleBulkDelete = async () => {
    if (selectedIntimations.length === 0) {
      toast.warning("Nenhuma intimação selecionada");
      return;
    }
    try {
      setIsDeleting(true);

      // Make a copy of the selectedIntimations array to avoid mutation during deletion
      const intimationsToDelete = [...selectedIntimations];
      for (const intimationId of intimationsToDelete) {
        const {
          error
        } = await supabase.from('intimations').delete().eq('id', intimationId);
        if (error) {
          console.error(`Erro ao excluir intimação ${intimationId}:`, error);
          toast.error(`Erro ao excluir algumas intimações`);
        }
      }

      // Update the state
      setIntimations(prev => prev.filter(item => !intimationsToDelete.includes(item.id)));
      setSelectedIntimations([]);
      toast.success(`${intimationsToDelete.length} intimações excluídas com sucesso`);
    } catch (error) {
      console.error("Erro ao excluir intimações em massa:", error);
      toast.error("Erro ao excluir intimações");
    } finally {
      setIsDeleting(false);
    }
  };
  const toggleIntimationSelection = (intimationId: string) => {
    setSelectedIntimations(prev => {
      if (prev.includes(intimationId)) {
        return prev.filter(id => id !== intimationId);
      } else {
        return [...prev, intimationId];
      }
    });
  };
  const toggleAllIntimations = () => {
    if (filteredIntimations.length === 0) return;

    // If all are selected, deselect all
    if (filteredIntimations.length === selectedIntimations.length) {
      setSelectedIntimations([]);
    } else {
      // Otherwise, select all
      const allIds = filteredIntimations.map(intimation => intimation.id);
      setSelectedIntimations(allIds);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIntimations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIntimations.length / itemsPerPage);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  // Translate status to Portuguese
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'completed': 'Concluída',
      'expired': 'Expirada',
      'in_progress': 'Em Andamento',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  };
  return <MainLayout>
      <div className="container py-8 mx-auto">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#2e3092]">Intimações</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input type="search" placeholder="Pesquisar intimações..." className="pl-10 w-[300px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Button asChild variant="default" className="bg-[#2e3092] hover:bg-[#2e3092]/90">
                <Link to="/intimations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Intimação
                </Link>
              </Button>
              
            </div>
          </div>

          {loading ? <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2e3092]"></div>
            </div> : filteredIntimations.length === 0 ? <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma intimação encontrada</p>
              <Button asChild className="bg-[#2e3092] hover:bg-[#2e3092]/90">
                <Link to="/intimations/new">
                  Cadastrar Nova Intimação
                </Link>
              </Button>
            </Card> : <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="select-all" className="w-4 h-4 rounded" checked={selectedIntimations.length === filteredIntimations.length} onChange={toggleAllIntimations} />
                  <label htmlFor="select-all" className="text-sm text-gray-600">
                    Selecionar Todas
                  </label>
                </div>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selectedIntimations.length === 0 || isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Excluir Selecionadas ({selectedIntimations.length})
                </Button>
              </div>

              <div className="grid gap-4">
                {currentItems.map(intimation => <Card key={intimation.id} className="p-4 shadow-sm">
                    <div className="flex items-start">
                      <div className="pr-4">
                        <input type="checkbox" className="w-4 h-4 rounded" checked={selectedIntimations.includes(intimation.id)} onChange={() => toggleIntimationSelection(intimation.id)} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-lg font-bold">{intimation.title || "Sem título"}</h2>
                            <p className="text-sm text-gray-500">
                              Processo: {intimation.process_number || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${intimation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : intimation.status === 'completed' ? 'bg-green-100 text-green-800' : intimation.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                              {translateStatus(intimation.status)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2 mb-4">{intimation.description || "Sem descrição"}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>Data limite: {formatDate(intimation.deadline)}</span>
                            <span>•</span>
                            <span>Criado em: {formatDate(intimation.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="border-gray-200" asChild>
                              <Link to={`/intimations/${intimation.id}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                Detalhes
                              </Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteIntimation(intimation.id)} disabled={isDeleting}>
                              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && <div className="mt-6 flex justify-center">
                  <div className="flex gap-2">
                    {[...Array(totalPages).keys()].map(page => <Button key={page} variant={currentPage === page + 1 ? "default" : "outline"} className={currentPage === page + 1 ? "bg-[#2e3092] hover:bg-[#2e3092]/90" : ""} onClick={() => setCurrentPage(page + 1)}>
                        {page + 1}
                      </Button>)}
                  </div>
                </div>}
            </>}
        </div>
      </div>
    </MainLayout>;
}