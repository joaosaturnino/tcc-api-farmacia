const db = require('../dataBase/connection');

module.exports = {
  async listarMedPreco(request, response) {
    try {
      const sql = 'SELECT medp_id, medicamento_id, farmacia_id, medp_preco FROM medpreco;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de preços de medicamentos',
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

  async cadastrarMedPreco(request, response) {
    try {
      const { medicamento_id, farmacia_id, medp_preco } = request.body;
      const sql = 'INSERT INTO medpreco (farmacia_id, medicamento_id, medp_preco) VALUES (?, ?, ?);';
      const values = [farmacia_id, medicamento_id, medp_preco];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Preço cadastrado com sucesso.',
        dados: { medpreco_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarMedPreco(request, response) {
    try {
      const { medicamento_id, farmacia_id, medp_preco } = request.body;
      const { medp_id } = request.params;
      const sql = 'UPDATE medpreco SET farmacia_id = ?, medicamento_id = ?, medp_preco = ? WHERE medp_id = ?;';
      const values = [farmacia_id, medicamento_id, medp_preco, medp_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Preço editado com sucesso.',
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

  async apagarMedPreco(request, response) {
    try {
      const { medpreco_id } = request.params;
      const sql = 'DELETE FROM medpreco WHERE medpreco_id = ?;';
      const values = [medpreco_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Preço apagado com sucesso.',
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