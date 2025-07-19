import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando servidor no Render...');

try {
  // Navegar para o diretório server
  process.chdir(path.join(__dirname, 'server'));
  console.log('📁 Diretório atual:', process.cwd());

  // Executar o servidor
  console.log('🌐 Iniciando servidor...');
  const server = spawn('npm', ['run', 'render-start'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  });

  server.on('exit', (code) => {
    console.log(`🔄 Servidor encerrado com código ${code}`);
    process.exit(code);
  });

} catch (error) {
  console.error('❌ Erro durante inicialização:', error.message);
  process.exit(1);
} 