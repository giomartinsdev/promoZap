import Redis from 'ioredis';
import { Client, Message as WhatsAppMessage, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

interface Message {
  id: string;
  body: string;
  from: string;
  timestamp: number;
}

class MessageRepository {
  private publisher: Redis;
  private subscriber: Redis;
  private whatsappClient: Client;
  
  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Inicializa o cliente Redis para publicação
    this.publisher = new Redis(redisUrl);
    
    // Inicializa o cliente Redis para assinatura
    this.subscriber = new Redis(redisUrl);
    
    // Inicializa o cliente WhatsApp Web
    this.whatsappClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
  }
  
  async connect(): Promise<void> {
    try {
      // Verifica a conexão com o Redis
      await this.publisher.ping();
      await this.subscriber.ping();
      
      // Inscreve o subscriber no canal de mensagens do WhatsApp
      await this.subscriber.subscribe('whatsapp_in_raw');
      
      console.log('Conectado ao Redis com sucesso');
      
      // Configura os eventos do WhatsApp Web
      this.setupWhatsAppEvents();
      
      // Inicializa o cliente WhatsApp Web
      await this.whatsappClient.initialize();
      
      console.log('Cliente WhatsApp Web inicializado');
    } catch (error) {
      console.error('Erro ao conectar aos serviços:', error);
      throw error;
    }
  }
  
  private setupWhatsAppEvents(): void {
    // Evento de QR Code
    this.whatsappClient.on('qr', (qr) => {
      console.log('QR Code recebido, escaneie com seu WhatsApp:');
      qrcode.generate(qr, { small: true });
    });
    
    // Evento de autenticação
    this.whatsappClient.on('authenticated', () => {
      console.log('Autenticado com sucesso no WhatsApp Web');
    });
    
    // Evento de falha na autenticação
    this.whatsappClient.on('auth_failure', (msg) => {
      console.error('Falha na autenticação:', msg);
    });
    
    // Evento de pronto
    this.whatsappClient.on('ready', () => {
      console.log('Cliente WhatsApp Web pronto para receber mensagens');
    });
    
    // Evento de mensagem recebida
    this.whatsappClient.on('message', async (msg: WhatsAppMessage) => {
      try {
        // Converte a mensagem do WhatsApp para o formato da aplicação
        const message: Message = {
          id: msg.id.id,
          body: msg.body,
          from: msg.from,
          timestamp: msg.timestamp
        };
        
        // Publica a mensagem no Redis
        await this.publishMessage(message);
      } catch (error) {
        console.error('Erro ao processar mensagem do WhatsApp:', error);
      }
    });
  }
  
  async disconnect(): Promise<void> {
    try {
      // Desconecta do Redis
      await this.publisher.quit();
      await this.subscriber.quit();
      console.log('Desconectado do Redis com sucesso');
      
      // Desconecta do WhatsApp Web
      await this.whatsappClient.destroy();
      console.log('Desconectado do WhatsApp Web com sucesso');
    } catch (error) {
      console.error('Erro ao desconectar dos serviços:', error);
      throw error;
    }
  }
  
  async publishMessage(message: Message): Promise<void> {
    try {
      // Publica a mensagem no canal de mensagens brutas do WhatsApp
      await this.publisher.publish('whatsapp_in_raw', JSON.stringify(message));
      
      console.log(`Mensagem ${message.id} publicada no canal whatsapp_in_raw`);
    } catch (error) {
      console.error('Erro ao publicar mensagem:', error);
      throw error;
    }
  }
  
  async startProcessingMessages(): Promise<void> {
    try {
      this.subscriber.on('message', (channel: unknown, message: any) => {
        if (!message) return;
        
        const parsedMessage: Message = JSON.parse(message);
        console.log(`Mensagem recebida: ${parsedMessage.id} de ${parsedMessage.from}`);
        console.log(`Conteúdo: ${parsedMessage.body}`);

        // Envia a mensagem para o agente de IA para processamento usando request
        

        console.log('Mensagem enviada para processamento pelo agente de IA');
      });
      
      console.log('Iniciado processamento de mensagens');
    } catch (error) {
      console.error('Erro ao processar mensagens:', error);
      throw error;
    }
  }
}

export { MessageRepository, Message };