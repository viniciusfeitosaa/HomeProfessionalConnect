const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor no Render...');

try {
  // Navegar para o diretório server
  process.chdir(path.join(__dirname, 'server'));
  console.log('📁 Diretório atual:', process.cwd());

  // Compilar o TypeScript do servidor
  console.log('🔨 Compilando TypeScript do servidor...');
  execSync('npm run build', { stdio: 'inherit' });



  // Iniciar o servidor
  console.log('🌐 Iniciando servidor...');
  execSync('node dist/index.js', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Erro durante inicialização:', error.message);
  process.exit(1);
} 