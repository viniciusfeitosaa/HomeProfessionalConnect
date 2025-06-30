import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync } from 'fs';

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

function copyFolderSync(from, to) {
  if (!existsSync(to)) {
    mkdirSync(to, { recursive: true });
  }
  for (const entry of readdirSync(from)) {
    const srcPath = join(from, entry);
    const destPath = join(to, entry);
    if (statSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function fixImportsInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    // Substituir imports de ../shared/schema.js para ./shared/schema.js
    content = content.replace(/from ['"]\.\.\/shared\/schema\.js['"]/g, "from './shared/schema.js'");
    writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Erro ao corrigir imports em ${filePath}:`, error.message);
  }
}

function fixImportsInDist(distPath) {
  if (existsSync(distPath)) {
    for (const entry of readdirSync(distPath)) {
      const fullPath = join(distPath, entry);
      if (statSync(fullPath).isDirectory()) {
        fixImportsInDist(fullPath);
      } else if (entry.endsWith('.js')) {
        fixImportsInFile(fullPath);
      }
    }
  }
}

async function build() {
  try {
    console.log('🚀 [build.js] INICIANDO SCRIPT DE BUILD GERAL.');
    
    // Fazer build do server
    console.log('\n🔨 [build.js] Preparando para executar o build do server...');
    await runCommand('npm', ['run', 'build:render'], join(__dirname, 'server'));
    console.log('✅ [build.js] Build do server (tsc) concluído.');
    
    // Copiar a pasta shared para dentro de dist
    console.log('\n📁 [build.js] Copiando a pasta shared para server/dist/shared...');
    const sharedSrc = join(__dirname, 'shared');
    const sharedDest = join(__dirname, 'server', 'dist', 'shared');
    copyFolderSync(sharedSrc, sharedDest);
    console.log('✅ [build.js] Pasta shared copiada com sucesso.');
    
    // Corrigir imports nos arquivos compilados
    console.log('\n🔧 [build.js] Corrigindo imports nos arquivos JS compilados...');
    const distPath = join(__dirname, 'server', 'dist');
    fixImportsInDist(distPath);
    console.log('✅ [build.js] Imports corrigidos com sucesso.');
    
    console.log('\n\n🎉 [build.js] SCRIPT DE BUILD GERAL CONCLUÍDO COM SUCESSO! A PASTA DIST ESTÁ PRONTA.');
  } catch (error) {
    console.error('\n❌ [build.js] ERRO FATAL DURANTE O BUILD:', error.message);
    process.exit(1);
  }
}

build(); 