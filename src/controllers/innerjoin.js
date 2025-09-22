const db = require('../dataBase/connection');
const { json, response } = require('express');

module.exports = {

  // listar medicamento especifico
  async listarMedicamentoInner(request, response) {
    try {
      const sql = `SELECT
      md.med_id, md.med_nome, md.med_dosagem, md.med_quantidade,
      md.med_img, md.tipo_id, md.forma_id,
        lb.nome_laboratorio, mp.preco, mp.farmacia_id, frm.farm_nome, md.descricao
        FROM medicamento md
        INNER JOIN laboratorio lb ON md.lab_id = lb.lab_id
        INNER JOIN medpreco mp ON md.med_id = mp.med_id
        INNER JOIN farmacia frm ON mp.farmacia_id = frm.farm_id
        `;
      
        // executa a instrução de listagem no banco de dados
        const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Medicamento encontrado.',
        itens: rows.length,
        dados: rows
      });
    // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  

  

};
