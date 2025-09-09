const db = require('../dataBase/connection');

module.exports = {
  async listarAvaliacao(request, response) {
    try {
      const sql = 'SELECT ava_id, usu_id, far_id, nota, ava_comentario FROM avaliacao;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de avaliações',
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

  async cadastrarAvaliacao(request, response) {
    try {
      const { usu_id, far_id, nota, ava_comentario } = request.body;
      const sql = 'INSERT INTO avaliacao (usu_id, far_id, nota, ava_comentario) VALUES (?, ?, ?, ?);';
      const values = [usu_id, far_id, nota, ava_comentario];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Avaliação cadastrada com sucesso.',
        dados: { ava_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarAvaliacao(request, response) {
    try {
      const { nota, ava_comentario } = request.body;
      const { ava_id } = request.params;
      const sql = 'UPDATE avaliacao SET nota = ?, ava_comentario = ? WHERE ava_id = ?;';
      const values = [nota, ava_comentario, ava_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Avaliação editada com sucesso.',
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

  async apagarAvaliacao(request, response) {
    try {
      const { ava_id } = request.params;
      const sql = 'DELETE FROM avaliacao WHERE ava_id = ?;';
      const values = [ava_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Avaliação apagada com sucesso.',
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