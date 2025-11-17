const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl');

module.exports = {
  async listarCategoria(request, response) {
    try {
      const { tipo_id } = request.params;

      // --- CORREÇÃO: Query SQL Atualizada ---
      // Adicionamos o JOIN com a tabela 'promocao'
      const sql = `
        SELECT
          m.med_id,
          m.med_nome,
          m.med_dosagem,
          m.med_quantidade,
          m.med_descricao,
          m.med_imagem,
          l.lab_nome,
          f.farm_nome,
          f.farm_id,
          mp.medp_preco,
          tp.nome_tipo,
          frm.forma_nome,

          -- CAMPOS DE PROMOÇÃO ADICIONADOS --
          p.promo_desconto,
          p.promo_inicio,
          p.promo_fim
          
        FROM
          medicamento AS m
        INNER JOIN
          medpreco AS mp ON m.med_id = mp.medicamento_id
        INNER JOIN
          farmacia AS f ON mp.farmacia_id = f.farm_id
        INNER JOIN
          tipo_produto AS tp ON m.tipo_id = tp.tipo_id
        INNER JOIN
          laboratorios AS l ON m.lab_id = l.lab_id
        LEFT JOIN
          forma_farmaceutica AS frm ON m.forma_id = frm.forma_id
          
        -- JOIN DE PROMOÇÃO ADICIONADO --
        LEFT JOIN 
          promocao p ON mp.medicamento_id = p.medicamento_id 
                   AND mp.farmacia_id = p.farmacia_id
                   AND p.promo_inicio <= CURDATE() 
                   AND p.promo_fim >= CURDATE()
                   
        WHERE
          tp.tipo_id = ?
          AND m.med_ativo = true;
      `;
      // ----------------------------------------
      
      const values = [tipo_id];
      const [rows] = await db.query(sql, values);

      if (rows.length === 0) {
        return response.status(200).json({
          sucesso: true,
          mensagem: 'Nenhum medicamento encontrado para este tipo.',
          itens: 0,
          dados: []
        });
      }

      const dadosComUrl = rows.map(item => ({
        ...item,
        med_imagem: gerarUrl(item.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: `Lista de medicamentos para o tipo ID: ${tipo_id}`,
        itens: dadosComUrl.length,
        dados: dadosComUrl
      });

    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },
};