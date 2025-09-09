const db = require('../dataBase/connection');

module.exports = {
  async listarFarmaceutica(request, response) {
    try {
      const sql = 'SELECT forma_id, forma_nome FROM forma_farmaceutica;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de formas farmaceuticas',
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

  async cadastrarFarmaceutica(request, response) {
    try {
      const { forma_nome } = request.body;
      const sql = 'INSERT INTO forma_farmaceutica (forma_nome) VALUES (?);';
      const values = [forma_nome];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Forma farmaceutica cadastrada com sucesso.',
        dados: { forma_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarFarmaceutica(request, response) {
    try {
      const { forma_nome } = request.body;
      const { forma_id } = request.params;
      const sql = 'UPDATE forma_farmaceutica SET forma_nome = ? WHERE forma_id = ?;';
      const values = [forma_nome, forma_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Forma farmaceutica editada com sucesso.',
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

  async apagarFarmaceutica(request, response) {
    try {
      const { forma_id } = request.params;
      const sql = 'DELETE FROM forma_farmaceutica WHERE forma_id = ?;';
      const values = [forma_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Forma farmaceutica apagada com sucesso.',
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