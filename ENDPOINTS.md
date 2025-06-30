# Lista de Endpoints Disponíveis na API

## Configuração Inicial

### 1. Configurar variáveis de ambiente no arquivo .env:

```
DB_HOST=seu-rds-endpoint.amazonaws.com
DB_USER=admin
DB_PASSWORD=sua_senha_mysql
DB_NAME=produtos_db
DB_PORT=3306
```

### 2. Configurar Security Group da EC2:

- Adicionar regra de SAÍDA para porta 3306 (MySQL)

## Endpoints MySQL (CRUD Produtos)

### Base URL: `/produtos`

#### 1. Testar Conexão MySQL

- **GET** `/mysql/testar-conexao`
- Testa se a conexão com o MySQL RDS está funcionando

#### 2. Inicializar Banco de Dados

- **POST** `/init-db`
- Cria a tabela produto se ela não existir

#### 3. Listar todos os produtos

- **GET** `/produtos`
- Retorna todos os produtos cadastrados

#### 4. Buscar produto por ID

- **GET** `/produtos/{id}`
- Retorna um produto específico pelo ID

#### 5. Criar novo produto

- **POST** `/produtos`
- Body JSON:

```json
{
  "nome": "Nome do produto",
  "descricao": "Descrição do produto",
  "preco": 99.99
}
```

#### 6. Atualizar produto

- **PUT** `/produtos/{id}`
- Body JSON:

```json
{
  "nome": "Nome atualizado",
  "descricao": "Descrição atualizada",
  "preco": 199.99
}
```

#### 7. Deletar produto

- **DELETE** `/produtos/{id}`
- Remove um produto específico

## Endpoints MongoDB (CRUD Usuários)

### Base URL: `/usuarios`

#### 1. Testar Conexão MongoDB

- **GET** `/mongodb/testar-conexao`

#### 2. CRUD Usuários

- **GET** `/usuarios` - Listar todos
- **GET** `/usuarios/{id}` - Buscar por ID
- **POST** `/usuarios` - Criar novo
- **PUT** `/usuarios/{id}` - Atualizar
- **DELETE** `/usuarios/{id}` - Deletar

## Endpoints S3 (Buckets)

#### 1. Listar buckets

- **GET** `/buckets`

#### 2. Listar objetos de um bucket

- **GET** `/buckets/{bucketName}`

#### 3. Upload de arquivo

- **POST** `/buckets/{bucketName}/upload`

#### 4. Deletar arquivo

- **DELETE** `/buckets/{bucketName}/file/{fileName}`

## Documentação Swagger

Acesse: `http://localhost:3000/swagger` para ver a documentação completa com interface interativa.

## Schema da Tabela Produto (MySQL)

```sql
CREATE TABLE produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL
);
```

## Exemplo de Teste com cURL

```bash
# Testar conexão MySQL
curl http://localhost:3000/mysql/testar-conexao

# Inicializar banco
curl -X POST http://localhost:3000/init-db

# Criar produto
curl -X POST http://localhost:3000/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Notebook Dell",
    "descricao": "Notebook Dell Inspiron 15",
    "preco": 2500.99
  }'

# Listar produtos
curl http://localhost:3000/produtos
```
