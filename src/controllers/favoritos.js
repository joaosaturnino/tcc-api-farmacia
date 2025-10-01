const db = require('../dataBase/connection');

module.exports = {
  async listarFavoritos(request, response) {
    try {
      const sql = `
        SELECT 
          med.med_id,
          med.med_nome,
          med.med_dosagem,
          lab.lab_nome AS fabricante_nome,
          COUNT(fav.fav_id) AS favoritacoes_count
        FROM favoritos fav
        INNER JOIN medicamento med ON fav.medicamento_id = med.med_id
        INNER JOIN laboratorios lab ON med.lab_id = lab.lab_id
        GROUP BY med.med_id, med.med_nome, med.med_dosagem, lab.lab_nome
        ORDER BY favoritacoes_count DESC;
      `;
      
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista geral de favoritos',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // Esta é a função que sua página de favoritos deve usar.
  // Ela busca os favoritos de UMA farmácia específica.
  async listarFavoritosPorFarmacia(request, response) {
    try {
      const { farm_id } = request.params;

      if (!farm_id) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'O ID da farmácia é obrigatório.',
        });
      }
      
      const sql = `
        SELECT 
          med.med_id,
          med.med_nome,
          med.med_dosagem,
          med.med_data_atualizacao,
          lab.lab_nome AS fabricante_nome,
          COUNT(fav.fav_id) AS favoritacoes_count
        FROM favoritos fav
        INNER JOIN medicamento med ON fav.medicamento_id = med.med_id
        INNER JOIN laboratorios lab ON med.lab_id = lab.lab_id
        WHERE fav.farmacia_id = ?
        GROUP BY med.med_id, med.med_nome, med.med_dosagem, med.med_data_atualizacao, lab.lab_nome
        ORDER BY favoritacoes_count DESC;
      `;
      
      const [rows] = await db.query(sql, [farm_id]);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: `Lista de medicamentos favoritados para a farmácia ${farm_id}`,
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async cadastrarFavoritos(request, response) {
    try {
      const { usuario_id, farmacia_id, medicamento_id } = request.body;
       if (!usuario_id || !farmacia_id || !medicamento_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'Todos os IDs (usuário, farmácia, medicamento) são obrigatórios.' });
      }
      const sql = 'INSERT INTO favoritos (usuario_id, farmacia_id, medicamento_id) VALUES (?, ?, ?);';
      const values = [usuario_id, farmacia_id, medicamento_id];
      const [result] = await db.query(sql, values);
      return response.status(201).json({
        sucesso: true,
        mensagem: 'Favorito cadastrado com sucesso.',
        dados: { fav_id: result.insertId }
      });
    } catch (error) {
       if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ sucesso: false, mensagem: 'Este item já foi favoritado.' });
      }
      return handleServerError(response, error);
    }
  },

  // CORRIGIDO: A função de apagar agora é segura e valida o ID da farmácia.
  async apagarFavoritos(request, response) {
    try {
      const { fav_id } = request.params;
      // O farmacia_id deve ser enviado no corpo da requisição para validação
      const { farmacia_id } = request.body;

      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID da farmácia é obrigatório para excluir.' });
      }

      const sql = 'DELETE FROM favoritos WHERE fav_id = ? AND farmacia_id = ?;';
      const values = [fav_id, farmacia_id];
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Favorito não encontrado ou não pertence a esta farmácia.',
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Favorito apagado com sucesso.',
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },


  async listarFavoritosComLaboratorio(request, response) {
  try {
    try {
      const { fav_id } = request.params;
      const sql = 'SELECT f.fav_id, f.usuario_id, f.farmacia_id, f.medicamento_id, l.lab_id, l.lab_nome FROM favoritos f INNER JOIN medicamento m ON f.medicamento_id = m.med_id INNER JOIN laboratorios l ON m.lab_id = l.lab_id;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de favoritos',
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
    const query = `
      
    `;

    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    res.status(500).json({ error: 'Erro ao listar favoritos com laboratório' });
  }
},
};