
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 max-w-full overflow-hidden text-ellipsis",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-amber-500 text-white hover:bg-amber-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        highlight: "border-transparent bg-yellow-400 text-yellow-950 hover:bg-yellow-500",
        count: "border-transparent bg-purple-600 text-white hover:bg-purple-700",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-1.5 py-0.25 text-[0.6rem] h-5",
        lg: "px-3 py-1 text-sm",
        xs: "px-1 py-0.25 text-[0.6rem] h-4", // Adiciona tamanho extra pequeno para telas muito pequenas
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  truncate?: boolean;
  maxLength?: number;
}

function Badge({ className, variant, size, truncate = false, maxLength, ...props }: BadgeProps) {
  // Se maxLength for fornecido e o conteúdo for texto, truncar o texto
  let content = props.children;
  if (maxLength && typeof content === 'string' && content.length > maxLength) {
    content = `${content.substring(0, maxLength)}...`;
    props.children = content;
  }
  
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        truncate ? "truncate" : "",
        className
      )} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
