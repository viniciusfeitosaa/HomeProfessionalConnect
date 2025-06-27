const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor LifeBee...');

// Navega para a pasta server
process.chdir(path.join(__dirname, 'server'));

console.log('📁 Diretório atual:', process.cwd());

// Verifica se o arquivo de build existe
const fs = require('fs');
const buildPath = path.join(process.cwd(), 'dist', 'index.js');

if (!fs.existsSync(buildPath)) {
    console.error('❌ Arquivo de build não encontrado:', buildPath);
    console.log('📁 Conteúdo da pasta server:');
    console.log(fs.readdirSync(process.cwd()));
    console.log('📁 Conteúdo da pasta dist (se existir):');
    try {
        console.log(fs.readdirSync(path.join(process.cwd(), 'dist')));
    } catch (error) {
        console.log('Pasta dist não existe');
    }
    process.exit(1);
}

console.log('✅ Arquivo de build encontrado, iniciando servidor...');

// Inicia o servidor
const server = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

server.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`Servidor encerrado com código: ${code}`);
    process.exit(code);
}); 