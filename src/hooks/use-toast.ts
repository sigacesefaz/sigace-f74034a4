
import { toast as sonnerToast, type ToastOptions } from "sonner";

// Define our custom ToastProps that includes title
export interface ToastProps extends Omit<ToastOptions, "title"> {
  title?: string;
  description?: string;
}

// Create a wrapper for Sonner toast that handles our custom props format
export function toast(props: ToastProps): void;
export function toast(message: string, props?: Omit<ToastProps, "description">): void;
export function toast(
  title: string,
  description: string,
  props?: Omit<ToastProps, "description" | "title">
): void;
export function toast(
  messageOrProps: string | ToastProps,
  descriptionOrProps?: string | Omit<ToastProps, "description">,
  props?: Omit<ToastProps, "description" | "title">
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
