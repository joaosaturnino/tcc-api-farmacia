const db = require("../dataBase/connection");

// Helper para centralizar o tratamento de erros 500
const handleServerError = (response, error) => {
  console.error("Erro no servidor:", error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor.',
    dados: error.message
  });
};

module.exports = {
  // ==================================================================
  // LISTAR FUNCIONÁRIOS DE UMA FARMÁCIA
  // ==================================================================
  async listarFuncionarios(request, response) {
    try {
      // O ID da farmácia vem via Query String (?farmacia_id=1)
      const { farmacia_id } = request.query;
      
      if (!farmacia_id) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: 'O ID da farmácia é obrigatório.' 
        });
      }

      // Seleciona apenas dados seguros (sem a senha)
      const sql = `
        SELECT func_id, func_nome, func_email, func_telefone, func_cpf, 
               func_dtnasc, func_endereco, func_usuario, func_nivel, func_data_cadastro 
        FROM funcionario 
        WHERE farmacia_id = ?;
      `;
      
      const [rows] = await db.query(sql, [farmacia_id]);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: "Lista de funcionários recuperada com sucesso.",
        itens: rows.length,
        dados: rows,
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // DETALHES DE UM FUNCIONÁRIO (POR ID)
  // ==================================================================
  async listarFuncionarioPorId(request, response) {
    try {
      const { func_id } = request.params;
      const { farmacia_id } = request.query; // Validação de segurança

      if (!farmacia_id) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "O ID da farmácia é obrigatório." 
        });
      }

      // Garante que o funcionário pertença à farmácia solicitante
      const sql = `
        SELECT func_id, func_nome, func_email, func_telefone, func_cpf, 
               func_dtnasc, func_endereco, farmacia_id, func_usuario, 
               func_nivel, func_data_cadastro 
        FROM funcionario 
        WHERE func_id = ? AND farmacia_id = ?;
      `;
      
      const [rows] = await db.query(sql, [func_id, farmacia_id]);

      if (rows.length === 0) {
        return response.status(404).json({ 
          sucesso: false, 
          mensagem: "Funcionário não encontrado nesta farmácia." 
        });
      }
      
      return response.status(200).json({ 
        sucesso: true, 
        mensagem: "Dados do funcionário recuperados.", 
        dados: rows[0] 
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // CADASTRAR NOVO FUNCIONÁRIO
  // ==================================================================
  async cadastrarFuncionarios(request, response) {
    try {
      const { 
        func_nome, func_email, func_telefone, func_cpf, func_dtnasc, 
        func_endereco, farmacia_id, func_usuario, func_senha, func_nivel 
      } = request.body;
      
      // Validação rigorosa de todos os campos
      if (!func_nome || !func_email || !func_telefone || !func_cpf || !func_dtnasc || 
          !func_endereco || !farmacia_id || !func_usuario || !func_senha || !func_nivel) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "Todos os campos são obrigatórios." 
        });
      }
      
      const sql = `
        INSERT INTO funcionario 
        (func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      
      // Nota: A senha está sendo salva em texto puro conforme solicitado.
      // Recomendação futura: Usar bcrypt.hash()
      const values = [
          func_nome, func_email, func_telefone, func_cpf, func_dtnasc, 
          func_endereco, farmacia_id, func_usuario, func_senha, func_nivel
      ];
      
      const [result] = await db.query(sql, values);
      
      return response.status(201).json({
        sucesso: true,
        mensagem: "Funcionário cadastrado com sucesso.",
        dados: { func_id: result.insertId },
      });

    } catch (error) {
      // Erro de chave única (ex: CPF ou Usuário já existem)
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ 
          sucesso: false, 
          mensagem: 'CPF, E-mail ou Nome de Usuário já cadastrados no sistema.' 
        });
      }
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // EDITAR FUNCIONÁRIO
  // ==================================================================
  async editarFuncionarios(request, response) {
    try {
      const { func_id } = request.params;
      const { 
        func_nome, func_email, func_telefone, func_cpf, func_dtnasc, 
        func_endereco, farmacia_id, func_usuario, func_senha, func_nivel 
      } = request.body;

      if (!farmacia_id) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "O ID da farmácia é obrigatório para edição." 
        });
      }
      
      // Validação: Tudo obrigatório exceto a senha (que pode ser mantida a mesma)
      if (!func_nome || !func_email || !func_telefone || !func_cpf || !func_dtnasc || 
          !func_endereco || !func_usuario || !func_nivel) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "Todos os campos (exceto senha) são obrigatórios." 
        });
      }

      let sql;
      let values;

      // Lógica condicional: Só atualiza a senha se ela for enviada
      if (func_senha && func_senha.trim() !== "") {
        sql = `
            UPDATE funcionario SET 
            func_nome = ?, func_email = ?, func_telefone = ?, func_cpf = ?, 
            func_dtnasc = ?, func_endereco = ?, func_usuario = ?, func_senha = ?, func_nivel = ? 
            WHERE func_id = ? AND farmacia_id = ?;
        `;
        values = [
            func_nome, func_email, func_telefone, func_cpf, func_dtnasc, 
            func_endereco, func_usuario, func_senha, func_nivel, func_id, farmacia_id
        ];
      } else {
        sql = `
            UPDATE funcionario SET 
            func_nome = ?, func_email = ?, func_telefone = ?, func_cpf = ?, 
            func_dtnasc = ?, func_endereco = ?, func_usuario = ?, func_nivel = ? 
            WHERE func_id = ? AND farmacia_id = ?;
        `;
        values = [
            func_nome, func_email, func_telefone, func_cpf, func_dtnasc, 
            func_endereco, func_usuario, func_nivel, func_id, farmacia_id
        ];
      }

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({ 
          sucesso: false, 
          mensagem: "Funcionário não encontrado nesta farmácia." 
        });
      }

      return response.status(200).json({ 
        sucesso: true, 
        mensagem: "Funcionário atualizado com sucesso." 
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ 
          sucesso: false, 
          mensagem: 'Dados duplicados (CPF/Email/Usuário) já existem.' 
        });
      }
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // REMOVER FUNCIONÁRIO
  // ==================================================================
  async apagarFuncionarios(request, response) {
    try {
      const { func_id } = request.params;
      // Pega o ID da farmácia do body (mais seguro em DELETEs com payload) ou query
      const farmacia_id = request.body.farmacia_id || request.query.farmacia_id;

      if (!farmacia_id) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "O ID da farmácia é obrigatório para excluir." 
        });
      }

      const sql = "DELETE FROM funcionario WHERE func_id = ? AND farmacia_id = ?;";
      const [result] = await db.query(sql, [func_id, farmacia_id]);
      
      if (result.affectedRows === 0) {
        return response.status(404).json({ 
          sucesso: false, 
          mensagem: "Funcionário não encontrado ou não pertence a esta farmácia." 
        });
      }

      return response.status(200).json({ 
        sucesso: true, 
        mensagem: "Funcionário removido com sucesso." 
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },
};