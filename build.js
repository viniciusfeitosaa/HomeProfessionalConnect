import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runCommand(command, args, cwd = __dirname) {
  return new Promise((resolve, reject) => {
    console.log(`Executando: ${command} ${args.join(' ')} em ${cwd}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: cwd
    });

    child.on('error', (error) => {
      console.error(`Erro ao executar ${command}:`, error);
      reject(error);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ ${command} executado com sucesso`);
        resolve();
      } else {
        console.error(`❌ ${command} falhou com código ${code}`);
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });
  });
}

async function build() {
  try {
    console.log('🚀 Iniciando build do TypeScript...');
    
    // Fazer build do server
    console.log('\n🔨 Fazendo build do server...');
    await runCommand('npm', ['run', 'build:render'], join(__dirname, 'server'));
    
    console.log('\n✅ Build concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante o build:', error.message);
    process.exit(1);
  }
}

build(); 