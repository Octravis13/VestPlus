-- Usar o banco de dados
USE vest_plus_db;

-- Exemplo: Criar tabelas necessárias para sua aplicação
-- (Adapte conforme suas necessidades)

-- Tabela de usuários (exemplo)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicione suas outras tabelas aqui conforme necessário

SELECT 'Tabelas criadas com sucesso!' as status;
