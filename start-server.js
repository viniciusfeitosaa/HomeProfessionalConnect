import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho para o arquivo compilado do server
const serverPath = join(__dirname, 'server', 'dist', 'index.js');

console.log('🚀 Iniciando servidor...');
console.log(`📁 Caminho do servidor: ${serverPath}`);

// Inicia o servidor diretamente
const child = spawn('node', [serverPath], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

child.on('error', (error) => {
  console.error('❌ Erro ao iniciar o servidor:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Servidor encerrado com código ${code}`);
  }
  process.exit(code);
}); 