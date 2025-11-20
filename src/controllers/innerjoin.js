const db = require('../dataBase/connection');
// Importamos o helper para garantir que a URL da imagem venha completa (com IP)
const { gerarUrl } = require('../utils/gerarUrl');

module.exports = {

  // ==================================================================
  // LISTAGEM COMPLETA COM INNER JOIN
  // Traz dados unificados de Medicamento, Laboratório, Preço e Farmácia
  // ==================================================================
  async listarMedicamentoInner(request, response) {
    try {
      // A Query utiliza ALIAS (apelidos) para as tabelas:
      // m = medicamento, l = laboratorios, mp = medpreco, f = farmacia
      const sql = `
        SELECT
          m.med_id,
          m.med_nome,
          m.med_dosagem,
          m.med_quantidade,
          m.med_imagem,        -- Nome correto da coluna no banco
          m.med_descricao,
          
          l.lab_nome,          -- Nome do laboratório
          
          mp.medp_preco,       -- Preço vindo da tabela medpreco
          
          f.farm_id,
          f.farm_nome          -- Nome da farmácia que vende
          
        FROM medicamento m
        -- Liga o medicamento ao laboratório (1 medicamento tem 1 laboratório)
        INNER JOIN laboratorios l ON m.lab_id = l.lab_id
        
        -- Liga o medicamento à tabela de preços (N:N com farmácias)
        -- Atenção: mp.medicamento_id é a chave estrangeira padrão
        INNER JOIN medpreco mp ON m.med_id = mp.medicamento_id
        
        -- Liga o preço à farmácia correspondente
        INNER JOIN farmacia f ON mp.farmacia_id = f.farm_id
        
        -- Opcional: Ordenar por nome do remédio
        ORDER BY m.med_nome ASC;
      `;
      
      // Executa a consulta no banco de dados
      const [rows] = await db.query(sql);

      // Processa as imagens para adicionar o IP do servidor
      const dadosComUrl = rows.map(item => ({
        ...item,
        med_imagem: gerarUrl(item.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));

      // Retorna sucesso
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Listagem completa realizada com sucesso.',
        itens: dadosComUrl.length,
        dados: dadosComUrl
      });

    } catch (error) {
      // Loga o erro no console do servidor para debug
      console.error('Erro no Inner Join:', error);

      // Retorna erro 500 para o cliente
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message // Corrigido de 'mensage' para 'message'
      });
    }
  },
};