import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando build para o Render...');

try {
  // Navegar para o diretório server
  process.chdir(path.join(__dirname, 'server'));
  console.log('📁 Diretório atual:', process.cwd());

  // Executar build do Render
  console.log('🔨 Executando build do Render...');
  execSync('npm run build:render', { stdio: 'inherit' });

  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
} 