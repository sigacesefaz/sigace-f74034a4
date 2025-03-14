
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format process number for display
export function formatProcessNumber(processNumber: string): string {
  if (!processNumber) return "Não informado";
  
  // Check if it's already formatted
  if (processNumber.includes('-') && processNumber.includes('.')) {
    return processNumber;
  }
  
  // Basic formatting for CNJ standard (0000000-00.0000.0.00.0000)
  try {
    // Remove any non-numeric characters first
    const numericOnly = processNumber.replace(/\D/g, '');
    
    if (numericOnly.length !== 20) {
      return processNumber; // Return original if not standard length
    }
    
    // Apply CNJ format
    return `${numericOnly.substring(0, 7)}-${numericOnly.substring(7, 9)}.${numericOnly.substring(9, 13)}.${numericOnly.substring(13, 14)}.${numericOnly.substring(14, 16)}.${numericOnly.substring(16, 20)}`;
  } catch (error) {
    console.error("Error formatting process number:", error);
    return processNumber;
  }
}

// Helper for safely accessing string values
export function safeStringValue(value: any, defaultValue: string = ""): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  if (typeof value === 'string') {
    return value.trim();
  }
  
  try {
    return String(value);
  } catch (error) {
    console.error("Error converting value to string:", error);
    return defaultValue;
  }
}

// Check if value is empty
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

// Get nested value safely
export function getSafeNestedValue(obj: any, path: string, defaultValue: any = "Não informado"): any {
  try {
    const parts = path.split('.');
    let result = obj;
    
    for (const part of parts) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[part];
    }
    
    return result !== null && result !== undefined ? result : defaultValue;
  } catch (error) {
    console.error(`Error accessing path ${path}:`, error);
    return defaultValue;
  }
}

// Add the date formatting functions needed in ProcessList.tsx
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
}
