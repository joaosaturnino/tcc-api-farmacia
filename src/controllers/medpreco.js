const db = require('../dataBase/connection');

// --- FUNÇÃO DE MONITORAMENTO (GATILHO) ---
async function verificarDisparoDeAlertas(medicamento_id, farmacia_id, novo_preco) {
    try {
        const precoNumerico = parseFloat(novo_preco);

        // 1. Identifica os nomes para a mensagem
        const [infos] = await db.query(`
            SELECT m.med_nome, f.farm_nome 
            FROM medicamento m, farmacia f 
            WHERE m.med_id = ? AND f.farm_id = ?
        `, [medicamento_id, farmacia_id]);

        if (infos.length === 0) return;
        const { med_nome, farm_nome } = infos[0];

        // 2. Verifica alertas
        const [alertas] = await db.query(`
            SELECT * FROM alertas 
            WHERE ativo = 1 
            AND ? LIKE CONCAT('%', termo_busca, '%') 
            AND preco_alvo >= ?
        `, [med_nome, precoNumerico]);

        // 3. Cria as notificações
        for (const alerta of alertas) {
            const mensagem = `O ${med_nome} atingiu seu alvo! Agora por R$ ${precoNumerico.toFixed(2).replace('.', ',')} na ${farm_nome}.`;

            const [duplicada] = await db.query(`
                SELECT id FROM notificacoes 
                WHERE usuario_id = ? AND mensagem = ? AND data_notificacao > DATE_SUB(NOW(), INTERVAL 1 DAY)
            `, [alerta.usuario_id, mensagem]);

            if (duplicada.length === 0) {
                await db.query(`INSERT INTO notificacoes (usuario_id, titulo, mensagem) VALUES (?, ?, ?)`, 
                    [alerta.usuario_id, 'Preço Baixou! 📉', mensagem]);
                
                console.log(`[ALERTA] Notificação enviada para o usuário ${alerta.usuario_id}`);
            }
        }
    } catch (error) {
        console.error("Erro ao verificar alertas em MedPreco:", error);
    }
}

module.exports = {
    
  // 1. LISTAR
  async listarMedPreco(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM medpreco');
      return res.status(200).json({ sucesso: true, dados: rows });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: error.message });
    }
  },

  // 2. CADASTRAR (Nome exato: cadastrarMedPreco)
  async cadastrarMedPreco(req, res) {
    try {
      const { medicamento_id, farmacia_id, medp_preco } = req.body;

      if (!medicamento_id || !farmacia_id || medp_preco === undefined) {
        return res.status(400).json({ sucesso: false, mensagem: 'Dados incompletos.' });
      }

      const sql = 'INSERT INTO medpreco (farmacia_id, medicamento_id, medp_preco) VALUES (?, ?, ?);';
      const [rows] = await db.query(sql, [farmacia_id, medicamento_id, medp_preco]);

      // Gatilho
      verificarDisparoDeAlertas(medicamento_id, farmacia_id, medp_preco);

      return res.status(201).json({ sucesso: true, mensagem: 'Preço cadastrado.', dados: { medp_id: rows.insertId } });

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, mensagem: 'Preço já existe.' });
      return res.status(500).json({ sucesso: false, mensagem: error.message });
    }
  },

  // 3. EDITAR
  async editarMedPreco(req, res) {
    try {
      const { medp_preco } = req.body;
      const { medp_id } = req.params;

      if (medp_preco === undefined) return res.status(400).json({ sucesso: false, mensagem: 'Novo preço obrigatório.' });

      const [antigo] = await db.query('SELECT medicamento_id, farmacia_id FROM medpreco WHERE medp_id = ?', [medp_id]);

      const sql = 'UPDATE medpreco SET medp_preco = ? WHERE medp_id = ?;';
      const [result] = await db.query(sql, [medp_preco, medp_id]);

      if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, mensagem: 'Não encontrado.' });

      // Gatilho
      if (antigo.length > 0) {
          verificarDisparoDeAlertas(antigo[0].medicamento_id, antigo[0].farmacia_id, medp_preco);
      }

      return res.status(200).json({ sucesso: true, mensagem: 'Preço atualizado.' });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: error.message });
    }
  },

  // 4. APAGAR
  async apagarMedPreco(req, res) {
    try {
      const { medp_id } = req.params;
      const [result] = await db.query('DELETE FROM medpreco WHERE medp_id = ?;', [medp_id]);
      
      if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, mensagem: 'Não encontrado.' });
      
      return res.status(200).json({ sucesso: true, mensagem: 'Removido.' });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: error.message });
    }
  }
};