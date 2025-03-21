
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
      configureServer(server) {
        server.middlewares.use('/api/resend', async (req, res, next) => {
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
            let body;
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              body = await new Promise((resolve) => {
                let data = '';
                req.on('data', chunk => { data += chunk; });
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
                'Content-Type': 'application/json'
              },
              body: body || undefined
            });

            // Obter o conteúdo da resposta
            const responseText = await response.text();
            
            // Log da resposta
            console.log(`Status da resposta: ${response.status}`);
            console.log(`Cabeçalhos da resposta: ${JSON.stringify([...response.headers])}`);
            console.log(`Corpo da resposta: ${responseText}`);

            // Verificar se a resposta é JSON válido
            let responseData;
            try {
              responseData = JSON.parse(responseText);
            } catch (e) {
              console.error("Resposta não é JSON válido:", e);
              console.error("Resposta recebida:", responseText);
              
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
