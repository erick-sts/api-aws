-- Script SQL para criar a base de dados e tabela produto no MySQL RDS

-- Criar base de dados (se não existir)
CREATE DATABASE IF NOT EXISTS produtos_db;

-- Usar a base de dados
USE produtos_db;

-- Criar tabela produto
CREATE TABLE IF NOT EXISTS produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL
);

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO produto (nome, descricao, preco) VALUES 
('Notebook Dell', 'Notebook Dell Inspiron 15', 2500.99),
('Mouse Logitech', 'Mouse sem fio Logitech MX Master', 299.90),
('Teclado Mecânico', 'Teclado mecânico RGB', 450.00);

-- Verificar se a tabela foi criada corretamente
DESCRIBE produto;

-- Listar produtos inseridos
SELECT * FROM produto;
