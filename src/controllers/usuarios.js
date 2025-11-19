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
        
        console.log("------------------------------------------------");
        console.log(`📢 RECEBI PEDIDO PARA BUSCAR ID: ${usu_id}`);

        const sql = 'SELECT usu_id, usu_nome, usu_email, usu_cpf FROM usuarios WHERE usu_id = ?;';
        const values = [usu_id];
        const [rows] = await db.query(sql, values);

        console.log("🔍 O BANCO DEVOLVEU:", rows); 

        if (rows.length === 0) {
            console.log("❌ NENHUM USUÁRIO ENCONTRADO COM ESSE ID.");
            return response.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.',
            });
        }

        console.log("✅ ENVIANDO DADOS PARA O CELULAR...");
        return response.status(200).json({
            sucesso: true,
            mensagem: 'Usuário encontrado.',
            dados: rows[0] 
        });

    } catch (error) {
        console.error("🔥 ERRO CRÍTICO NO CONTROLLER:", error);
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
      const { usu_id } = request.params;
      const { usu_nome, usu_email, usu_cpf } = request.body; 

      if (!usu_nome || !usu_email) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nome e e-mail são obrigatórios.'
        });
      }
      
      const sql = 'UPDATE usuarios SET usu_nome = ?, usu_email = ?, usu_cpf = ? WHERE usu_id = ?;';
      const values = [usu_nome, usu_email, usu_cpf, usu_id];
      
      const [rows] = await db.query(sql, values);
      
      if (rows.affectedRows > 0) {
        return response.status(200).json({
          sucesso: true,
          mensagem: 'Usuário editado com sucesso.',
        });
      } else {
        // NOTA: Se os dados forem iguais aos que já estão no banco, affectedRows será 0.
        // Aqui tratamos como "Usuário não encontrado" ou "Nada mudou", mas para o App está ok.
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Nenhum dado foi alterado ou usuário não encontrado.'
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

  async redefinirSenha(request, response) {
    try {
      const { email, novaSenha } = request.body;

      if (!email || !novaSenha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e nova senha são obrigatórios.'
        });
      }

      const sql = 'UPDATE usuarios SET usu_senha = ? WHERE usu_email = ?;';
      const values = [novaSenha, email];
      
      const [rows] = await db.query(sql, values);

      if (rows.affectedRows > 0) {
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