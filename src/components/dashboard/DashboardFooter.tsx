import React from "react"

export function DashboardFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            2025 SIGACE - Sistema de Gestão e Acompanhamento de Créditos do Estado
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          Versão 1.0.0
        </p>
      </div>
    </footer>
  )
}
