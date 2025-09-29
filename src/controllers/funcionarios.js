const db = require("../dataBase/connection");

module.exports = {
  async listarFuncionarios(request, response) {
    try {
      const sql =
        "SELECT func_id, func_nome, func_email, func_telefone, func_cpf,  func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel FROM funcionario;";
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: "Lista de funcionários",
        itens: rows.length,
        dados: rows,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  async listarFuncionarioPorId(request, response) {
    try {
      const { func_id } = request.params; // Pega o ID dos parâmetros da URL
      const sql = "SELECT * FROM funcionario WHERE func_id = ?;";
      const values = [func_id];
      const [rows] = await db.query(sql, values);

      if (rows.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Funcionário não encontrado.",
        });
      }

      // Retorna apenas o primeiro (e único) objeto encontrado
      return response.status(200).json({
        sucesso: true,
        mensagem: "Dados do funcionário.",
        dados: rows[0],
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  async cadastrarFuncionarios(request, response) {
    try {
      const {
        func_nome,
        func_email,
        func_telefone,
        func_cpf,
        func_dtnasc,
        func_endereco,
        farmacia_id,
        func_usuario,
        func_senha,
        func_nivel,
      } = request.body;
      const sql =
        "INSERT INTO funcionario (func_nome, func_email, func_telefone, func_cpf,  func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const values = [
        func_nome,
        func_email,
        func_telefone,
        func_cpf,
        func_dtnasc,
        func_endereco,
        farmacia_id,
        func_usuario,
        func_senha,
        func_nivel,
      ];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: "Funcionário cadastrado com sucesso.",
        dados: { func_id: rows.insertId },
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  async editarFuncionarios(request, response) {
    try {
      const {
        func_nome,
        func_email,
        func_telefone,
        func_cpf,
        func_dtnasc,
        func_endereco,
        farmacia_id,
        func_usuario,
        func_senha, // pode vir undefined
        func_nivel,
      } = request.body;
      const { func_id } = request.params;

      let sql;
      let values;

      // ** LÓGICA CORRIGIDA ABAIXO **
      // Se o campo 'func_senha' foi enviado na requisição, atualiza a senha.
      if (func_senha) {
        sql =
          "UPDATE funcionario SET func_nome = ?, func_email = ?, func_telefone = ?, func_cpf = ?, func_dtnasc = ?, func_endereco = ?, farmacia_id = ?, func_usuario = ?, func_senha = ?, func_nivel = ? WHERE func_id = ?;";
        values = [
          func_nome,
          func_email,
          func_telefone,
          func_cpf,
          func_dtnasc,
          func_endereco,
          farmacia_id,
          func_usuario,
          func_senha, // Senha nova incluída
          func_nivel,
          func_id,
        ];
      } else {
        // Se a senha não foi enviada, executa a query sem alterar o campo da senha.
        sql =
          "UPDATE funcionario SET func_nome = ?, func_email = ?, func_telefone = ?, func_cpf = ?, func_dtnasc = ?, func_endereco = ?, farmacia_id = ?, func_usuario = ?, func_nivel = ? WHERE func_id = ?;";
        values = [
          func_nome,
          func_email,
          func_telefone,
          func_cpf,
          func_dtnasc,
          func_endereco,
          farmacia_id,
          func_usuario,
          func_nivel,
          func_id,
        ];
      }

      const [rows] = await db.query(sql, values);

      // Verifica se alguma linha foi de fato alterada
      if (rows.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Funcionário não encontrado ou os dados são idênticos aos já existentes.",
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: "Funcionário editado com sucesso.",
        dados: rows,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  async apagarFuncionarios(request, response) {
    try {
      const { func_id } = request.params;
      const sql = "DELETE FROM funcionario WHERE func_id = ?;";
      const values = [func_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: "Funcionário apagado com sucesso.",
        dados: rows,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },
};
