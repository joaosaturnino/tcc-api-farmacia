const db = require('../dataBase/connection');

module.exports = {
  async listarCidade(request, response) {
    try {
      const sql = 'SELECT cidade_id, nome_cidade, uf_sigla FROM cidade;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de cidades',
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

  async listarUfs(request, response) {
    try {
      const sql = 'SELECT DISTINCT uf_sigla FROM cidade ORDER BY uf_sigla;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de UFs',
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

  async cadastrarCidade(request, response) {
    try {
      const { nome_cidade, uf_sigla } = request.body;
      const sql = 'INSERT INTO cidade (nome_cidade, uf_sigla) VALUES (?, ?);';
      const values = [nome_cidade, uf_sigla];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Cidade cadastrada com sucesso.',
        dados: { cidade_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarCidade(request, response) {
    try {
      const { nome_cidade, uf_sigla } = request.body;
      const { cidade_id } = request.params;
      const sql = 'UPDATE cidade SET nome_cidade = ?, uf_sigla = ? WHERE cidade_id = ?;';
      const values = [nome_cidade, uf_sigla, cidade_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Cidade editada com sucesso.',
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

  async apagarCidade(request, response) {
    try {
      const { cidade_id } = request.params;
      const sql = 'DELETE FROM cidade WHERE cidade_id = ?;';
      const values = [cidade_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Cidade apagada com sucesso.',
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