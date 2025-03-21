
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { IncomingMessage, ServerResponse } from "http";
import type { Connect } from "connect";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'configure-proxy',
      configureServer(server: any) {
        server.middlewares.use('/api/resend', async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
          try {
            // Remover o prefixo /api/resend da URL
            const targetPath = req.url?.replace('/api/resend', '') || '';
            
            // Encaminhar a requisição para o Resend
            const targetUrl = `https://api.resend.com${targetPath}`;
            
            // Obter a chave da API do cabeçalho personalizado
            const apiKey = req.headers['x-resend-api-key'];
            
            if (!apiKey) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'API key is required' }));
              return;
            }

            // Registrar a requisição sendo enviada (para fins de depuração)
            console.log(`Proxy: enviando requisição para ${targetUrl}`);
            console.log(`Método: ${req.method}`);

            // Preparar o corpo da requisição
            let body: string | undefined;
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              body = await new Promise<string>((resolve) => {
                let data = '';
                req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
                req.on('end', () => resolve(data));
              });
              
              // Log do corpo sendo enviado
              console.log(`Corpo da requisição: ${body}`);
            }

            // Realizar a requisição para a API do Resend
            const response = await fetch(targetUrl, {
              method: req.method,
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: body || undefined
            });

            // Verificar se a resposta tem o cabeçalho correto
            const contentType = response.headers.get('content-type');
            console.log(`Content-Type recebido: ${contentType}`);

            // Obter o conteúdo da resposta como texto
            const responseText = await response.text();
            
            // Log da resposta
            console.log(`Status da resposta: ${response.status}`);
            console.log(`Cabeçalhos da resposta: ${JSON.stringify([...response.headers.entries()])}`);
            console.log(`Corpo da resposta: ${responseText.substring(0, 500)}`); // Limitar o tamanho do log

            // Verificar se a resposta parece ser HTML
            if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html>')) {
              console.error("Resposta recebida é HTML, não JSON");
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: 'Recebida resposta HTML da API Resend',
                message: 'O servidor retornou uma página HTML em vez de JSON. Isso pode indicar um problema de conectividade ou autenticação.'
              }));
              return;
            }

            // Verificar se a resposta é JSON válido
            let responseData;
            try {
              responseData = JSON.parse(responseText);
            } catch (e) {
              console.error("Resposta não é JSON válido:", e);
              console.error("Resposta recebida:", responseText.substring(0, 500));
              
              // Retornar um erro em formato JSON
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: 'Invalid response from Resend API', 
                details: responseText.substring(0, 200) // Incluir o início da resposta para diagnóstico
              }));
              return;
            }
            
            // Definir os cabeçalhos da resposta
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            
            // Enviar a resposta como JSON
            res.end(JSON.stringify(responseData));
          } catch (error) {
            console.error('Erro no proxy:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: 'Internal proxy error', 
              message: error instanceof Error ? error.message : 'Unknown error'
            }));
          }
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
