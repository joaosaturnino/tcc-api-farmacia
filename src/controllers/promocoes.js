const db = require('../dataBase/connection');

const handleServerError = (response, error) => {
  console.error(error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
    dados: error.message
  });
};

module.exports = {

  // === CORRIGIDO: Nomes das colunas no SELECT e WHERE ===
  async listarPromocoesPorFarmacia(request, response) {
    try {
      const { farmacia_id } = request.query;

      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro farmacia_id é obrigatório.' });
      }

      const today = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

      // === CORRIGIDO: Ajustado para usar promo_desconto, promo_inicio, promo_fim ===
      // Busca apenas promoções que AINDA ESTÃO ATIVAS (promo_fim >= hoje)
      const sql = `
        SELECT 
          promo_id, 
          farmacia_id, 
          medicamento_id, 
          promo_desconto, 
          promo_inicio, 
          promo_fim 
        FROM promocao
        WHERE farmacia_id = ? AND promo_fim >= ?;
      `;

      const [rows] = await db.query(sql, [farmacia_id, today]);

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Promoções recuperadas com sucesso.',
        itens: rows.length,
        dados: rows
      });

    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async cadastrarPromocoes(request, response) {
    try {
      // === CORRIGIDO: Nomes dos campos ajustados para promo_desconto, promo_inicio, promo_fim ===
      const { 
        farmacia_id, 
        medicamento_id, 
        promo_desconto,
        promo_inicio,
        promo_fim
      } = request.body;
      
      if (!farmacia_id || !medicamento_id || !promo_desconto || !promo_inicio || !promo_fim) {
        return response.status(400).json({ sucesso: false, mensagem: 'Todos os campos são obrigatórios.' });
      }

      // === ADICIONADO: Validação de promoção existente ===
      const today = new Date().toISOString().slice(0, 10);
      // === CORRIGIDO: Usando promo_fim na verificação ===
      const checkSql = 'SELECT promo_id FROM promocao WHERE medicamento_id = ? AND farmacia_id = ? AND promo_fim >= ?';
      const [existing] = await db.query(checkSql, [medicamento_id, farmacia_id, today]);

      if (existing.length > 0) {
        return response.status(409).json({ sucesso: false, mensagem: 'Este medicamento já possui uma promoção ativa. Remova a promoção existente primeiro.' });
      }
      // === FIM ADIÇÃO ===

      // === CORRIGIDO: Nomes das colunas ajustados no SQL ===
      const sql = `
        INSERT INTO promocao 
          (farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim) 
        VALUES (?, ?, ?, ?, ?);
      `;
      const values = [farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim];
      
      const [result] = await db.query(sql, values);
      const newPromoId = result.insertId;

      // === CORRIGIDO: Retorna o novo objeto criado, como o frontend espera ===
      const [newPromoData] = await db.query('SELECT * FROM promocao WHERE promo_id = ?', [newPromoId]);
      
      return response.status(201).json({
        sucesso: true,
        mensagem: 'Promoção cadastrada com sucesso.',
        dados: newPromoData[0] // Retorna o objeto completo
      });

    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async editarPromocoes(request, response) {
    try {
      // === CORRIGIDO: Nomes dos campos ajustados para promo_desconto, promo_inicio, promo_fim ===
      const { 
        farmacia_id, 
        medicamento_id, 
        promo_desconto,
        promo_inicio,
        promo_fim
      } = request.body;
      const { promo_id } = request.params;

      // === CORRIGIDO: Nomes das colunas ajustados no SQL ===
      const sql = `
        UPDATE promocao SET 
          farmacia_id = ?, 
          medicamento_id = ?, 
          promo_desconto = ?, 
          promo_inicio = ?, 
          promo_fim = ? 
        WHERE promo_id = ?;
      `;
      const values = [farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim, promo_id];
      
      const [result] = await db.query(sql, values);

      // === MELHORIA: Adicionado verificação de 404 ===
      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Promoção não encontrada.'
        });
      }

      // === MELHORIA: Buscar dados atualizados para retornar (consistência com o POST) ===
      const [updatedData] = await db.query('SELECT * FROM promocao WHERE promo_id = ?', [promo_id]);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Promoção editada com sucesso.',
        dados: updatedData[0] // Retorna o objeto atualizado
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async apagarPromocoes(request, response) {
    try {
      const { promo_id } = request.params;

      if (!promo_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'ID da promoção é obrigatório.' });
      }

      const sql = 'DELETE FROM promocao WHERE promo_id = ?;';
      const values = [promo_id];
      
      const [rows] = await db.query(sql, values);

      if (rows.affectedRows === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'Promoção não encontrada.' });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Promoção apagada com sucesso.',
        dados: rows // Manter assim é aceitável para DELETE
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  }
};