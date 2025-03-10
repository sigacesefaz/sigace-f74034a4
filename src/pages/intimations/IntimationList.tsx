import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getIntimations } from "@/services/intimations";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { Plus, Search, RefreshCw } from "lucide-react";

export default function IntimationList() {
  const [intimations, setIntimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredIntimations, setFilteredIntimations] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchIntimations = async () => {
      try {
        const data = await getIntimations();
        setIntimations(data);
      } catch (error) {
        console.error("Erro ao buscar intimações:", error);
        toast.error("Erro ao buscar intimações");
      } finally {
        setLoading(false);
      }
    };

    fetchIntimations();
  }, []);

  useEffect(() => {
    const filtered = intimations.filter(intimation => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (intimation.process_number && intimation.process_number.toLowerCase().includes(searchLower)) ||
        (intimation.title && intimation.title.toLowerCase().includes(searchLower)) ||
        (intimation.description && intimation.description.toLowerCase().includes(searchLower)) ||
        (intimation.status && intimation.status.toLowerCase().includes(searchLower)) ||
        (intimation.deadline && intimation.deadline.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredIntimations(filtered);
    setCurrentPage(1);
  }, [searchQuery, intimations]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIntimations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIntimations.length / itemsPerPage);

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-2xl font-bold mb-4">Intimações</h1>
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="search"
                    placeholder="Pesquisar intimações..."
                    className="max-w-[300px] pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button asChild className="bg-[#63639c] hover:bg-[#63639c]/90 text-white">
                  <Link to="/intimations/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Intimação
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#63639c]"></div>
              </div>
            ) : filteredIntimations.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">Nenhuma intimação encontrada</p>
                <Button
                  asChild
                  className="bg-[#63639c] hover:bg-[#63639c]/90 text-white"
                >
                  <Link to="/intimations/new">
                    Cadastrar Nova Intimação
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {currentItems.map((intimation) => (
                  <div key={intimation.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold">{intimation.title || "N/A"}</h2>
                      <Link to={`/intimations/${intimation.id}`} className="text-blue-500 hover:underline">
                        Ver Detalhes
                      </Link>
                    </div>
                    <p className="text-gray-600 mb-4">{intimation.description || "N/A"}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        intimation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        intimation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        intimation.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {intimation.status === 'pending' ? 'Pendente' :
                         intimation.status === 'completed' ? 'Concluída' :
                         intimation.status === 'expired' ? 'Expirada' : 
                         intimation.status}
                      </span>
                      <span className="text-gray-600">{intimation.deadline ? new Date(intimation.deadline).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredIntimations.length > 0 && (
              <div className="mt-4 flex justify-center">
                <div className="flex gap-2">
                  {[...Array(totalPages).keys()].map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page + 1 ? "default" : "outline"}
                      className={currentPage === page + 1 ? "bg-[#63639c] text-white hover:bg-[#63639c]/90" : ""}
                      onClick={() => setCurrentPage(page + 1)}
                    >
                      {page + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
