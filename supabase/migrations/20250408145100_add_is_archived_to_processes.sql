-- Adiciona coluna is_archived na tabela processes
ALTER TABLE processes ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- Adiciona coluna archive_reason para armazenar o motivo do arquivamento
ALTER TABLE processes ADD COLUMN archive_reason text;

-- Adiciona coluna archived_at para armazenar a data do arquivamento
ALTER TABLE processes ADD COLUMN archived_at timestamp with time zone;

-- Atualiza registros existentes baseados no status atual
-- Marca como true os processos com status 'Arquivado'
UPDATE processes SET is_archived = true WHERE status = 'Arquivado';

-- Cria índice para melhorar performance nas consultas
CREATE INDEX idx_processes_is_archived ON processes(is_archived);
