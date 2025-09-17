CREATE DATABASE IF NOT EXISTS pharmax;
USE pharmax; 

-- Cidade
CREATE TABLE cidade (
    cidade_id INT AUTO_INCREMENT PRIMARY KEY,
    nome_cidade VARCHAR(150) NOT NULL,
    uf_sigla CHAR(2) NOT NULL
);

-- Tipo de Produto
CREATE TABLE tipo_produto (
    tipo_id INT AUTO_INCREMENT PRIMARY KEY,
    nome_tipo VARCHAR(150) NOT NULL
);

-- Forma Farmacêutica
CREATE TABLE forma_farmaceutica (
    forma_id INT AUTO_INCREMENT PRIMARY KEY,
    forma_nome VARCHAR(150) NOT NULL
);

-- Laboratório
CREATE TABLE laboratorios (
    lab_id INT AUTO_INCREMENT PRIMARY KEY,
    lab_nome VARCHAR(150) NOT NULL,
    lab_cnpj VARCHAR(18) UNIQUE,
    lab_endereco VARCHAR(255),
    lab_telefone VARCHAR(20),
    lab_email VARCHAR(150),
    lab_logo VARCHAR(255),
    lab_data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    lab_data_atualizacao DATETIME ON UPDATE CURRENT_TIMESTAMP,
    lab_ativo BOOLEAN DEFAULT TRUE
);

-- Usuários
CREATE TABLE usuarios (
    usu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_nome VARCHAR(150) NOT NULL,
    usu_email VARCHAR(150) UNIQUE NOT NULL,
    usu_senha VARCHAR(255) NOT NULL,
    usu_cpf VARCHAR(14) UNIQUE
);

-- Farmácia
CREATE TABLE farmacia (
    farm_id INT AUTO_INCREMENT PRIMARY KEY,
    farm_nome VARCHAR(150) NOT NULL,
    farm_cnpj VARCHAR(18) UNIQUE NOT NULL,
    farm_endereco VARCHAR(255),
    farm_telefone VARCHAR(20),
    farm_email VARCHAR(150),
    farm_logo VARCHAR(255),
    farm_cidade_id INT,
    farm_data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    farm_data_atualizacao DATETIME ON UPDATE CURRENT_TIMESTAMP,
    farm_ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (farm_cidade_id) REFERENCES cidade(cidade_id)
);

-- Funcionários
CREATE TABLE funcionario (
    func_id INT AUTO_INCREMENT PRIMARY KEY,
    func_nome VARCHAR(150) NOT NULL,
    func_email VARCHAR(150) UNIQUE,
    func_telefone VARCHAR(20),
    func_cpf VARCHAR(14) UNIQUE,
    func_dtnasc DATE,
    func_endereco VARCHAR(255),
    farmacia_id INT NOT NULL,

    -- Campos de autenticação e controle
    func_usuario VARCHAR(50) NOT NULL UNIQUE,
    func_senha VARCHAR(255) NOT NULL,
    func_nivel ENUM('Funcionário', 'Farmacêutico', 'Administrador') DEFAULT 'Farmacêutico',
    func_data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    func_data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    func_ativo BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (farmacia_id) REFERENCES farmacia(farm_id)
);

-- Medicamento
CREATE TABLE medicamento (
    med_id INT AUTO_INCREMENT PRIMARY KEY,
    med_nome VARCHAR(150) NOT NULL,
    med_dosagem VARCHAR(100),
    med_quantidade VARCHAR(50),
    forma_id INT,
    med_descricao TEXT,
    lab_id INT,
    med_imagem VARCHAR(255),
    tipo_id INT,
    med_data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    med_data_atualizacao DATETIME ON UPDATE CURRENT_TIMESTAMP,
    med_ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (forma_id) REFERENCES forma_farmaceutica(forma_id),
    FOREIGN KEY (lab_id) REFERENCES laboratorios(lab_id),
    FOREIGN KEY (tipo_id) REFERENCES tipo_produto(tipo_id)
);

-- Tabela Intermediária: MedPrecos
CREATE TABLE medpreco (
    medp_id INT AUTO_INCREMENT PRIMARY KEY,
    medicamento_id INT,
    farmacia_id INT,
    medp_preco DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (medicamento_id) REFERENCES medicamento(med_id),
    FOREIGN KEY (farmacia_id) REFERENCES farmacia(farm_id)
);

-- Promoção
CREATE TABLE promocao (
    promo_id INT AUTO_INCREMENT PRIMARY KEY,
    farmacia_id INT,
    medicamento_id INT,
    promo_desconto DECIMAL(5,2),
    promo_inicio DATE,
    promo_fim DATE,
    FOREIGN KEY (farmacia_id) REFERENCES farmacia(farm_id),
    FOREIGN KEY (medicamento_id) REFERENCES medicamento(med_id)
);

-- Avaliação
CREATE TABLE avaliacao (
    ava_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    farmacia_id INT,
    ava_nota DECIMAL(2,1),
    ava_comentario TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usu_id),
    FOREIGN KEY (farmacia_id) REFERENCES farmacia(farm_id)
);

-- Favoritos
CREATE TABLE favoritos (
    fav_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    farmacia_id INT,
    medicamento_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usu_id),
    FOREIGN KEY (farmacia_id) REFERENCES farmacia(farm_id),
    FOREIGN KEY (medicamento_id) REFERENCES medicamento(med_id)
);
