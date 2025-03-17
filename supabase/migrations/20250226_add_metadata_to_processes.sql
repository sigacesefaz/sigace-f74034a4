-- Adiciona coluna metadata à tabela processes
ALTER TABLE processes
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Atualiza as políticas de segurança para incluir a nova coluna
ALTER POLICY "Usuários podem ver seus próprios processos" ON processes
    USING (auth.uid() = user_id);

ALTER POLICY "Usuários podem inserir seus próprios processos" ON processes
    WITH CHECK (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON COLUMN processes.metadata IS 'Dados extras do processo em formato JSON, incluindo movimentações, partes, assuntos, etc.';
