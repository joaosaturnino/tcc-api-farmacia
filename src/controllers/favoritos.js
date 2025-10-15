const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl');

// Função de erro auxiliar para manter o código limpo e consistente
const handleServerError = (response, error) => {
  console.error("Erro no servidor:", error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor.',
    dados: error.message
  });
};

module.exports = {
  /**
   * Lista todos os medicamentos favoritados de forma agregada em todo o sistema.
   */
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

  /**
   * Lista os medicamentos favoritados de uma farmácia específica, corrigindo a lógica de agregação.
   */
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

  /**
   * CORRIGIDO: Lista os itens favoritados por um usuário, buscando a imagem na tabela `medpreco`.
   */
  async listarFavoritosPorUsuario(request, response) {
    try {
      const { usuario_id } = request.params;
      if (!usuario_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID do usuário é obrigatório.' });
      }
      
      // CORREÇÃO: A consulta agora junta a tabela `medpreco` para obter a imagem específica da farmácia.
      const sql = `
        SELECT 
          fav.fav_id, 
          med.med_id, 
          med.med_nome, 
          med.med_dosagem, 
          mp.medp_imagem, -- <-- Coluna de imagem corrigida
          lab.lab_nome AS fabricante_nome, 
          fav.farmacia_id 
        FROM favoritos fav
        INNER JOIN medicamento med ON fav.medicamento_id = med.med_id
        LEFT JOIN laboratorios lab ON med.lab_id = lab.lab_id
        LEFT JOIN medpreco mp ON fav.medicamento_id = mp.medicamento_id AND fav.farmacia_id = mp.farmacia_id
        WHERE fav.usuario_id = ?
        ORDER BY med.med_nome ASC;
      `;
      const [rows] = await db.query(sql, [usuario_id]);
      
      // Gera a URL completa para a imagem de cada medicamento favoritado.
      const dadosComUrl = rows.map(item => ({
        ...item,
        med_imagem_url: gerarUrl(item.medp_imagem, 'medicamentos', 'sem-imagem.png') // <-- Campo de imagem corrigido
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

  /**
   * Adiciona um novo item aos favoritos.
   */
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
      // Trata de forma específica a violação de chave única (tentativa de favoritar duas vezes)
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ sucesso: false, mensagem: 'Este medicamento já foi favoritado por este usuário.' });
      }
      return handleServerError(response, error);
    }
  },

  /**
   * Remove um item dos favoritos, com verificação de permissão.
   */
  async apagarFavoritos(request, response) {
    try {
      const { fav_id } = request.params;
      const { farmacia_id } = request.body; // A farmácia logada deve ser a dona do favorito
      
      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID da farmácia é obrigatório para autorizar a exclusão.' });
      }
      if (!fav_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O ID do favorito é obrigatório.' });
      }

      const sql = 'DELETE FROM favoritos WHERE fav_id = ? AND farmacia_id = ?;';
      const values = [fav_id, farmacia_id];
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