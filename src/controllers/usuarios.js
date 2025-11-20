const db = require('../dataBase/connection');
const bcrypt = require('bcrypt'); // Biblioteca para criptografia segura

module.exports = {
    // ==================================================================
    // LISTAR TODOS OS USUÁRIOS
    // ==================================================================
    async listarUsuario(request, response) {
        try {
            // Seleciona apenas campos não sensíveis
            const sql = 'SELECT usu_id, usu_nome, usu_email, usu_cpf FROM usuarios;';
            const [rows] = await db.query(sql);
            
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de usuários recuperada.',
                itens: rows.length,
                dados: rows
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },

    // ==================================================================
    // BUSCAR USUÁRIO POR ID
    // ==================================================================
    async listarUsuarioPorId(request, response) {
        try {
            const { usu_id } = request.params;

            const sql = 'SELECT usu_id, usu_nome, usu_email, usu_cpf FROM usuarios WHERE usu_id = ?;';
            const [rows] = await db.query(sql, [usu_id]);

            if (rows.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado.',
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Usuário encontrado.',
                dados: rows[0]
            });

        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },

    // ==================================================================
    // LOGIN (COM CRIPTOGRAFIA)
    // ==================================================================
    async loginUsuario(request, response) {
        try {
            const { usu_email, usu_senha } = request.body;

            if (!usu_email || !usu_senha) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'E-mail e senha são obrigatórios.'
                });
            }

            // Busca o usuário e a SENHA (hash) para comparação
            const sql = 'SELECT usu_id, usu_nome, usu_email, usu_cpf, usu_senha FROM usuarios WHERE usu_email = ?;';
            const [rows] = await db.query(sql, [usu_email]);

            if (rows.length === 0) {
                return response.status(401).json({ // 401 = Não autorizado
                    sucesso: false,
                    mensagem: 'Credenciais inválidas.'
                });
            }

            const usuario = rows[0];

            // Compara a senha digitada com o hash salvo no banco
            const senhaCorreta = await bcrypt.compare(usu_senha, usuario.usu_senha);

            if (!senhaCorreta) {
                return response.status(401).json({
                    sucesso: false,
                    mensagem: 'Credenciais inválidas.'
                });
            }

            // Remove a senha do objeto antes de enviar para o cliente (Segurança)
            delete usuario.usu_senha; 

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso.',
                dados: usuario
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro no login.',
                dados: error.message
            });
        }
    },

    // ==================================================================
    // CADASTRAR (COM CRIPTOGRAFIA)
    // ==================================================================
    async cadastrarUsuario(request, response) {
        try {
            const { usu_nome, usu_email, usu_senha, usu_cpf } = request.body;

            if (!usu_nome || !usu_email || !usu_senha || !usu_cpf) {
                 return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Todos os campos são obrigatórios.'
                });
            }

            // 1. Verifica se já existe usuário com esse e-mail ou CPF
            const sqlCheck = 'SELECT usu_id FROM usuarios WHERE usu_email = ? OR usu_cpf = ?';
            const [existing] = await db.query(sqlCheck, [usu_email, usu_cpf]);

            if (existing.length > 0) {
                return response.status(409).json({ // 409 = Conflict
                    sucesso: false,
                    mensagem: 'E-mail ou CPF já cadastrados.'
                });
            }

            // 2. Criptografa a senha
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(usu_senha, salt);

            // 3. Insere no banco
            const sql = 'INSERT INTO usuarios (usu_nome, usu_email, usu_senha, usu_cpf) VALUES (?, ?, ?, ?);';
            const values = [usu_nome, usu_email, senhaCriptografada, usu_cpf];

            const [result] = await db.query(sql, values);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Usuário cadastrado com sucesso.',
                dados: { usu_id: result.insertId }
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar usuário.',
                dados: error.message
            });
        }
    },

    // ==================================================================
    // EDITAR USUÁRIO
    // ==================================================================
    async editarUsuario(request, response) {
        try {
            const { usu_id } = request.params;
            const { usu_nome, usu_email, usu_cpf } = request.body;

            if (!usu_nome || !usu_email || !usu_cpf) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nome, e-mail e CPF são obrigatórios para edição.'
                });
            }

            const sql = 'UPDATE usuarios SET usu_nome = ?, usu_email = ?, usu_cpf = ? WHERE usu_id = ?;';
            const values = [usu_nome, usu_email, usu_cpf, usu_id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows > 0) {
                return response.status(200).json({
                    sucesso: true,
                    mensagem: 'Usuário atualizado com sucesso.',
                });
            } else {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado.'
                });
            }

        } catch (error) {
            // Tratamento para caso tente editar para um email/cpf que já existe em outro usuário
            if (error.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'E-mail ou CPF já pertencem a outro usuário.'
                });
            }
            console.error("ERRO ao editar usuário:", error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },

    // ==================================================================
    // REDEFINIR SENHA (ESQUECI MINHA SENHA)
    // ==================================================================
    async redefinirSenha(request, response) {
        try {
            const { email, novaSenha } = request.body;

            if (!email || !novaSenha) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'E-mail e nova senha são obrigatórios.'
                });
            }
            
            if (novaSenha.length < 6) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'A senha deve ter no mínimo 6 caracteres.'
                });
            }

            // Criptografa a nova senha
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(novaSenha, salt);

            const sql = 'UPDATE usuarios SET usu_senha = ? WHERE usu_email = ?;';
            const [result] = await db.query(sql, [senhaCriptografada, email]);

            if (result.affectedRows > 0) {
                return response.status(200).json({
                    sucesso: true,
                    mensagem: 'Senha redefinida com sucesso!'
                });
            } else {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'E-mail não encontrado.'
                });
            }

        } catch (error) {
            console.error("ERRO ao redefinir senha:", error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao redefinir senha.',
                dados: error.message
            });
        }
    },

    // ==================================================================
    // APAGAR USUÁRIO
    // ==================================================================
    async apagarUsuario(request, response) {
        try {
            const { usu_id } = request.params;
            const sql = 'DELETE FROM usuarios WHERE usu_id = ?;';
            
            const [result] = await db.query(sql, [usu_id]);
            
            if (result.affectedRows > 0) {
                return response.status(200).json({
                    sucesso: true,
                    mensagem: 'Usuário apagado com sucesso.'
                });
            } else {
                 return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado.'
                });
            }
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    }
};