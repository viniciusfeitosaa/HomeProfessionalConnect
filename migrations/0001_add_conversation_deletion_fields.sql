-- Adicionar campos para exclusão individual de conversas
ALTER TABLE "conversations" ADD COLUMN "deleted_by_client" boolean DEFAULT false;
ALTER TABLE "conversations" ADD COLUMN "deleted_by_professional" boolean DEFAULT false; 