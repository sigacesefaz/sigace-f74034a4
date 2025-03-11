
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

export type ToastProps = ExternalToast;

export function toast(props: ToastProps): void;
export function toast(message: string, props?: Omit<ToastProps, "title">): void;
export function toast(
  title: string,
  message: string,
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

  return sonnerToast(messageOrProps);
}

const useToast = () => {
  return { toast };
};

export { useToast };
