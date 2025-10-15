const db = require('../dataBase/connection');

module.exports = {
  async listarPromocoes(request, response) {
    try {
      const sql = `SELECT promo_id, farmacia_id, medicamento_id, promo_desconto, 
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
      // CORREÇÃO: Ajustado de 'farm_id' e 'med_id' para corresponder ao schema do BD.
      const { farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim } = request.body;
      
      // CORREÇÃO: Nomes das colunas ajustados no comando SQL.
      const sql = `INSERT INTO promocao (farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim) 
                  VALUES (?, ?, ?, ?, ?);`;
      const values = [farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim];
      
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
      // CORREÇÃO: Ajustado de 'farm_id' e 'med_id' para corresponder ao schema do BD.
      const { farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim } = request.body;
      const { promo_id } = request.params;

      // CORREÇÃO: Nomes das colunas ajustados no comando SQL.
      const sql = `UPDATE promocao SET farmacia_id = ?, medicamento_id = ?, promo_desconto = ?, 
                  promo_inicio = ?, promo_fim = ? WHERE promo_id = ?;`;
      const values = [farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim, promo_id];
      
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