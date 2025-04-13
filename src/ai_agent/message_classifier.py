import json
import os
import redis
from typing import Dict, Any
import time

# Em um cenário real, usaríamos uma biblioteca de ML como scikit-learn, tensorflow, etc.
# Para este exemplo, usaremos uma abordagem simplificada baseada em palavras-chave

class MessageClassifier:
    def __init__(self, redis_url: str = 'redis://redis:6379'):
        self.redis_url = redis_url
        self.redis_client = None
        self.pubsub = None
        
    def connect(self):
        """Conecta aos canais Redis"""
        # Configuração do cliente Redis
        self.redis_client = redis.Redis.from_url(self.redis_url)
        
        # Configuração do PubSub para inscrição em canais
        self.pubsub = self.redis_client.pubsub()
        self.pubsub.subscribe('whatsapp_in_raw')
        
        print("Conectado ao Redis com sucesso")
        
    def classify_message(self, message: Dict[str, Any]) -> str:
        """Classifica a mensagem como promoção ou ordem de compra"""
        # Palavras-chave para identificar promoções
        promo_keywords = [
            'promoção', 'desconto', 'oferta', 'liquidação', 'black friday',
            'imperdível', 'aproveite', 'só hoje', 'tempo limitado', 'sale',
            'preço baixo', 'oportunidade', 'economize', 'grátis', 'frete grátis'
        ]
        
        # Palavras-chave para identificar ordens de compra
        order_keywords = [
            'quero comprar', 'comprar', 'pedido', 'encomenda', 'encomendar',
            'adquirir', 'pedir', 'reservar', 'pagamento', 'boleto',
            'cartão', 'pix', 'transferência', 'entrega', 'envio'
        ]
        
        message_text = message['body'].lower()
        
        # Conta ocorrências de palavras-chave
        promo_count = sum(1 for keyword in promo_keywords if keyword in message_text)
        order_count = sum(1 for keyword in order_keywords if keyword in message_text)
        
        # Determina a classificação com base na contagem
        if promo_count > order_count:
            return 'promotion'
        elif order_count > promo_count:
            return 'order'
        else:
            # Se empate ou nenhuma palavra-chave encontrada, classifica como outros
            return 'other'
    
    def process_messages(self):
        """Processa mensagens do canal Redis e publica a classificação"""
        print("Iniciando processamento de mensagens...")
        
        try:
            for message in self.pubsub.listen():
                if message['type'] == 'message':
                    message_data = json.loads(message['data'].decode('utf-8'))
                    
                    # Classifica a mensagem
                    classification = self.classify_message(message_data)
                    
                    # Adiciona a classificação à mensagem
                    message_data['classification'] = classification
                    
                    # Publica a mensagem classificada no canal de saída
                    self.redis_client.publish('whatsapp_in_threated', json.dumps(message_data))
                    
                    print(f"Mensagem {message_data['id']} classificada como: {classification}")
        except Exception as e:
            print(f"Erro ao processar mensagens: {e}")
    
    def run(self):
        """Executa o classificador"""
        try:
            self.connect()
            self.process_messages()
        except KeyboardInterrupt:
            print("Encerrando o classificador...")
        except Exception as e:
            print(f"Erro ao executar o classificador: {e}")

if __name__ == "__main__":
    classifier = MessageClassifier()
    classifier.run()