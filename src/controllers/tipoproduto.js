const db = require('../dataBase/connection');

module.exports = {
  async listarTipoProduto(request, response) {
    try {
      const sql = 'SELECT tipo_id, nome_tipo FROM tipo_produto;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de tipos de produto',
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

  async cadastrarTipoProduto(request, response) {
    try {
      const { nome_tipo } = request.body;
      const sql = 'INSERT INTO tipo_produto (nome_tipo) VALUES (?);';
      const values = [nome_tipo];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Tipo de produto cadastrado com sucesso.',
        dados: { tipo_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarTipoProduto(request, response) {
    try {
      const { nome_tipo } = request.body;
      const { tipo_id } = request.params;
      const sql = 'UPDATE tipo_produto SET nome_tipo = ? WHERE tipo_id = ?;';
      const values = [nome_tipo, tipo_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Tipo de produto editado com sucesso.',
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

  async apagarTipoProduto(request, response) {
    try {
      const { tipo_id } = request.params;
      const sql = 'DELETE FROM tipo_produto WHERE tipo_id = ?;';
      const values = [tipo_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Tipo de produto apagado com sucesso.',
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