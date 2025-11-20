const db = require('../dataBase/connection');

// Helper para tratamento de erro padrão
const handleServerError = (response, error) => {
  console.error(error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
    dados: error.message
  });
};

module.exports = {

  // ==================================================================
  // LISTAR PROMOÇÕES (POR FARMÁCIA)
  // ==================================================================
  async listarPromocoesPorFarmacia(request, response) {
    try {
      const { farmacia_id } = request.query;

      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro farmacia_id é obrigatório.' });
      }

      // Data de hoje para filtrar apenas promoções válidas ou futuras
      const today = new Date().toISOString().slice(0, 10); 

      // Busca promoções onde a data de fim ainda não passou
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

  // ==================================================================
  // CADASTRAR NOVA PROMOÇÃO
  // ==================================================================
  async cadastrarPromocoes(request, response) {
    try {
      const { 
        farmacia_id, 
        medicamento_id, 
        promo_desconto,
        promo_inicio,
        promo_fim
      } = request.body;
      
      // 1. Validação de campos obrigatórios
      if (!farmacia_id || !medicamento_id || !promo_desconto || !promo_inicio || !promo_fim) {
        return response.status(400).json({ sucesso: false, mensagem: 'Todos os campos são obrigatórios.' });
      }

      // 2. Validação de conflito: Já existe promoção ativa para este remédio?
      const today = new Date().toISOString().slice(0, 10);
      const checkSql = 'SELECT promo_id FROM promocao WHERE medicamento_id = ? AND farmacia_id = ? AND promo_fim >= ?';
      const [existing] = await db.query(checkSql, [medicamento_id, farmacia_id, today]);

      if (existing.length > 0) {
        return response.status(409).json({ 
            sucesso: false, 
            mensagem: 'Este medicamento já possui uma promoção ativa. Edite a existente ou aguarde o término.' 
        });
      }

      // 3. Inserção no banco
      const sql = `
        INSERT INTO promocao 
          (farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim) 
        VALUES (?, ?, ?, ?, ?);
      `;
      const values = [farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim];
      
      const [result] = await db.query(sql, values);
      const newPromoId = result.insertId;

      // 4. Retorna os dados da nova promoção
      const [newPromoData] = await db.query('SELECT * FROM promocao WHERE promo_id = ?', [newPromoId]);
      
      return response.status(201).json({
        sucesso: true,
        mensagem: 'Promoção cadastrada com sucesso.',
        dados: newPromoData[0]
      });

    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // EDITAR PROMOÇÃO
  // ==================================================================
  async editarPromocoes(request, response) {
    try {
      const { 
        farmacia_id, 
        medicamento_id, 
        promo_desconto, 
        promo_inicio, 
        promo_fim 
      } = request.body;
      
      const { promo_id } = request.params;

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

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Promoção não encontrada.'
        });
      }

      // Retorna o objeto atualizado para o front-end
      const [updatedData] = await db.query('SELECT * FROM promocao WHERE promo_id = ?', [promo_id]);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Promoção editada com sucesso.',
        dados: updatedData[0]
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // APAGAR PROMOÇÃO
  // ==================================================================
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
        mensagem: 'Promoção removida com sucesso.'
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  }
};