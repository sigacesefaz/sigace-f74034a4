
import { toast as sonnerToast } from "sonner";

// Define our custom ToastProps
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Create a wrapper for Sonner toast that handles our custom props format
export function toast(props: ToastProps): void;
export function toast(message: string, props?: Omit<ToastProps, "title">): void;
export function toast(
  title: string,
  description: string,
  props?: Omit<ToastProps, "title" | "description">
): void;
export function toast(
  messageOrProps: string | ToastProps,
  descriptionOrProps?: string | Omit<ToastProps, "title">,
  props?: Omit<ToastProps, "title" | "description">
) {
  if (typeof messageOrProps === "string") {
    const description = typeof descriptionOrProps === "string" ? descriptionOrProps : undefined;
    
    if (description) {
      return sonnerToast(messageOrProps, {
        description,
        ...(typeof descriptionOrProps === "object" ? descriptionOrProps : {}),
        ...(props || {}),
      });
    }

    return sonnerToast(messageOrProps, {
      ...(typeof descriptionOrProps === "object" ? descriptionOrProps : {}),
    });
  }

  // If first parameter is an object with title property, use title as message
  if (messageOrProps && typeof messageOrProps === "object" && "title" in messageOrProps) {
    const { title, description, ...rest } = messageOrProps;
    return sonnerToast(title as string, {
      description,
      ...rest,
    });
  }

  return sonnerToast(messageOrProps as any);
}

// Simple hook to provide the toast function
export const useToast = () => {
  return { toast };
};
