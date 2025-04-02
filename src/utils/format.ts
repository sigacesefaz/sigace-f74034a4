export function formatProcessNumber(number: string | null | undefined): string {
  if (!number) return "Não informado";
  
  // Remove todos os caracteres não numéricos
  const digits = number.replace(/\D/g, '');
  
  // Garante que temos 20 dígitos preenchendo com zeros à esquerda
  const paddedDigits = digits.padStart(20, '0');
  
  // Aplica a máscara 0000000-00.0000.0.00.0000
  return `${paddedDigits.slice(0, 7)}-${paddedDigits.slice(7, 9)}.${paddedDigits.slice(9, 13)}.${paddedDigits.slice(13, 14)}.${paddedDigits.slice(14, 16)}.${paddedDigits.slice(16)}`;
}

// Adiciona uma função para formatar data e hora de maneira mais legível
export function formatDateTime(dateTimeStr: string | null | undefined): string {
  if (!dateTimeStr) return "Não informado";
  
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return "Data inválida";
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "Data inválida";
  }
}
