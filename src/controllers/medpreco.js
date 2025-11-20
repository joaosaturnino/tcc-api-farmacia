const db = require('../dataBase/connection');

module.exports = {
  // ==================================================================
  // LISTAR PREÇOS (RAW)
  // Lista todas as associações de preço sem muitos detalhes visuais
  // ==================================================================
  async listarMedPreco(request, response) {
    try {
      const sql = 'SELECT medp_id, medicamento_id, farmacia_id, medp_preco FROM medpreco;';
      const [rows] = await db.query(sql);

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de preços de medicamentos recuperada.',
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

  // ==================================================================
  // CADASTRAR NOVO PREÇO (OFERTA)
  // Vincula um medicamento a uma farmácia com um valor
  // ==================================================================
  async cadastrarMedPreco(request, response) {
    try {
      const { medicamento_id, farmacia_id, medp_preco } = request.body;

      // 1. Validação de campos obrigatórios
      if (!medicamento_id || !farmacia_id || medp_preco === undefined) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Medicamento, Farmácia e Preço são obrigatórios.'
        });
      }

      const sql = 'INSERT INTO medpreco (farmacia_id, medicamento_id, medp_preco) VALUES (?, ?, ?);';
      const values = [farmacia_id, medicamento_id, medp_preco];
      
      const [rows] = await db.query(sql, values);

      return response.status(201).json({
        sucesso: true,
        mensagem: 'Preço cadastrado com sucesso.',
        dados: { medp_id: rows.insertId }
      });

    } catch (error) {
      // Verifica duplicidade (se a farmácia tentar cadastrar o mesmo remédio 2x)
      if (error.code === 'ER_DUP_ENTRY') {
          return response.status(409).json({
              sucesso: false,
              mensagem: 'Este medicamento já possui um preço cadastrado nesta farmácia.'
          });
      }

      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // EDITAR PREÇO
  // Atualiza o valor de uma oferta existente
  // ==================================================================
  async editarMedPreco(request, response) {
    try {
      const { medp_preco } = request.body;
      const { medp_id } = request.params;

      // Validação
      if (medp_preco === undefined) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'O novo preço é obrigatório.'
        });
      }

      const sql = 'UPDATE medpreco SET medp_preco = ? WHERE medp_id = ?;';
      const values = [medp_preco, medp_id];
      
      const [result] = await db.query(sql, values);

      // Verifica se o ID existia
      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Registro de preço não encontrado.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Preço atualizado com sucesso.'
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // APAGAR PREÇO (REMOVER OFERTA)
  // ==================================================================
  async apagarMedPreco(request, response) {
    try {
      const { medp_id } = request.params;
      
      const sql = 'DELETE FROM medpreco WHERE medp_id = ?;';
      const values = [medp_id];
      
      const [result] = await db.query(sql, values);

      // Verifica se algo foi apagado
      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Registro de preço não encontrado para exclusão.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Preço removido com sucesso.'
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  }
};