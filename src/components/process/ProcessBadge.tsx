
import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBreakpoint } from "@/hooks/use-mobile";

interface ProcessBadgeProps extends BadgeProps {
  count?: number | string;
  label: string;
  color?: "default" | "highlight" | "warning" | "info" | "success" | "count";
  code?: string;
  truncateLength?: number;
}

export function ProcessBadge({ 
  count, 
  label, 
  color = "default", 
  code,
  className,
  truncateLength,
  ...props 
}: ProcessBadgeProps) {
  const breakpoint = useBreakpoint();
  const isSmallScreen = breakpoint === 'xsmall' || breakpoint === 'mobile';
  const isXSmall = breakpoint === 'xsmall';
  
  // Determina se deve truncar e qual o tamanho máximo baseado no breakpoint e nos parâmetros
  const shouldTruncate = truncateLength !== undefined || isSmallScreen;
  let maxLength = truncateLength;
  
  if (!maxLength) {
    if (breakpoint === 'xsmall') {
      maxLength = 6;  // Ainda menor para telefones muito pequenos
    } else if (breakpoint === 'mobile') {
      maxLength = 10; // Reduzimos para garantir que caiba melhor
    } else if (breakpoint === 'tablet') {
      maxLength = 18; // Também ajustamos para tablets
    }
  }
  
  // Trunca o texto se necessário
  const displayLabel = shouldTruncate && label && label.length > maxLength
    ? `${label.substring(0, maxLength)}...`
    : label;

  // Tamanho apropriado para cada breakpoint  
  const badgeSize = isXSmall ? "xs" : (isSmallScreen ? "sm" : "default");
  
  return (
    <Badge 
      variant={color as any} 
      size={badgeSize}
      className={cn(
        "mb-1 mr-1 whitespace-normal break-words", 
        isSmallScreen ? "text-[0.6rem] max-w-[110px]" : "max-w-[200px]",
        className
      )} 
      title={label + (code ? ` (${code})` : '')}
      {...props}
    >
      {count && (
        <span className={cn(
          "inline-flex justify-center min-w-[1rem] mr-1 bg-white bg-opacity-30 rounded px-1",
          isXSmall ? "text-[0.55rem]" : isSmallScreen ? "text-[0.6rem]" : ""
        )}>
          {count}
        </span>
      )}
      {displayLabel}
      {code && !isSmallScreen && (
        <span className="ml-1 opacity-75">{`(${code})`}</span>
      )}
      {code && isSmallScreen && code.length <= 5 && (
        <span className="ml-1 opacity-75 text-[0.55rem]">{`(${code})`}</span>
      )}
    </Badge>
  );
}

export function EventBadge({ count, label, className, ...props }: ProcessBadgeProps) {
  return (
    <ProcessBadge
      count={count}
      label={label}
      color="count"
      className={cn("bg-yellow-500", className)}
      {...props}
    />
  );
}

export function MovementBadge({ count, label, className, ...props }: ProcessBadgeProps) {
  return (
    <ProcessBadge
      count={count}
      label={label}
      color="info"
      className={cn("bg-purple-500", className)}
      {...props}
    />
  );
}

export function SubjectBadge({ label, code, className, ...props }: ProcessBadgeProps) {
  const breakpoint = useBreakpoint();
  const isSmallScreen = breakpoint === 'xsmall' || breakpoint === 'mobile';
  
  // Para telas pequenas, limitar ainda mais o tamanho do texto
  const truncateLength = isSmallScreen ? 
    (breakpoint === 'xsmall' ? 8 : 12) : 25;
  
  return (
    <ProcessBadge
      label={label}
      code={code}
      color="default"
      className={cn("bg-blue-600", className)}
      truncateLength={truncateLength}
      {...props}
    />
  );
}

export function StatusBadge({ label, className, ...props }: ProcessBadgeProps) {
  const breakpoint = useBreakpoint();
  const isSmallScreen = breakpoint === 'xsmall' || breakpoint === 'mobile';
  
  // Para telas pequenas, limitar o tamanho do texto
  const truncateLength = isSmallScreen ? 
    (breakpoint === 'xsmall' ? 8 : 12) : undefined;
  
  return (
    <ProcessBadge
      label={label}
      color="success"
      className={cn("bg-green-600", className)}
      truncateLength={truncateLength}
      {...props}
    />
  );
}

export function DateInfoBadge({ label, value, className, ...props }: { label: string, value: string } & BadgeProps) {
  const breakpoint = useBreakpoint();
  const isSmallScreen = breakpoint === 'xsmall' || breakpoint === 'mobile';
  const isXSmall = breakpoint === 'xsmall';
  
  return (
    <div className={cn(
      "inline-flex flex-wrap items-center mb-1 mr-2",
      isXSmall ? "text-[0.6rem]" : isSmallScreen ? "text-xs" : "text-sm"
    )}>
      <span className={cn("mr-0.5 text-gray-600", isSmallScreen ? "text-[0.6rem]" : "text-xs")}>{label}:</span>
      <span className={cn(
        "font-medium text-gray-800", 
        isXSmall ? "text-[0.6rem]" : isSmallScreen ? "text-xs" : ""
      )}>
        {value}
      </span>
    </div>
  );
}
