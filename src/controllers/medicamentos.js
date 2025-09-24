const db = require('../dataBase/connection');

module.exports = {
  /**
   * Lista todos os medicamentos.
   */
  async listarMedicamentos(request, response) {
    try {
      // A query seleciona os campos principais para a listagem.
      const sql = `SELECT med_id, med_nome, med_dosagem, med_quantidade, 
                  forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_data_cadastro, med_data_atualizacao, med_ativo FROM medicamento;`;
      const [rows] = await db.query(sql); // Executa a consulta no banco de dados.
      
      // Retorna uma resposta de sucesso com a lista de medicamentos.
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de medicamentos recuperada com sucesso.',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      // Em caso de erro, retorna uma resposta de erro 500.
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        erro: error.message
      });
    }
  },

  /**
   * Busca um único medicamento pelo seu ID.
   */
  async listarMedicamentoPorId(request, response) {
    try {
      const { med_id } = request.params; // Extrai o ID dos parâmetros da rota.
      
      const sql = `SELECT * FROM medicamento WHERE med_id = ?;`; // Query para buscar um único item.
      const values = [med_id]; // Parâmetros seguros para evitar SQL Injection.
      const [rows] = await db.query(sql, values);

      // MELHORIA: Se nenhum registro for encontrado, retorna um erro 404.
      if (rows.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Medicamento não encontrado.',
        });
      }

      // Retorna o medicamento encontrado.
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Dados do medicamento recuperados com sucesso.',
        dados: rows[0]
      });

    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        erro: error.message
      });
    }
  },

  /**
   * Cadastra um novo medicamento.
   */
  async cadastrarMedicamentos(request, response) {
    try {
      // Extrai os dados do corpo da requisição.
      const { med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, med_imagem, tipo_id } = request.body;

      // MELHORIA: Validação para campos obrigatórios.
      if (!med_nome || !med_dosagem) {
        return response.status(400).json({ // 400 = Bad Request
          sucesso: false,
          mensagem: 'Nome e dosagem são campos obrigatórios.',
        });
      }
      
      const sql = `INSERT INTO medicamento (med_nome, med_dosagem, med_quantidade, 
                  forma_id, med_descricao, lab_id, med_imagem, tipo_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`; // Query de inserção.
      const values = [med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, med_imagem, tipo_id];
      const [result] = await db.query(sql, values);
      
      // Retorna uma resposta de sucesso com o ID do novo medicamento.
      return response.status(201).json({ // 201 = Created (mais apropriado para POST)
        sucesso: true,
        mensagem: 'Medicamento cadastrado com sucesso.',
        dados: { med_id: result.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        erro: error.message
      });
    }
  },

  /**
   * Edita um medicamento existente.
   */
  async editarMedicamentos(request, response) {
    try {
      const { med_id } = request.params; // ID do medicamento a ser editado.
      const { med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_ativo } = request.body; // Novos dados.

      // MELHORIA: Validação para campos obrigatórios.
      if (!med_nome || !med_dosagem) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nome e dosagem são campos obrigatórios.',
        });
      }

      const sql = `UPDATE medicamento SET med_nome = ?, med_dosagem = ?, med_quantidade = ?, 
                  forma_id = ?, med_descricao = ?, lab_id = ?, med_imagem = ?, tipo_id = ?, med_ativo = ?
                  WHERE med_id = ?;`; // Query de atualização.
      const values = [med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_ativo, med_id];
      
      const [result] = await db.query(sql, values);
      
      // MELHORIA: Verifica se o registro foi realmente atualizado.
      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Medicamento não encontrado com o ID fornecido.',
        });
      }
      
      // Retorna uma resposta de sucesso.
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Medicamento atualizado com sucesso.',
        dados: { med_id: parseInt(med_id) } // Retorna o ID do item atualizado.
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        erro: error.message
      });
    }
  },

  /**
   * Apaga um medicamento.
   */
  async apagarMedicamentos(request, response) {
    try {
      const { med_id } = request.params; // ID do medicamento a ser apagado.
      
      const sql = 'DELETE FROM medicamento WHERE med_id = ?;'; // Query de exclusão.
      const values = [med_id];
      const [result] = await db.query(sql, values);
      
      // MELHORIA: Verifica se o registro foi realmente apagado.
      if (result.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Medicamento não encontrado com o ID fornecido.',
        });
      }
      
      // Retorna uma resposta de sucesso.
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Medicamento apagado com sucesso.'
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        erro: error.message
      });
    }
  }
};