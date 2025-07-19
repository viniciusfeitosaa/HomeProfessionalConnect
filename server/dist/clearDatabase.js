import { db } from "./db.js";
import { serviceRequests, professionals, users, conversations, messages } from "./schema.js";
export async function clearDatabase() {
    console.log("🧹 Iniciando limpeza completa do banco de dados...");
    try {
        // Limpar dados em ordem para evitar problemas de foreign key
        console.log("🗑️ Removendo solicitações de serviço...");
        await db.delete(serviceRequests);
        console.log("🗑️ Removendo mensagens...");
        await db.delete(messages);
        console.log("🗑️ Removendo conversas...");
        await db.delete(conversations);
        console.log("🗑️ Removendo profissionais...");
        await db.delete(professionals);
        console.log("🗑️ Removendo usuários...");
        await db.delete(users);
        console.log("✅ Banco de dados limpo com sucesso!");
        console.log("📝 Agora apenas usuários reais podem se registrar e criar solicitações.");
    }
    catch (error) {
        console.error("❌ Erro ao limpar banco de dados:", error);
    }
}
// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    clearDatabase().then(() => {
        console.log("🏁 Script de limpeza concluído.");
        process.exit(0);
    }).catch((error) => {
        console.error("💥 Erro fatal:", error);
        process.exit(1);
    });
}
