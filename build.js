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

  // Instalar dependências do servidor
  console.log('📦 Instalando dependências do servidor...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  // Executar build do servidor
  console.log('🔨 Executando build do servidor...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
} 