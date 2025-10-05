const db = require('../dataBase/connection');

module.exports = {
  async listarUsuario(request, response) {
    try {
      const sql = 'SELECT usu_id, usu_nome, usu_email, usu_cpf FROM usuarios;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de usuários',
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

  async listarUsuarioPorId(request, response) {
    try {
      const { usu_id } = request.params;
      const sql = 'SELECT usu_id, usu_nome, usu_email, usu_cpf FROM usuarios WHERE usu_id = ?;';
      const values = [usu_id];
      const [rows] = await db.query(sql, values);

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
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },


  async loginUsuario(request, response) {
    try {
      const { usu_email, usu_senha } = request.body;

      if (!usu_email || !usu_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e senha são obrigatórios.'
        });
      }

      const sql = 'SELECT usu_id, usu_nome, usu_email, usu_senha FROM usuarios WHERE usu_email = ?;';
      const values = [usu_email];
      const [rows] = await db.query(sql, values);

      if (rows.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado.'
        });
      }

      const usuario = rows[0];

      // LÓGICA DE SENHA REVERTIDA PARA TEXTO PLANO
      if (usu_senha !== usuario.usu_senha) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas.'
        });
      }
      
      delete usuario.usu_senha;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso.',
        dados: usuario
      });

    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async cadastrarUsuario(request, response) {
    try {
      const { usu_nome, usu_email, usu_senha, usu_cpf } = request.body;

      // LÓGICA DE SENHA REVERTIDA PARA TEXTO PLANO
      const sql = 'INSERT INTO usuarios (usu_nome, usu_email, usu_senha, usu_cpf) VALUES (?, ?, ?, ?);';
      const values = [usu_nome, usu_email, usu_senha, usu_cpf];
      
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário cadastrado com sucesso.',
        dados: { usu_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarUsuario(request, response) {
    try {
      const { usu_nome, usu_email } = request.body;
      const { usu_id } = request.params;

      // --- DEPURAÇÃO: Vamos ver se os dados estão a chegar corretamente ---
      console.log(`--- Tentando editar usuário ID: ${usu_id} ---`);
      console.log("Dados recebidos no body:", { usu_nome, usu_email });

      // Verificação de segurança básica
      if (!usu_nome || !usu_email) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nome e e-mail são obrigatórios.'
        });
      }
      
      const sql = 'UPDATE usuarios SET usu_nome = ?, usu_email = ? WHERE usu_id = ?;';
      const values = [usu_nome, usu_email, usu_id];
      const [rows] = await db.query(sql, values);
      
      // --- DEPURAÇÃO: Ver o que o banco de dados retornou ---
      console.log("Resultado da query de UPDATE:", rows);

      // CORREÇÃO: Verifique se alguma linha foi de facto afetada
      if (rows.affectedRows > 0) {
        // Sucesso real!
        return response.status(200).json({
          sucesso: true,
          mensagem: 'Utilizador editado com sucesso.',
        });
      } else {
        // O comando executou, mas nenhum utilizador com esse ID foi encontrado
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Utilizador não encontrado para alteração.'
        });
      }
      
    } catch (error) {
      console.error("ERRO ao editar usuário:", error);
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async apagarUsuario(request, response) {
    try {
      const { usu_id } = request.params;
      const sql = 'DELETE FROM usuarios WHERE usu_id = ?;';
      const values = [usu_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário apagado com sucesso.',
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  }
};