import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Muda para o diretório server
process.chdir(join(__dirname, 'server'));

// Inicia o servidor
const child = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
}); 