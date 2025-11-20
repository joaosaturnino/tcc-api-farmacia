const db = require('../dataBase/connection');
// Importa o helper para gerar URLs completas de imagens
const { gerarUrl } = require('../utils/gerarUrl');

// Helper simples para padronizar respostas de erro 500
const handleServerError = (response, error) => {
  console.error("Erro no servidor:", error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor.',
    dados: error.message
  });
};

module.exports = {
  // ==================================================================
  // LISTA GERAL DE FAVORITOS (ADMINISTRATIVO)
  // Mostra quais são os medicamentos mais favoritados no sistema todo
  // ==================================================================
  async listarFavoritos(request, response) {
    try {
      // Agrupa por medicamento e conta quantos favoritos cada um tem
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

  // ==================================================================
  // LISTAR FAVORITOS DE UMA FARMÁCIA (ADMINISTRATIVO)
  // Mostra quais produtos daquela farmácia são os favoritos dos usuários
  // ==================================================================
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

  // ==================================================================
  // LISTAR FAVORITOS DE UM USUÁRIO (APP)
  // Usado na tela "Meus Favoritos" do aplicativo
  // ==================================================================
  async listarFavoritosPorUsuario(request, response) {
    try {
      const { usuario_id } = request.params;
      
      if (!usuario_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID do usuário é obrigatório.' });
      }
      
      // QUERY IMPORTANTE:
      // Usamos LEFT JOIN em 'medpreco' para garantir que o favorito apareça na lista
      // mesmo se a farmácia tiver parado de vender o produto (preço null).
      // Isso evita que o item suma misteriosamente da lista do usuário.
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
          
          -- Se não tiver preço (produto indisponível), retornará NULL
          mp.medp_preco,
          
          tp.nome_tipo,
          frm.forma_nome,
          
          -- Dados de promoção (se houver)
          p.promo_desconto,
          p.promo_inicio,
          p.promo_fim
        FROM favoritos fav
        INNER JOIN medicamento med ON fav.medicamento_id = med.med_id
        
        -- LEFT JOIN crucial aqui:
        LEFT JOIN medpreco mp ON fav.medicamento_id = mp.medicamento_id AND fav.farmacia_id = mp.farmacia_id
        
        LEFT JOIN laboratorios lab ON med.lab_id = lab.lab_id
        LEFT JOIN tipo_produto tp ON med.tipo_id = tp.tipo_id
        LEFT JOIN forma_farmaceutica frm ON med.forma_id = frm.forma_id
        
        -- Verifica promoção válida hoje
        LEFT JOIN promocao p ON mp.medicamento_id = p.medicamento_id 
                           AND mp.farmacia_id = p.farmacia_id
                           AND p.promo_inicio <= CURDATE() 
                           AND p.promo_fim >= CURDATE()
                           
        WHERE fav.usuario_id = ?
        ORDER BY med.med_nome ASC;
      `;
      
      const [rows] = await db.query(sql, [usuario_id]);
      
      // Adiciona a URL completa para a imagem do medicamento
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

  // ==================================================================
  // ADICIONAR FAVORITO
  // ==================================================================
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
      // Erro específico de banco para entrada duplicada (usuário tentando favoritar o mesmo item 2x)
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ sucesso: false, mensagem: 'Este medicamento já está nos favoritos.' });
      }
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // REMOVER FAVORITO
  // ==================================================================
  async apagarFavoritos(request, response) {
    try {
      const { fav_id } = request.params;
      // É importante receber o usuario_id no body (ou token) para garantir que
      // um usuário não apague o favorito de outro.
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
      return response.status(200).json({ sucesso: true, mensagem: 'Favorito removido com sucesso.' });
    } catch (error) {
      return handleServerError(response, error);
    }
  },
};