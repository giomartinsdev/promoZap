# PromoZap

Sistema de processamento de mensagens do WhatsApp para identificação de promoções e ordens de compra utilizando Kafka e IA.

## Visão Geral

O PromoZap é um sistema que processa mensagens do WhatsApp, utilizando Kafka como middleware de mensageria e um agente de IA em Python para classificar as mensagens como promoções ou ordens de compra.

### Fluxo de Funcionamento

1. O WhatsApp Messenger produz mensagens para o tópico Kafka `whatsapp_in_raw`
2. O agente de IA em Python consome essas mensagens e as classifica
3. O resultado da classificação é publicado no tópico Kafka `whatsapp_in_threated`

## Estrutura do Projeto

```
promoZap/
├── src/
│   ├── MessageRepository.ts    # Gerencia a conexão com Kafka e processamento de mensagens
│   ├── index.ts                # Ponto de entrada da aplicação
│   └── ai_agent/
│       └── message_classifier.py  # Agente de IA para classificação de mensagens
├── docker-compose.yml          # Configuração dos serviços Docker
├── Dockerfile.node            # Dockerfile para o serviço Node.js
├── Dockerfile.python          # Dockerfile para o serviço Python
├── package.json
└── README.md
```

## Requisitos

- Node.js >= 14.0.0
- Python 3.7+
- Kafka
- Docker e Docker Compose (para execução em contêineres)

## Dependências

### Node.js
- kafkajs

### Python
- kafka-python

## Instalação

### Método Tradicional

```bash
# Instalar dependências Node.js
npm install

# Instalar dependências Python
pip install kafka-python
```

### Usando Docker

Não é necessário instalar dependências manualmente ao usar Docker. Basta executar o comando do Docker Compose.

## Execução

### Método Tradicional

```bash
# Iniciar o serviço Node.js
npm run dev

# Iniciar o agente de IA Python
npm run start:ai-agent
# ou diretamente
python src/ai_agent/message_classifier.py
```

### Usando Docker

```bash
# Iniciar todos os serviços
docker-compose up

# Iniciar em modo detached (background)
docker-compose up -d

# Parar todos os serviços
docker-compose down
```

## Configuração

### Configuração Local

Por padrão, o sistema se conecta ao Kafka em `localhost:9092`. Para alterar essa configuração, modifique os arquivos `MessageRepository.ts` e `message_classifier.py`.

### Configuração Docker

As configurações do ambiente Docker estão definidas no arquivo `docker-compose.yml`. Os serviços estão configurados para se comunicarem através da rede interna `promozap-network`.