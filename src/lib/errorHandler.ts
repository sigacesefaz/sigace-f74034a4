import { toast } from "@/hooks/use-toast"

// Lista de erros que devem ser ignorados no console
const ignoredErrors = [
  "Could not establish connection. Receiving end does not exist.",
  "The message port closed before a response was received.",
  "Extension context invalidated."
];

// Função para verificar se um erro deve ser ignorado
export function shouldIgnoreError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  return ignoredErrors.some(ignored => errorMessage.includes(ignored));
}

// Handler global de erros
export function setupErrorHandler() {
  const originalConsoleError = console.error;
  
  // Sobrescrever console.error
  console.error = function(...args: any[]) {
    // Verificar se o erro deve ser ignorado
    const errorMessage = args.join(' ');
    if (ignoredErrors.some(ignored => errorMessage.includes(ignored))) {
      // Ignorar silenciosamente
      return;
    }
    
    // Chamar o console.error original para outros erros
    originalConsoleError.apply(console, args);
  };

  // Handler global para erros não capturados
  window.onerror = function(msg, url, line, col, error) {
    if (shouldIgnoreError(error || msg)) {
      return true; // Prevenir log padrão
    }
    return false; // Permitir log padrão para outros erros
  };

  // Handler para rejeições de Promise não tratadas
  window.onunhandledrejection = function(event) {
    if (shouldIgnoreError(event.reason)) {
      event.preventDefault(); // Prevenir log padrão
      return;
    }
    
    // Mostrar toast para erros não ignorados
    toast({
      title: "Erro",
      description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
      variant: "destructive"
    });
  };
} 