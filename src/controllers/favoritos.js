const db = require('../dataBase/connection');

module.exports = {
  async listarFavoritos(request, response) {
    try {
      const sql = `
        SELECT 
          med.med_id,
          med.med_nome,
          med.med_dosagem,
          
          med.med_data_atualizacao,
          lab.lab_nome AS fabricante_nome,
          (SELECT COUNT(*) FROM favoritos WHERE medicamento_id = med.med_id) AS favoritacoes_count
        FROM favoritos fav
        INNER JOIN medicamento med ON fav.medicamento_id = med.med_id
        INNER JOIN laboratorios lab ON med.lab_id = lab.lab_id
        GROUP BY med.med_id
        ORDER BY favoritacoes_count DESC;
      `;
      
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
  },

  async cadastrarFavoritos(request, response) {
    try {
      const { usuario_id, farmacia_id, medicamento_id } = request.body;
      const sql = 'INSERT INTO favoritos (usuario_id, farmacia_id, medicamento_id) VALUES (?, ?, ?);';
      const values = [usuario_id, farmacia_id, medicamento_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Favorito cadastrado com sucesso.',
        dados: { fav_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async apagarFavoritos(request, response) {
    try {
      const { fav_id } = request.params;
      const sql = 'DELETE FROM favoritos WHERE fav_id = ?;';
      const values = [fav_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Favorito apagado com sucesso.',
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