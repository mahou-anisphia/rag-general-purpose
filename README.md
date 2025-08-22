# 🌙 KuruBot

**KuruBot** is an intelligent RAG (Retrieval-Augmented Generation) chatbot built with the [T3 Stack](https://create.t3.gg/) that transforms your documents into conversational AI experiences. Upload your PDFs, ask questions, and get accurate, context-aware responses powered by cutting-edge AI technology.

![KuruBot](https://img.shields.io/badge/KuruBot-🌙%20AI%20Assistant-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-000000?logo=nextdotjs&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?logo=trpc&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)

## ✨ Features

### 🤖 **Intelligent Chat Interface**

- Real-time conversations with your documents
- Context-aware responses using RAG technology
- Chat history and conversation management
- Source citations for every response
- Beautiful moon-themed UI with modern design

### 📚 **Document Processing**

- **Support for multiple formats**: PDF, DOCX, TXT, CSV, Markdown
- **Advanced text extraction**: PDF parsing with content preservation
- **Smart chunking**: Optimal text segmentation for better retrieval
- **Vector embeddings**: OpenAI text-embedding-3-large for semantic search
- **File size limit**: Up to 20MB per document

### 🔍 **Advanced Retrieval System**

- **Vector database**: Qdrant for high-performance similarity search
- **Semantic search**: Find relevant content by meaning, not just keywords
- **Configurable scoring**: Adjustable similarity thresholds
- **Multi-document support**: Search across your entire knowledge base
- **Real-time indexing**: Documents are immediately searchable after processing

### 🛡️ **Security & Authentication**

- **Discord OAuth**: Secure authentication via Discord
- **User isolation**: Each user's documents are completely separate
- **Session management**: Secure session handling with NextAuth.js
- **Enterprise-grade storage**: MinIO S3-compatible object storage

### ⚡ **Performance & Scalability**

- **Fast processing**: Efficient document chunking and embedding
- **Real-time responses**: Optimized query processing
- **Scalable architecture**: Built for production workloads
- **Database optimization**: PostgreSQL with proper indexing

## 🏗️ Architecture

KuruBot uses a modern, scalable architecture:

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[🌙 Next.js App<br/>React UI<br/>Tailwind CSS]
    end

    subgraph "API Layer"
        API[⚡ tRPC API<br/>Type-safe Endpoints<br/>Server Actions]
    end

    subgraph "AI Services"
        OpenAI[🤖 OpenAI<br/>Text Embeddings<br/>text-embedding-3-large]
        Anthropic[🧠 Anthropic<br/>Claude 3.5 Sonnet<br/>Chat Responses]
    end

    subgraph "Authentication"
        Auth[🔐 NextAuth.js<br/>Discord OAuth<br/>Session Management]
    end

    subgraph "Data Layer"
        DB[(🗄️ PostgreSQL<br/>Prisma ORM<br/>User Data & Chats)]
        Vector[(🔍 Qdrant<br/>Vector Database<br/>Document Embeddings)]
        Storage[📁 MinIO<br/>S3-Compatible<br/>Document Storage]
    end

    UI --> API
    API --> Auth
    API --> OpenAI
    API --> Anthropic
    API --> DB
    API --> Vector
    API --> Storage

    OpenAI -.-> Vector

    classDef frontend fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    classDef api fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff
    classDef ai fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    classDef auth fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef data fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff

    class UI frontend
    class API api
    class OpenAI,Anthropic ai
    class Auth auth
    class DB,Vector,Storage data
```

## 🚀 Quick Start (5 Minutes)

### Option 1: Docker (Recommended)

The fastest way to get KuruBot running with all dependencies:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd kurubot

# 2. Run the setup script (automated)
chmod +x setup.sh
./setup.sh

# 3. Add your API keys when prompted, then the script will start everything
```

**Or manually:**

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd kurubot
cp env.example .env

# 2. Add your API keys to .env file
# - Discord OAuth (https://discord.com/developers/applications)
# - OpenAI API key (https://platform.openai.com/api-keys)
# - Anthropic API key (https://console.anthropic.com/)

# 3. Start everything
docker-compose up -d

# 4. Open http://localhost:3000
```

**That's it!** 🎉 All services (PostgreSQL, Qdrant, MinIO) are automatically configured.

### Option 2: Development Setup

For local development with hot reload:

```bash
# 1. Start only the databases
docker-compose -f docker-compose.dev.yml up -d

# 2. Run the app locally
pnpm install
pnpm db:push
pnpm dev
```

### Required API Keys

| Service           | Where to Get                                                    | Required For        |
| ----------------- | --------------------------------------------------------------- | ------------------- |
| **Discord OAuth** | [Developer Portal](https://discord.com/developers/applications) | User authentication |
| **OpenAI**        | [Platform API](https://platform.openai.com/api-keys)            | Document embeddings |
| **Anthropic**     | [Console](https://console.anthropic.com/)                       | Chat responses      |

### Manual Installation (Advanced)

<details>
<summary>Click to expand manual setup instructions</summary>

#### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Qdrant vector database
- MinIO or S3-compatible storage
- Discord OAuth app
- OpenAI API key
- Anthropic API key

#### Steps

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd kurubot
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Configure the following in your `.env` file:

   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Authentication
   AUTH_SECRET="your-secret-key"
   AUTH_DISCORD_ID="your-discord-client-id"
   AUTH_DISCORD_SECRET="your-discord-client-secret"

   # Storage (MinIO/S3)
   MINIO_ENDPOINT="localhost:9000"
   MINIO_ACCESS_KEY="your-access-key"
   MINIO_SECRET_KEY="your-secret-key"
   MINIO_BUCKET="kurubot-documents"

   # Vector Database (Qdrant)
   QDRANT_URL="http://localhost:6333"
   QDRANT_COLLECTION="documents"

   # AI Services
   OPENAI_API_KEY="sk-..."
   OPENAI_EMBEDDING_MODEL="text-embedding-3-large"
   ANTHROPIC_API_KEY="sk-ant-..."
   ANTHROPIC_CLAUDE_MODEL="claude-3-5-sonnet-20241022"
   ```

4. **Set up the database**

   ```bash
   pnpm db:push
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

</details>

## 🛠️ Development

### Available Scripts

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:push` - Push database schema
- `pnpm db:studio` - Open Prisma Studio
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript checks
- `pnpm shadcn:add` - Add shadcn/ui components

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **API**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Discord
- **Storage**: MinIO (S3-compatible)
- **Vector DB**: Qdrant
- **AI**: OpenAI (embeddings), Anthropic Claude (chat)
- **Deployment**: Vercel-ready

## 📖 Usage Guide

### 1. **Upload Documents**

- Navigate to the Admin Panel
- Drag and drop your PDF, DOCX, or text files
- Wait for processing and indexing to complete

### 2. **Start Chatting**

- Go to the Chat interface
- Ask questions about your uploaded documents
- Get intelligent responses with source citations

### 3. **Manage Conversations**

- View all your chat history in the sidebar
- Create new conversations
- Delete old chats when needed

### 4. **Monitor System**

- Check document processing status
- View system statistics
- Debug vector database connections

## 🔧 Configuration

### Document Processing

- **Chunk Size**: 1000 characters
- **Overlap**: 200 characters
- **Embedding Model**: OpenAI text-embedding-3-large (3072 dimensions)
- **Max File Size**: 20MB per file

### RAG Settings

- **Default Sources**: 5 per query
- **Score Threshold**: 0.3 (configurable)
- **Context Window**: Up to 10 recent messages
- **LLM Model**: Claude 3.5 Sonnet

### Vector Database

- **Distance Metric**: Cosine similarity
- **Index Type**: HNSW
- **Collection**: Automatically created on first use

## 🐳 Docker Deployment (Recommended)

The easiest way to get KuruBot running is with Docker Compose, which sets up all required services automatically.

### Quick Start with Docker

1. **Clone and prepare environment**

   ```bash
   git clone <your-repo-url>
   cd kurubot
   cp env.example .env
   ```

2. **Configure required API keys in `.env`**

   ```bash
   # Required: Get from https://discord.com/developers/applications
   AUTH_DISCORD_ID="your-discord-client-id"
   AUTH_DISCORD_SECRET="your-discord-client-secret"

   # Required: Get from https://platform.openai.com/api-keys
   OPENAI_API_KEY="sk-your-openai-api-key-here"

   # Required: Get from https://console.anthropic.com/
   ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key-here"

   # Optional: Change default passwords
   AUTH_SECRET="your-super-secret-auth-secret-here"
   POSTGRES_PASSWORD="your-secure-password"
   MINIO_SECRET_KEY="your-minio-password"
   ```

3. **Start all services**

   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - **KuruBot App**: http://localhost:3000
   - **MinIO Console**: http://localhost:9001 (admin/minioadmin123)
   - **Qdrant Dashboard**: http://localhost:6333/dashboard

### Docker Services Overview

| Service        | Port      | Purpose           | Admin Access                    |
| -------------- | --------- | ----------------- | ------------------------------- |
| **KuruBot**    | 3000      | Main application  | http://localhost:3000           |
| **PostgreSQL** | 5432      | User data & chats | Database only                   |
| **Qdrant**     | 6333      | Vector search     | http://localhost:6333/dashboard |
| **MinIO**      | 9000/9001 | Document storage  | http://localhost:9001           |

### Development with Docker

For development, use the dev compose file that only starts the dependencies:

```bash
# Start only the databases and services
docker-compose -f docker-compose.dev.yml up -d

# Run the app locally
pnpm install
pnpm db:push
pnpm dev
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f kurubot

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Rebuild the application
docker-compose build kurubot

# Update to latest images
docker-compose pull
```

### 🔧 Troubleshooting

#### Common Issues

**1. Port conflicts**

```bash
# Check what's using the ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Change ports in .env file
echo "APP_PORT=3001" >> .env
echo "POSTGRES_PORT=5433" >> .env
```

**2. API key issues**

```bash
# Check if keys are properly loaded
docker-compose logs kurubot | grep -i "api\|key\|auth"

# Verify environment variables
docker-compose exec kurubot printenv | grep -E "(OPENAI|ANTHROPIC|DISCORD)"
```

**3. Database connection issues**

```bash
# Check database status
docker-compose ps postgres
docker-compose logs postgres

# Manual database connection test
docker-compose exec postgres psql -U postgres -d kurubot -c "SELECT 1;"
```

**4. MinIO bucket access**

```bash
# Recreate MinIO bucket
docker-compose restart minio-init

# Check MinIO logs
docker-compose logs minio
```

**5. Qdrant collection issues**

```bash
# Check Qdrant health
curl http://localhost:6333/health

# View collections
curl http://localhost:6333/collections
```

#### Performance Tips

- **Memory**: Allocate at least 4GB RAM for optimal performance
- **Storage**: Use SSD storage for better database performance
- **Network**: Ensure Docker has sufficient network bandwidth
- **CPU**: Multi-core CPU recommended for concurrent document processing

## 🐳 Docker Deployment Guide

This guide provides comprehensive instructions for deploying KuruBot using Docker.

### Architecture Overview

KuruBot's Docker setup includes the following services:

```mermaid
graph TB
    subgraph "Docker Network"
        App[KuruBot App<br/>:3000]
        DB[(PostgreSQL<br/>:5432)]
        Vector[(Qdrant<br/>:6333)]
        Storage[MinIO<br/>:9000/:9001]
        Init[MinIO Init<br/>One-time setup]
    end

    User --> App
    App --> DB
    App --> Vector
    App --> Storage
    Init --> Storage

    classDef app fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef data fill:#ef4444,stroke:#dc2626,color:#fff
    classDef init fill:#10b981,stroke:#047857,color:#fff

    class App app
    class DB,Vector,Storage data
    class Init init
```

### Service Details

#### KuruBot Application

- **Image**: Built from local Dockerfile (T3 Stack optimized)
- **Ports**: 3000
- **Dependencies**: All other services
- **Health Check**: `/api/health` endpoint

#### PostgreSQL Database

- **Image**: `postgres:15-alpine`
- **Ports**: 5432
- **Volume**: `postgres_data`
- **Purpose**: User data, chats, document metadata

#### Qdrant Vector Database

- **Image**: `qdrant/qdrant:v1.8.1`
- **Ports**: 6333 (HTTP), 6334 (gRPC)
- **Volume**: `qdrant_data`
- **Purpose**: Vector embeddings for document search

#### MinIO Object Storage

- **Image**: `minio/minio:RELEASE.2024-01-16T16-07-38Z`
- **Ports**: 9000 (API), 9001 (Console)
- **Volume**: `minio_data`
- **Purpose**: Document file storage

### Environment Variables

#### Required (Must Set)

```bash
# Discord OAuth
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# Anthropic API
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"
```

#### Optional (Have Defaults)

```bash
# Database
POSTGRES_PASSWORD="kurubot_password"
POSTGRES_DB="kurubot"
POSTGRES_PORT="5432"

# Authentication
AUTH_SECRET="your-super-secret-auth-secret-here"

# MinIO
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin123"
MINIO_BUCKET="kurubot-documents"
MINIO_PORT="9000"
MINIO_CONSOLE_PORT="9001"

# Qdrant
QDRANT_COLLECTION="documents"
QDRANT_PORT="6333"
QDRANT_GRPC_PORT="6334"

# AI Models
OPENAI_EMBEDDING_MODEL="text-embedding-3-large"
ANTHROPIC_CLAUDE_MODEL="claude-3-5-sonnet-20241022"

# Application
APP_PORT="3000"
```

### Production Deployment

#### 1. Security Hardening

```bash
# Generate secure passwords
export AUTH_SECRET=$(openssl rand -base64 32)
export POSTGRES_PASSWORD=$(openssl rand -base64 24)
export MINIO_SECRET_KEY=$(openssl rand -base64 24)

# Update .env file
echo "AUTH_SECRET=$AUTH_SECRET" >> .env
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> .env
echo "MINIO_SECRET_KEY=$MINIO_SECRET_KEY" >> .env
```

#### 2. Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  kurubot:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "1.0"
        reservations:
          memory: 1G
          cpus: "0.5"

  postgres:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "0.5"

  qdrant:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "1.0"
```

#### 3. Backup Strategy

```bash
# Database backup
docker-compose exec postgres pg_dump -U postgres kurubot > backup_$(date +%Y%m%d).sql

# Volume backup
docker run --rm -v kurubot_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
docker run --rm -v kurubot_qdrant_data:/data -v $(pwd):/backup alpine tar czf /backup/qdrant_backup.tar.gz /data
docker run --rm -v kurubot_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup.tar.gz /data
```

### Development Setup

For development with hot reload:

```bash
# Start only dependencies
docker-compose up -d postgres qdrant minio minio-init

# Run app locally
pnpm install
pnpm db:push
pnpm dev
```

### Advanced Troubleshooting

#### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec postgres pg_isready -U postgres

# Qdrant health
curl http://localhost:6333/health

# MinIO health
curl http://localhost:9000/minio/health/live
```

#### Debugging

```bash
# Enter containers
docker-compose exec kurubot sh
docker-compose exec postgres psql -U postgres kurubot

# View all logs
docker-compose logs -f

# Check environment variables
docker-compose exec kurubot printenv | grep -E "(DATABASE|QDRANT|MINIO|OPENAI|ANTHROPIC)"
```

### Performance Optimization

#### 1. Database Tuning

Create `postgres.conf`:

```ini
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB

# Connections
max_connections = 100

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### 2. Qdrant Optimization

For large document collections, consider:

- Increasing `shard_number` in collection config
- Using quantization for memory efficiency
- Enabling disk storage for large collections

#### 3. Application Optimization

```dockerfile
# In Dockerfile, add Node.js optimization
ENV NODE_OPTIONS="--max-old-space-size=2048"
```

### Monitoring

#### Basic Monitoring

```bash
# Resource usage
docker stats

# Service health
watch -n 5 'docker-compose ps'

# Log monitoring
docker-compose logs -f --tail=100
```

#### Advanced Monitoring

Consider adding monitoring services:

- Prometheus + Grafana for metrics
- Loki for log aggregation
- AlertManager for notifications

### Scaling

#### Horizontal Scaling

For high-traffic deployments:

1. Use external managed services:
   - Managed PostgreSQL (AWS RDS, Google Cloud SQL)
   - Qdrant Cloud
   - AWS S3 or Google Cloud Storage

2. Load balancer for multiple app instances:

   ```yaml
   services:
     kurubot:
       deploy:
         replicas: 3

     nginx:
       image: nginx:alpine
       # Load balancer configuration
   ```

#### Vertical Scaling

Increase resource limits in docker-compose.yml as needed.

## 🔧 Manual Deployment

### Using Vercel + External Services

1. **Deploy to Vercel**

   ```bash
   vercel deploy
   ```

2. **Set up external services**
   - PostgreSQL (e.g., Supabase, Railway, Neon)
   - Qdrant Cloud or self-hosted
   - S3 or MinIO instance

3. **Configure environment variables** in Vercel dashboard

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the amazing [T3 Stack](https://create.t3.gg/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- AI powered by [OpenAI](https://openai.com/) and [Anthropic](https://anthropic.com/)

---

<div align="center">
  <p>Made with ❤️ and powered by 🌙</p>
  <p><strong>KuruBot - Your Intelligent Document Assistant</strong></p>
</div>
