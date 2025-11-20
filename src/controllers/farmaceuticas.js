const db = require('../dataBase/connection');

module.exports = {
  // ==================================================================
  // LISTAR TODAS AS FORMAS FARMACÊUTICAS
  // ==================================================================
  async listarFarmaceutica(request, response) {
    try {
      const sql = 'SELECT forma_id, forma_nome FROM forma_farmaceutica;';
      
      // [rows] desestrutura o primeiro item do array de retorno do mysql2
      const [rows] = await db.query(sql);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de formas farmacêuticas recuperada com sucesso.',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar formas farmacêuticas.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // CADASTRAR NOVA FORMA FARMACÊUTICA
  // ==================================================================
  async cadastrarFarmaceutica(request, response) {
    try {
      const { forma_nome } = request.body;

      // 1. VALIDAÇÃO: Garante que o nome foi enviado
      if (!forma_nome) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'O nome da forma farmacêutica é obrigatório.'
        });
      }

      const sql = 'INSERT INTO forma_farmaceutica (forma_nome) VALUES (?);';
      const values = [forma_nome];
      
      // 'result' contém metadados da inserção (como o ID gerado)
      const [result] = await db.query(sql, values);

      return response.status(201).json({ // 201 = Created
        sucesso: true,
        mensagem: 'Forma farmacêutica cadastrada com sucesso.',
        dados: { 
            forma_id: result.insertId,
            forma_nome 
        }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao cadastrar forma farmacêutica.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // EDITAR FORMA FARMACÊUTICA
  // ==================================================================
  async editarFarmaceutica(request, response) {
    try {
      const { forma_nome } = request.body;
      const { forma_id } = request.params;

      // Validação básica
      if (!forma_nome) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'O nome da forma farmacêutica é obrigatório para edição.'
        });
      }

      const sql = 'UPDATE forma_farmaceutica SET forma_nome = ? WHERE forma_id = ?;';
      const values = [forma_nome, forma_id];
      
      const [result] = await db.query(sql, values);

      // Verifica se o ID existia no banco
      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Forma farmacêutica não encontrada para edição.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Forma farmacêutica editada com sucesso.',
        dados: { forma_id, forma_nome }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao editar forma farmacêutica.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // APAGAR FORMA FARMACÊUTICA
  // ==================================================================
  async apagarFarmaceutica(request, response) {
    try {
      const { forma_id } = request.params;
      
      const sql = 'DELETE FROM forma_farmaceutica WHERE forma_id = ?;';
      const values = [forma_id];
      
      const [result] = await db.query(sql, values);

      // Verifica se algo foi apagado
      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Forma farmacêutica não encontrada para exclusão.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Forma farmacêutica apagada com sucesso.'
      });
    } catch (error) {
      // Tratamento de erro de Chave Estrangeira (Foreign Key)
      // Se tentar apagar uma forma (ex: "Comprimido") que está sendo usada em um Medicamento,
      // o banco retorna o erro 'ER_ROW_IS_REFERENCED_2'.
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Não é possível apagar esta forma pois existem medicamentos cadastrados com ela.'
        });
      }

      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao apagar forma farmacêutica.',
        dados: error.message
      });
    }
  }
};