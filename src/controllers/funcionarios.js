const db = require('../dataBase/connection');

module.exports = {
  async listarFuncionarios(request, response) {
    try {
      const sql = 'SELECT func_id, cargo, farm_id FROM funcionarios;';
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
      const { cargo, farm_id } = request.body;
      const sql = 'INSERT INTO funcionarios (cargo, farm_id) VALUES (?, ?);';
      const values = [cargo, farm_id];
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