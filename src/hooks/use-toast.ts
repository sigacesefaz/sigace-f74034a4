
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

export type ToastProps = ExternalToast;

export function toast(props: ToastProps): void;
export function toast(message: string, props?: Omit<ToastProps, "description">): void;
export function toast(
  title: string,
  description: string,
  props?: Omit<ToastProps, "description">
): void;
export function toast(
  messageOrProps: string | ToastProps,
  descriptionOrProps?: string | Omit<ToastProps, "description">,
  props?: Omit<ToastProps, "description">
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

  return sonnerToast(messageOrProps);
}

// Simple hook to provide the toast function
const useToast = () => {
  return { toast };
};

export { useToast };
