/* CREATE DATABASE IF NOT EXISTS pharmax;
USE pharmax; */

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
CREATE TABLE laboratorio (
    lab_id INT AUTO_INCREMENT PRIMARY KEY,
    nome_laboratorio VARCHAR(60) NOT NULL,
    lab_cnpj CHAR(14)
);

-- Usuários
CREATE TABLE usuarios (
    usu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_nome VARCHAR(80) NOT NULL,
    usu_email VARCHAR(100) NOT NULL,
    usu_senha VARCHAR(48) NOT NULL,
    usu_cpf CHAR(11) UNIQUE,
    usu_tipo TINYINT,
    cid_id INT,
    FOREIGN KEY (cid_id) REFERENCES cidade(cidade_id),
    CONSTRAINT chk_usu_tipo CHECK (usu_tipo IN (0, 1, 2))
);

-- Farmácia (criada antes de funcionários devido à dependência de FK)
CREATE TABLE farmacia (
    farm_id INT AUTO_INCREMENT PRIMARY KEY,
    farm_nome VARCHAR(50) NOT NULL,
    farm_endereco VARCHAR(200) NOT NULL,
    farm_telefone VARCHAR(15),
    farm_email VARCHAR(80) NOT NULL,
    farm_senha VARCHAR(48) NOT NULL,
    cnpj CHAR(14) NOT NULL UNIQUE,
    farm_logo VARCHAR(255),
    cid_id INT,
    FOREIGN KEY (cid_id) REFERENCES cidade(cidade_id)
);

-- Funcionários
CREATE TABLE funcionarios (
    func_id INT AUTO_INCREMENT PRIMARY KEY,
    cargo VARCHAR(50) NOT NULL,
    farm_id INT NOT NULL,
    FOREIGN KEY (farm_id) REFERENCES farmacia(farm_id)
);

-- Medicamento
CREATE TABLE medicamento (
    med_id INT AUTO_INCREMENT PRIMARY KEY,
    med_nome VARCHAR(60) NOT NULL,
    med_dosagem VARCHAR(10) NOT NULL,
    med_quantidade VARCHAR(10) NOT NULL,
    forma_id INT NOT NULL,
    descricao VARCHAR(250),
    lab_id INT NOT NULL,
    med_img VARCHAR(255),
    tipo_id INT NOT NULL,
    FOREIGN KEY (forma_id) REFERENCES forma_farmaceutica(forma_id),
    FOREIGN KEY (lab_id) REFERENCES laboratorio(lab_id),
    FOREIGN KEY (tipo_id) REFERENCES tipo_produto(tipo_id)
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
    medpreco_id INT NOT NULL,
    FOREIGN KEY (usu_id) REFERENCES usuarios(usu_id),
    FOREIGN KEY (far_id) REFERENCES farmacia(farm_id),
    FOREIGN KEY (med_id) REFERENCES medicamento(med_id),
    FOREIGN KEY (medpreco_id) REFERENCES medpreco(medpreco_id)
);