-- Adiciona coluna archive_reason para armazenar o motivo do arquivamento
ALTER TABLE processes ADD COLUMN archive_reason text;

-- Adiciona coluna archived_at para armazenar a data do arquivamento
ALTER TABLE processes ADD COLUMN archived_at timestamp with time zone; 