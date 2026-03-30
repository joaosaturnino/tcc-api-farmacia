const db = require('../dataBase/connection');

// --- FUNÇÃO DE MONITORAMENTO (GATILHO DE PROMOÇÃO) ---
async function verificarAlertaPromocao(medicamento_id, farmacia_id, desconto_porcentagem) {
    try {
        // 1. Busca o preço base atual
        const [precoBase] = await db.query(`
            SELECT medp_preco FROM medpreco 
            WHERE medicamento_id = ? AND farmacia_id = ?
        `, [medicamento_id, farmacia_id]);

        if (precoBase.length === 0) return; // Se não tem preço base, não dá pra calcular

        // 2. Calcula quanto vai custar com o desconto
        const valorOriginal = parseFloat(precoBase[0].medp_preco);
        const valorComDesconto = valorOriginal * (1 - (desconto_porcentagem / 100));

        // 3. Pega nomes
        const [infos] = await db.query(`
            SELECT m.med_nome, f.farm_nome 
            FROM medicamento m, farmacia f 
            WHERE m.med_id = ? AND f.farm_id = ?
        `, [medicamento_id, farmacia_id]);
        
        const { med_nome, farm_nome } = infos[0];

        // 4. Verifica se o valor COM DESCONTO atende aos alertas
        const [alertas] = await db.query(`
            SELECT * FROM alertas 
            WHERE ativo = 1 
            AND ? LIKE CONCAT('%', termo_busca, '%') 
            AND preco_alvo >= ?
        `, [med_nome, valorComDesconto]);

        // 5. Notifica
        for (const alerta of alertas) {
            const mensagem = `O medicamento ${med_nome} entrou em promoção na ${farm_nome}! Caiu para R$ ${valorComDesconto.toFixed(2).replace('.', ',')}.`;

            const [duplicada] = await db.query(`SELECT id FROM notificacoes WHERE usuario_id = ? AND mensagem = ?`, [alerta.usuario_id, mensagem]);

            if (duplicada.length === 0) {
                await db.query(`INSERT INTO notificacoes (usuario_id, titulo, mensagem) VALUES (?, ?, ?)`, 
                    [alerta.usuario_id, 'Oferta Relâmpago! ⚡', mensagem]);
                
                console.log(`[PROMO] Notificação enviada para o usuário ${alerta.usuario_id}`);
            }
        }
    } catch (error) {
        console.error("Erro no gatilho de promoção:", error);
    }
}

module.exports = {

  // Listar
  async listarPromocoesPorFarmacia(req, res) {
    try {
      const { farmacia_id } = req.query;
      const today = new Date().toISOString().slice(0, 10); 
      const [rows] = await db.query(`SELECT * FROM promocao WHERE farmacia_id = ? AND promo_fim >= ?`, [farmacia_id, today]);
      return res.status(200).json({ sucesso: true, dados: rows });
    } catch (error) { return res.status(500).json({ sucesso: false, mensagem: error.message }); }
  },

  // Cadastrar (COM GATILHO)
  async cadastrarPromocoes(req, res) {
    try {
      const { farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim } = req.body;
      
      const sql = `INSERT INTO promocao (farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await db.query(sql, [farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim]);

      // --- DISPARA O GATILHO ---
      await verificarAlertaPromocao(medicamento_id, farmacia_id, promo_desconto);
      // -------------------------

      return res.status(201).json({ sucesso: true, mensagem: 'Promoção cadastrada.', dados: { id: result.insertId } });

    } catch (error) { return res.status(500).json({ sucesso: false, mensagem: error.message }); }
  },

  // Editar (COM GATILHO)
  async editarPromocoes(req, res) {
    try {
      const { farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim } = req.body;
      const { promo_id } = req.params;

      const sql = `UPDATE promocao SET farmacia_id=?, medicamento_id=?, promo_desconto=?, promo_inicio=?, promo_fim=? WHERE promo_id=?`;
      const [result] = await db.query(sql, [farmacia_id, medicamento_id, promo_desconto, promo_inicio, promo_fim, promo_id]);

      if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, mensagem: 'Não encontrado.' });

      // --- DISPARA O GATILHO ---
      await verificarAlertaPromocao(medicamento_id, farmacia_id, promo_desconto);
      // -------------------------

      return res.status(200).json({ sucesso: true, mensagem: 'Editado com sucesso.' });
    } catch (error) { return res.status(500).json({ sucesso: false, mensagem: error.message }); }
  },

  // Apagar
  async apagarPromocoes(req, res) {
    try {
      const { promo_id } = req.params;
      const [rows] = await db.query('DELETE FROM promocao WHERE promo_id = ?', [promo_id]);
      
      if (rows.affectedRows === 0) return res.status(404).json({ sucesso: false, mensagem: 'Não encontrado.' });
      
      return res.status(200).json({ sucesso: true, mensagem: 'Removido.' });
    } catch (error) { return res.status(500).json({ sucesso: false, mensagem: error.message }); }
  }
};