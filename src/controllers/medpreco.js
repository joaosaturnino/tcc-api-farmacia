const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl');

module.exports = {
  async listarMedPreco(request, response) {
    try {
      // CORRIGIDO: Removida a coluna 'medp_imagem' da consulta, pois não existe na tabela.
      const sql = 'SELECT medp_id, medicamento_id, farmacia_id, medp_preco FROM medpreco;';
      const [rows] = await db.query(sql);

      // CORRIGIDO: Removida a lógica de gerar URL de imagem.
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
      // A imagem é tratada no controller de medicamentos. Este endpoint cadastra apenas o preço.
      const { medicamento_id, farmacia_id, medp_preco } = request.body;
      const sql = 'INSERT INTO medpreco (farmacia_id, medicamento_id, medp_preco) VALUES (?, ?, ?);';
      const values = [farmacia_id, medicamento_id, medp_preco];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Preço cadastrado com sucesso.',
        dados: { medp_id: rows.insertId }
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
      // Este endpoint edita apenas o preço.
      const { medp_preco } = request.body;
      const { medp_id } = request.params;
      const sql = 'UPDATE medpreco SET medp_preco = ? WHERE medp_id = ?;';
      const values = [medp_preco, medp_id];
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
      const { medp_id } = request.params;
      const sql = 'DELETE FROM medpreco WHERE medp_id = ?;';
      const values = [medp_id];
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