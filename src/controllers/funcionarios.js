const db = require("../dataBase/connection");

/**
 * Função helper para lidar com erros de servidor de forma padronizada.
 */
const handleServerError = (response, error) => {
  console.error(error); // Loga o erro no console do servidor
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
  });
};

module.exports = {
  /**
   * Lista todos os funcionários de uma farmácia específica.
   */
  async listarFuncionarios(request, response) {
    try {
      // O ID da farmácia vem pela Query String (ex: /funcionarios?farmacia_id=1)
      const { farmacia_id } = request.query;
      if (!farmacia_id) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: 'O ID da farmácia é obrigatório para listar os funcionários.' 
        });
      }

      // Seleciona os campos relevantes (sem a senha)
      const sql = "SELECT func_id, func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, func_usuario, func_nivel, func_data_cadastro FROM funcionario WHERE farmacia_id = ?;";
      
      const [rows] = await db.query(sql, [farmacia_id]);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: "Lista de funcionários recuperada com sucesso.",
        dados: rows,
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  /**
   * Lista um funcionário específico pelo ID, verificando se ele pertence à farmácia.
   */
  async listarFuncionarioPorId(request, response) {
    try {
      const { func_id } = request.params; // ID do funcionário
      const { farmacia_id } = request.query; // ID da farmácia para validação

      if (!farmacia_id) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "O ID da farmácia é obrigatório para a consulta." 
        });
      }

      const sql = "SELECT func_id, func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_nivel, func_data_cadastro FROM funcionario WHERE func_id = ? AND farmacia_id = ?;";
      
      const [rows] = await db.query(sql, [func_id, farmacia_id]);

      if (rows.length === 0) {
        return response.status(404).json({ 
          sucesso: false, 
          mensagem: "Funcionário não encontrado ou não pertence a esta farmácia." 
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

  /**
   * Cadastra um novo funcionário. (ATENÇÃO: Senha em texto puro)
   */
  async cadastrarFuncionarios(request, response) {
    try {
      const { func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel } = request.body;
      
      // === CORREÇÃO: Validação de todos os campos obrigatórios, incluindo 'func_nivel' ===
      if (!func_nome || !func_email || !func_telefone || !func_cpf || !func_dtnasc || !func_endereco || !farmacia_id || !func_usuario || !func_senha || !func_nivel) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "Todos os campos são obrigatórios." 
        });
      }
      
      const sql = "INSERT INTO funcionario (func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      
      // Salva a senha em texto puro, como no arquivo original
      const values = [func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel];
      
      const [rows] = await db.query(sql, values);
      
      return response.status(201).json({
        sucesso: true,
        mensagem: "Funcionário cadastrado com sucesso.",
        dados: { func_id: rows.insertId }, // Retorna o ID do novo funcionário
      });
    } catch (error) {
      // Trata erro de duplicidade (ex: CPF ou e-mail já existe)
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ 
          sucesso: false, 
          mensagem: 'CPF, e-mail ou nome de usuário já cadastrado.' 
        });
      }
      return handleServerError(response, error);
    }
  },

  /**
   * Edita um funcionário existente. (ATENÇÃO: Senha em texto puro)
   */
  async editarFuncionarios(request, response) {
    try {
      const { func_id } = request.params;
      const { func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel } = request.body;

      // Validação dos IDs
      if (!farmacia_id || !func_id) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "O ID da farmácia e do funcionário são obrigatórios." 
        });
      }
      
      // === CORREÇÃO: Validação dos campos obrigatórios (senha é opcional na edição), incluindo 'func_nivel' ===
      if (!func_nome || !func_email || !func_telefone || !func_cpf || !func_dtnasc || !func_endereco || !func_usuario || !func_nivel) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "Todos os campos, exceto a senha, são obrigatórios." 
        });
      }

      let sql;
      let values;

      // Verifica se uma nova senha foi enviada
      if (func_senha && func_senha.trim() !== "") {
        // SQL para atualizar TUDO, incluindo a senha (em texto puro)
        sql = "UPDATE funcionario SET func_nome = ?, func_email = ?, func_telefone = ?, func_cpf = ?, func_dtnasc = ?, func_endereco = ?, func_usuario = ?, func_senha = ?, func_nivel = ? WHERE func_id = ? AND farmacia_id = ?;";
        values = [func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, func_usuario, func_senha, func_nivel, func_id, farmacia_id];
      } else {
        // Se não, SQL para atualizar tudo, MENOS a senha
        sql = "UPDATE funcionario SET func_nome = ?, func_email = ?, func_telefone = ?, func_cpf = ?, func_dtnasc = ?, func_endereco = ?, func_usuario = ?, func_nivel = ? WHERE func_id = ? AND farmacia_id = ?;";
        values = [func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, func_usuario, func_nivel, func_id, farmacia_id];
      }

      const [rows] = await db.query(sql, values);

      if (rows.affectedRows === 0) {
        return response.status(404).json({ 
          sucesso: false, 
          mensagem: "Funcionário não encontrado ou não pertence a esta farmácia." 
        });
      }

      return response.status(200).json({ 
        sucesso: true, 
        mensagem: "Funcionário editado com sucesso." 
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ 
          sucesso: false, 
          mensagem: 'CPF, e-mail ou nome de usuário já cadastrado.' 
        });
      }
      return handleServerError(response, error);
    }
  },

  /**
   * Apaga um funcionário, verificando pela query string o ID da farmácia.
   */
  async apagarFuncionarios(request, response) {
    try {
      const { func_id } = request.params;
      // === CORREÇÃO DE LÓGICA: 'farmacia_id' deve vir da query no método DELETE ===
      const { farmacia_id } = request.query;

      if (!farmacia_id) {
        return response.status(400).json({ 
          sucesso: false, 
          mensagem: "O ID da farmácia é obrigatório para excluir." 
        });
      }

      const sql = "DELETE FROM funcionario WHERE func_id = ? AND farmacia_id = ?;";
      const values = [func_id, farmacia_id];
      const [rows] = await db.query(sql, values);
      
      if (rows.affectedRows === 0) {
        return response.status(404).json({ 
          sucesso: false, 
          mensagem: "Funcionário não encontrado ou não pertence a esta farmácia." 
        });
      }

      return response.status(200).json({ 
        sucesso: true, 
        mensagem: "Funcionário apagado com sucesso." 
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },
};