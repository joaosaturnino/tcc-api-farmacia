CREATE DATABASE IF NOT EXISTS pharmax;
USE pharmax; 

-- drop database pharmax;

-- Cidade
CREATE TABLE cidade (
    cidade_id INT AUTO_INCREMENT PRIMARY KEY,
    nome_cidade VARCHAR(50) NOT NULL,
    uf_sigla CHAR(2) NOT NULL
);

-- Tipo de Produto
CREATE TABLE tipo_produto (
    tipo_id INT AUTO_INCREMENT PRIMARY KEY,
    nome_tipo VARCHAR(50) NOT NULL
);

-- Forma Farmacêutica
CREATE TABLE forma_farmaceutica (
    forma_id INT AUTO_INCREMENT PRIMARY KEY,
    forma_nome VARCHAR(50) NOT NULL
);

-- Laboratório
CREATE TABLE laboratorios (
    lab_id INT PRIMARY KEY AUTO_INCREMENT,
    lab_nome VARCHAR(255) NOT NULL,
    lab_cnpj VARCHAR(18) NOT NULL UNIQUE,
    lab_endereco VARCHAR(100) NOT NULL,
    lab_telefone VARCHAR(20) NULL,
    lab_email VARCHAR(255) NOT NULL UNIQUE,
    lab_logo VARCHAR(500) NULL,
    lab_dtcad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lab_dtatua TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lab_ativo BOOLEAN DEFAULT TRUE
);
select * from laboratorios;
-- select * from usuarios;
-- drop table favoritos;
-- Usuários
CREATE TABLE usuarios (
    usu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_nome VARCHAR(80) NOT NULL,
    usu_email VARCHAR(100) NOT NULL,
    usu_senha VARCHAR(48) NOT NULL,
    usu_cpf CHAR(11) UNIQUE
);

-- Farmácia (criada antes de funcionários devido à dependência de FK)
CREATE TABLE farmacia (
    farm_id INT PRIMARY KEY AUTO_INCREMENT,
    farm_nome VARCHAR(255) NOT NULL,
    farm_cnpj VARCHAR(18) NOT NULL UNIQUE,
    farm_endereco TEXT NOT NULL,
    farm_telefone VARCHAR(20) NOT NULL,
    farm_email VARCHAR(255) NOT NULL UNIQUE,
    farm_senha VARCHAR(255) NOT NULL,
    farm_logo VARCHAR(500) NULL,
    farm_dtcad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    farm_dtatua TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    farm_ativo BOOLEAN DEFAULT TRUE
);

-- Funcionários
CREATE TABLE funcionarios (
    fun_id INT PRIMARY KEY AUTO_INCREMENT,
    func_nome VARCHAR(255) NOT NULL,
    func_email VARCHAR(255) NOT NULL UNIQUE,
    func_telefone VARCHAR(20) NOT NULL,
    func_cpf VARCHAR(14) NOT NULL UNIQUE,
    func_dtnasc DATE NOT NULL,
    func_endereco TEXT NOT NULL,
    func_usuario VARCHAR(50) NOT NULL UNIQUE,
    func_senha VARCHAR(255) NOT NULL,
    func_nivel ENUM('Funcionário', 'Farnacêutico', 'Administrador') DEFAULT 'Farnacêutico',
    func_dtcad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    func_dtatua TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    func_ativo BOOLEAN DEFAULT TRUE
);

-- Medicamento
CREATE TABLE medicamento (
    med_id INT PRIMARY KEY AUTO_INCREMENT,
    med_nome VARCHAR(255) NOT NULL,
    med_dosagem VARCHAR(50) NOT NULL,
    med_quantidade INT NOT NULL,
    med_descricao TEXT NOT NULL,
    med_imagem VARCHAR(500) NULL,
    farma_codigobarras VARCHAR(14) NOT NULL UNIQUE,
    farm_dtcad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    farm_dtatua TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    farm_ativo BOOLEAN DEFAULT TRUE
);


-- Tabela Intermediária: MedPrecos
CREATE TABLE medpreco (
    medpreco_id INT AUTO_INCREMENT PRIMARY KEY,
    farmacia_id INT NOT NULL,
    med_id INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (farmacia_id) REFERENCES farmacia(farm_id),
    FOREIGN KEY (med_id) REFERENCES medicamento(med_id)
);

-- Promoção
CREATE TABLE promocao (
    promo_id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    med_id INT NOT NULL,
    promo_desconto DECIMAL(10,2),
    promo_inicio DATE,
    promo_fim DATE,
    FOREIGN KEY (farm_id) REFERENCES farmacia(farm_id),
    FOREIGN KEY (med_id) REFERENCES medicamento(med_id)
);

-- Avaliação
CREATE TABLE avaliacao (
    ava_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_id INT NOT NULL,
    far_id INT NOT NULL,
    nota TINYINT,
    ava_comentario VARCHAR(100),
    FOREIGN KEY (usu_id) REFERENCES usuarios(usu_id),
    FOREIGN KEY (far_id) REFERENCES farmacia(farm_id)
);

-- Favoritos (corrigido)
CREATE TABLE favoritos (
    fav_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_id INT NOT NULL,
    far_id INT NOT NULL,
    med_id INT NOT NULL,
    FOREIGN KEY (usu_id) REFERENCES usuarios(usu_id),
    FOREIGN KEY (far_id) REFERENCES farmacia(farm_id),
    FOREIGN KEY (med_id) REFERENCES medicamento(med_id)
);