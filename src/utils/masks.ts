/**
 * Funções de máscara para formatação de dados
 */

/**
 * Formata um CPF com a máscara 000.000.000-00
 * @param cpf CPF a ser formatado (apenas números)
 * @returns CPF formatado
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return "";
  
  // Remove todos os caracteres não numéricos
  const digits = cpf.replace(/\D/g, '');
  
  // Garante que temos 11 dígitos preenchendo com zeros à esquerda
  const paddedDigits = digits.padStart(11, '0').slice(0, 11);
  
  // Aplica a máscara 000.000.000-00
  return `${paddedDigits.slice(0, 3)}.${paddedDigits.slice(3, 6)}.${paddedDigits.slice(6, 9)}-${paddedDigits.slice(9, 11)}`;
}

/**
 * Formata um CNPJ com a máscara 00.000.000/0000-00
 * @param cnpj CNPJ a ser formatado (apenas números)
 * @returns CNPJ formatado
 */
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return "";
  
  // Remove todos os caracteres não numéricos
  const digits = cnpj.replace(/\D/g, '');
  
  // Garante que temos 14 dígitos preenchendo com zeros à esquerda
  const paddedDigits = digits.padStart(14, '0').slice(0, 14);
  
  // Aplica a máscara 00.000.000/0000-00
  return `${paddedDigits.slice(0, 2)}.${paddedDigits.slice(2, 5)}.${paddedDigits.slice(5, 8)}/${paddedDigits.slice(8, 12)}-${paddedDigits.slice(12, 14)}`;
}

/**
 * Formata um número de processo com a máscara 0000000-00.0000.0.00.0000
 * @param processNumber Número de processo a ser formatado (apenas números)
 * @returns Número de processo formatado
 */
export function formatProcessNumber(processNumber: string | null | undefined): string {
  if (!processNumber) return "";
  
  // Remove todos os caracteres não numéricos
  const digits = processNumber.replace(/\D/g, '');
  
  // Garante que temos 20 dígitos preenchendo com zeros à esquerda
  const paddedDigits = digits.padStart(20, '0').slice(0, 20);
  
  // Aplica a máscara 0000000-00.0000.0.00.0000
  return `${paddedDigits.slice(0, 7)}-${paddedDigits.slice(7, 9)}.${paddedDigits.slice(9, 13)}.${paddedDigits.slice(13, 14)}.${paddedDigits.slice(14, 16)}.${paddedDigits.slice(16, 20)}`;
}

/**
 * Função para aplicar máscara em tempo real durante digitação
 * @param value Valor atual do input
 * @param mask Função de máscara a ser aplicada
 * @param maxLength Comprimento máximo do valor após formatação
 * @returns Valor formatado
 */
export function applyMask(value: string, mask: (value: string) => string, maxLength: number): string {
  // Remove a formatação atual para obter apenas os dígitos
  const digits = value.replace(/\D/g, '');
  
  // Aplica a máscara
  const formatted = mask(digits);
  
  // Limita ao comprimento máximo
  return formatted.slice(0, maxLength);
}

/**
 * Componente de máscara para CPF para uso com react-hook-form
 * @param e Evento de mudança do input
 * @returns Valor formatado
 */
export function maskCPF(e: React.ChangeEvent<HTMLInputElement>): string {
  return applyMask(e.target.value, formatCPF, 14);
}

/**
 * Componente de máscara para CNPJ para uso com react-hook-form
 * @param e Evento de mudança do input
 * @returns Valor formatado
 */
export function maskCNPJ(e: React.ChangeEvent<HTMLInputElement>): string {
  return applyMask(e.target.value, formatCNPJ, 18);
}

/**
 * Componente de máscara para número de processo para uso com react-hook-form
 * @param e Evento de mudança do input
 * @returns Valor formatado
 */
export function maskProcessNumber(e: React.ChangeEvent<HTMLInputElement>): string {
  return applyMask(e.target.value, formatProcessNumber, 25);
} 