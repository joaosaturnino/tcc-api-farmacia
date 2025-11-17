const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl');

// Função de erro auxiliar
const handleServerError = (response, error) => {
  console.error("Erro no servidor:", error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor.',
    dados: error.message
  });
};

module.exports = {
  // Rota de Admin (sem alteração)
  async listarFavoritos(request, response) {
    try {
      const sql = `
        SELECT 
          med.med_id, med.med_nome, med.med_dosagem, lab.lab_nome AS fabricante_nome,
          COUNT(fav.fav_id) AS favoritacoes_count
        FROM favoritos fav
        INNER JOIN medicamento med ON fav.medicamento_id = med.med_id
        INNER JOIN laboratorios lab ON med.lab_id = lab.lab_id
        GROUP BY med.med_id, med.med_nome, med.med_dosagem, lab.lab_nome
        ORDER BY favoritacoes_count DESC;
      `;
      const [rows] = await db.query(sql);
      return response.status(200).json({ sucesso: true, mensagem: 'Lista geral de favoritos', itens: rows.length, dados: rows });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // Rota de Admin (sem alteração)
  async listarFavoritosPorFarmacia(request, response) {
    try {
      const { farm_id } = request.params;
      if (!farm_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID da farmácia é obrigatório.' });
      }
      const sql = `
        SELECT 
          med.med_id, med.med_nome, med.med_dosagem, lab.lab_nome AS fabricante_nome,
          MAX(med.med_data_atualizacao) as med_data_atualizacao,
          COUNT(fav.fav_id) AS favoritacoes_count
        FROM favoritos fav
        INNER JOIN medicamento med ON fav.medicamento_id = med.med_id
        INNER JOIN laboratorios lab ON med.lab_id = lab.lab_id
        WHERE fav.farmacia_id = ?
        GROUP BY med.med_id, med.med_nome, med.med_dosagem, lab.lab_nome
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

  
  // --- CORREÇÃO APLICADA AQUI ---
  async listarFavoritosPorUsuario(request, response) {
    try {
      const { usuario_id } = request.params;
      if (!usuario_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID do usuário é obrigatório.' });
      }
      
      // CORREÇÃO: Voltamos o 'INNER JOIN' para 'LEFT JOIN'
      // Isso traz os favoritos mesmo que o preço (medpreco) tenha sido deletado
      const sql = `
        SELECT 
          fav.fav_id, 
          med.med_id, 
          med.med_nome, 
          med.med_dosagem,
          med.med_quantidade,
          med.med_descricao,
          med.med_imagem,
          lab.lab_nome AS fabricante_nome, 
          fav.farmacia_id,
          mp.medp_preco,
          tp.nome_tipo,
          frm.forma_nome,
          p.promo_desconto,
          p.promo_inicio,
          p.promo_fim
        FROM favoritos fav
        INNER JOIN medicamento med ON fav.medicamento_id = med.med_id
        
        -- MUDANÇA DE INNER PARA LEFT AQUI --
        LEFT JOIN medpreco mp ON fav.medicamento_id = mp.medicamento_id AND fav.farmacia_id = mp.farmacia_id
        
        LEFT JOIN laboratorios lab ON med.lab_id = lab.lab_id
        LEFT JOIN tipo_produto tp ON med.tipo_id = tp.tipo_id
        LEFT JOIN forma_farmaceutica frm ON med.forma_id = frm.forma_id
        LEFT JOIN promocao p ON mp.medicamento_id = p.medicamento_id 
                           AND mp.farmacia_id = p.farmacia_id
                           AND p.promo_inicio <= CURDATE() 
                           AND p.promo_fim >= CURDATE()
        WHERE fav.usuario_id = ?
        ORDER BY med.med_nome ASC;
      `;
      const [rows] = await db.query(sql, [usuario_id]);
      
      const dadosComUrl = rows.map(item => ({
        ...item,
        med_imagem: gerarUrl(item.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));
      
      return response.status(200).json({
        sucesso: true,
        mensagem: `Lista de medicamentos favoritados para o usuário ${usuario_id}`,
        itens: dadosComUrl.length,
        dados: dadosComUrl
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },
  // ---------------------------------

  // Rota de Adicionar (sem alteração)
  async cadastrarFavoritos(request, response) {
    try {
      const { usuario_id, farmacia_id, medicamento_id } = request.body;
      if (!usuario_id || !farmacia_id || !medicamento_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'Os campos usuario_id, farmacia_id e medicamento_id são obrigatórios.' });
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
        return response.status(409).json({ sucesso: false, mensagem: 'Este medicamento já foi favoritado por este usuário.' });
      }
      return handleServerError(response, error);
    }
  },

  // Rota de Apagar (sem alteração)
  async apagarFavoritos(request, response) {
    try {
      const { fav_id } = request.params;
      const { usuario_id } = request.body; 
      
      if (!usuario_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID do usuário é obrigatório para autorizar a exclusão.' });
      }
      if (!fav_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID do favorito é obrigatório.' });
      }

      const sql = 'DELETE FROM favoritos WHERE fav_id = ? AND usuario_id = ?;';
      const values = [fav_id, usuario_id];
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Favorito não encontrado ou você não tem permissão para excluí-lo.',
        });
      }
      return response.status(200).json({ sucesso: true, mensagem: 'Favorito apagado com sucesso.' });
    } catch (error) {
      return handleServerError(response, error);
    }
  },
};