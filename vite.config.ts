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
              res.end(JSON.stringify({ error: 'API key is required' }));
              return;
            }

            const response = await fetch(targetUrl, {
              method: req.method,
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: req.method !== 'GET' ? await new Promise((resolve) => {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => resolve(body));
              }) : undefined
            });

            const data = await response.json();
            
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (error) {
            console.error('Proxy error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal proxy error' }));
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
