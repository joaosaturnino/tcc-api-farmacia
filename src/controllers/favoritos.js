const db = require('../dataBase/connection');

module.exports = {
  async listarFavoritos(request, response) {
    try {
      const sql = 'SELECT fav_id, usu_id, far_id, med_id FROM favoritos;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de favoritos',
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

  async cadastrarFavoritos(request, response) {
    try {
      const { usu_id, far_id, med_id } = request.body;
      const sql = 'INSERT INTO favoritos (usu_id, far_id, med_id) VALUES (?, ?, ?);';
      const values = [usu_id, far_id, med_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Favorito cadastrado com sucesso.',
        dados: { fav_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async apagarFavoritos(request, response) {
    try {
      const { fav_id } = request.params;
      const sql = 'DELETE FROM favoritos WHERE fav_id = ?;';
      const values = [fav_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Favorito apagado com sucesso.',
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