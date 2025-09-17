const db = require('../dataBase/connection');

module.exports = {
  async listarFuncionarios(request, response) {
    try {
      const sql = 'SELECT func_id, func_nome, func_email, func_telefone, func_cpf,  func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel FROM funcionario;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de funcionários',
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

  async cadastrarFuncionarios(request, response) {
    try {
      const { func_nome, func_email, func_telefone, func_cpf,  func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel } = request.body;
      const sql = 'INSERT INTO funcionarios (func_nome, func_email, func_telefone, func_cpf,  func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
      const values = [func_nome, func_email, func_telefone, func_cpf,  func_dtnasc, func_endereco, farmacia_id, func_usuario, func_senha, func_nivel];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Funcionário cadastrado com sucesso.',
        dados: { func_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarFuncionarios(request, response) {
    try {
      const { cargo, farm_id } = request.body;
      const { func_id } = request.params;
      const sql = 'UPDATE funcionarios SET cargo = ?, farm_id = ? WHERE func_id = ?;';
      const values = [cargo, farm_id, func_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Funcionário editado com sucesso.',
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

  async apagarFuncionarios(request, response) {
    try {
      const { func_id } = request.params;
      const sql = 'DELETE FROM funcionarios WHERE func_id = ?;';
      const values = [func_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Funcionário apagado com sucesso.',
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