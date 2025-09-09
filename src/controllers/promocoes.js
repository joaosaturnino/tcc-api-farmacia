const db = require('../dataBase/connection');

module.exports = {
  async listarPromocoes(request, response) {
    try {
      const sql = `SELECT promo_id, farm_id, med_id, promo_desconto, 
                  promo_inicio, promo_fim FROM promocao;`;
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de promoções',
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

  async cadastrarPromocoes(request, response) {
    try {
      const { farm_id, med_id, promo_desconto, promo_inicio, promo_fim } = request.body;
      const sql = `INSERT INTO promocao (farm_id, med_id, promo_desconto, promo_inicio, promo_fim) 
                  VALUES (?, ?, ?, ?, ?);`;
      const values = [farm_id, med_id, promo_desconto, promo_inicio, promo_fim];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Promoção cadastrada com sucesso.',
        dados: { promo_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarPromocoes(request, response) {
    try {
      const { farm_id, med_id, promo_desconto, promo_inicio, promo_fim } = request.body;
      const { promo_id } = request.params;
      const sql = `UPDATE promocao SET farm_id = ?, med_id = ?, promo_desconto = ?, 
                  promo_inicio = ?, promo_fim = ? WHERE promo_id = ?;`;
      const values = [farm_id, med_id, promo_desconto, promo_inicio, promo_fim, promo_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Promoção editada com sucesso.',
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

  async apagarPromocoes(request, response) {
    try {
      const { promo_id } = request.params;
      const sql = 'DELETE FROM promocao WHERE promo_id = ?;';
      const values = [promo_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Promoção apagada com sucesso.',
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