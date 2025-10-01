const db = require("../dataBase/connection");
// A dependência do bcrypt foi retirada em solicitações anteriores.
// Para um ambiente de produção, é crucial reintroduzir a criptografia de senhas.

const handleServerError = (response, error) => {
  console.error(error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
  });
};

module.exports = {
  async listarFuncionarios(request, response) {
    try {
      const { farmacia_id } = request.query;
      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID da farmácia é obrigatório para listar os funcionários.' });
      }
      const sql = "SELECT func_id, func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, func_usuario, func_nivel FROM funcionario WHERE farmacia_id = ?;";
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

  // CORRIGIDO: Agora valida também o ID da farmácia para segurança.
  async listarFuncionarioPorId(request, response) {
    try {
      const { func_id } = request.params;
      const { farmacia_id } = request.query; // Espera o ID da farmácia para validação

      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: "O ID da farmácia é obrigatório para a consulta." });
      }

      const sql = "SELECT func_id, func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_nivel FROM funcionario WHERE func_id = ? AND farmacia_id = ?;";
      const [rows] = await db.query(sql, [func_id, farmacia_id]);

      if (rows.length === 0) {
        return response.status(404).json({ sucesso: false, mensagem: "Funcionário não encontrado ou não pertence a esta farmácia." });
      }
      return response.status(200).json({ sucesso: true, mensagem: "Dados do funcionário recuperados.", dados: rows[0] });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async cadastrarFuncionarios(request, response) {
    try {
      const { func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel } = request.body;
      
      if (!func_nome || !func_email || !func_cpf || !farmacia_id || !func_usuario || !func_senha) {
        return response.status(400).json({ sucesso: false, mensagem: "Campos obrigatórios não foram preenchidos." });
      }

      const sql = "INSERT INTO funcionario (func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const values = [func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel];
      
      const [rows] = await db.query(sql, values);
      return response.status(201).json({
        sucesso: true,
        mensagem: "Funcionário cadastrado com sucesso.",
        dados: { func_id: rows.insertId },
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ sucesso: false, mensagem: 'CPF, e-mail ou nome de usuário já cadastrado.' });
      }
      return handleServerError(response, error);
    }
  },

  async editarFuncionarios(request, response) {
    try {
      const { func_id } = request.params;
      const { func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel } = request.body;

      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: "O ID da farmácia é obrigatório para editar." });
      }

      let sql;
      let values;

      if (func_senha && func_senha.trim() !== "") {
        sql = "UPDATE funcionario SET func_nome = ?, func_email = ?, func_telefone = ?, func_cpf = ?, func_dtnasc = ?, func_endereco = ?, func_usuario = ?, func_senha = ?, func_nivel = ? WHERE func_id = ? AND farmacia_id = ?;";
        values = [func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, func_usuario, func_senha, func_nivel, func_id, farmacia_id];
      } else {
        sql = "UPDATE funcionario SET func_nome = ?, func_email = ?, func_telefone = ?, func_cpf = ?, func_dtnasc = ?, func_endereco = ?, func_usuario = ?, func_nivel = ? WHERE func_id = ? AND farmacia_id = ?;";
        values = [func_nome, func_email, func_telefone, func_cpf, func_dtnasc, func_endereco, func_usuario, func_nivel, func_id, farmacia_id];
      }

      const [rows] = await db.query(sql, values);

      if (rows.affectedRows === 0) {
        return response.status(404).json({ sucesso: false, mensagem: "Funcionário não encontrado ou não pertence a esta farmácia." });
      }

      return response.status(200).json({ sucesso: true, mensagem: "Funcionário editado com sucesso." });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async apagarFuncionarios(request, response) {
    try {
      const { func_id } = request.params;
      const { farmacia_id } = request.body;

      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: "O ID da farmácia é obrigatório para excluir." });
      }

      const sql = "DELETE FROM funcionario WHERE func_id = ? AND farmacia_id = ?;";
      const values = [func_id, farmacia_id];
      const [rows] = await db.query(sql, values);
      
      if (rows.affectedRows === 0) {
        return response.status(404).json({ sucesso: false, mensagem: "Funcionário não encontrado ou não pertence a esta farmácia." });
      }

      return response.status(200).json({ sucesso: true, mensagem: "Funcionário apagado com sucesso." });
    } catch (error) {
      return handleServerError(response, error);
    }
  },
};