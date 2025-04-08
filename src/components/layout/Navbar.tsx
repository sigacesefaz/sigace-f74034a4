import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/lib/supabase";

export function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              SIGACE
            </Link>
            <div className="hidden md:flex space-x-4">
              <div className="flex items-center space-x-4">
                <Link to="/processes" className="text-gray-600 hover:text-gray-900">
                  Processos
                </Link>
                <Link to="/processes/archived" className="text-gray-600 hover:text-gray-900 font-medium">
                  Processos Arquivados
                </Link>
                <Link to="/intimations" className="text-gray-600 hover:text-gray-900">
                  Intimações
                </Link>
                <Link to="/notifications" className="text-gray-600 hover:text-gray-900">
                  Notificações
                </Link>
                <Link to="/reports" className="text-gray-600 hover:text-gray-900">
                  Relatórios
                </Link>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
}