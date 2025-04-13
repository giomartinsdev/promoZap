import { MessageRepository } from './MessageRepository';

async function main() {
  try {
    console.log('Iniciando PromoZap - Sistema de Processamento de Mensagens com WhatsApp Web');
    
    // Inicializa o repositório de mensagens
    const messageRepo = new MessageRepository();
    
    // Conecta ao Redis e inicializa o cliente WhatsApp Web
    await messageRepo.connect();
    
    // Inicia o processamento de mensagens
    await messageRepo.startProcessingMessages();
    
    console.log('Sistema iniciado com sucesso. Aguardando mensagens do WhatsApp...');
    
    // Mantém o processo rodando
    process.on('SIGINT', async () => {
      console.log('Encerrando aplicação...');
      await messageRepo.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Erro ao iniciar o sistema:', error);
    process.exit(1);
  }
}

main();