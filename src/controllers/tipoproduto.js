const db = require('../dataBase/connection');

module.exports = {
  // ==================================================================
  // LISTAR TIPOS DE PRODUTO
  // ==================================================================
  async listarTipoProduto(request, response) {
    try {
      const sql = 'SELECT tipo_id, nome_tipo FROM tipo_produto;';
      
      const [rows] = await db.query(sql);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de tipos de produto recuperada com sucesso.',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar tipos de produto.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // CADASTRAR NOVO TIPO
  // ==================================================================
  async cadastrarTipoProduto(request, response) {
    try {
      const { nome_tipo } = request.body;

      // 1. Validação: O nome é obrigatório
      if (!nome_tipo) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'O nome do tipo de produto é obrigatório.'
        });
      }

      const sql = 'INSERT INTO tipo_produto (nome_tipo) VALUES (?);';
      const values = [nome_tipo];
      
      const [result] = await db.query(sql, values);

      return response.status(201).json({
        sucesso: true,
        mensagem: 'Tipo de produto cadastrado com sucesso.',
        dados: { 
            tipo_id: result.insertId,
            nome_tipo 
        }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao cadastrar tipo de produto.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // EDITAR TIPO
  // ==================================================================
  async editarTipoProduto(request, response) {
    try {
      const { nome_tipo } = request.body;
      const { tipo_id } = request.params;

      if (!nome_tipo) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'O nome do tipo de produto é obrigatório para edição.'
        });
      }

      const sql = 'UPDATE tipo_produto SET nome_tipo = ? WHERE tipo_id = ?;';
      const values = [nome_tipo, tipo_id];
      
      const [result] = await db.query(sql, values);

      // Verifica se o ID existia
      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Tipo de produto não encontrado para edição.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Tipo de produto editado com sucesso.',
        dados: { tipo_id, nome_tipo }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao editar tipo de produto.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // APAGAR TIPO
  // ==================================================================
  async apagarTipoProduto(request, response) {
    try {
      const { tipo_id } = request.params;
      
      const sql = 'DELETE FROM tipo_produto WHERE tipo_id = ?;';
      const values = [tipo_id];
      
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Tipo de produto não encontrado para exclusão.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Tipo de produto apagado com sucesso.'
      });

    } catch (error) {
      // TRATAMENTO IMPORTANTE:
      // Se tentar apagar um Tipo que já está vinculado a um Medicamento, o banco vai bloquear.
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
          return response.status(400).json({
              sucesso: false,
              mensagem: 'Não é possível apagar este tipo pois existem medicamentos vinculados a ele.'
          });
      }

      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao apagar tipo de produto.',
        dados: error.message
      });
    }
  }
};