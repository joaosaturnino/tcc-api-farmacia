const db = require('../dataBase/connection');

module.exports = {
  async listarCategoria(request, response) {
    try {
      // Pega o 'tipo_id' dos parâmetros da rota (ex: /medicamentos/tipo/1)
      const { tipo_id } = request.params;

      const sql = `
        SELECT
          m.med_nome,
          m.med_dosagem,
          m.med_quantidade,
          m.med_descricao,
          l.lab_nome,
          f.farm_nome,
          mp.medp_preco,
          tp.nome_tipo
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
        WHERE
          tp.tipo_id = ?;
      `;
      
      const values = [tipo_id];
      const [rows] = await db.query(sql, values);

      // Verifica se encontrou resultados
      if (rows.length === 0) {
        return response.status(404).json({
          sucesso: true,
          mensagem: 'Nenhum medicamento encontrado para este tipo.',
          itens: 0,
          dados: []
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: `Lista de medicamentos para o tipo ID: ${tipo_id}`,
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
};