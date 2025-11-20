const db = require('../dataBase/connection');

module.exports = {
  // ==================================================================
  // LISTAR TODAS AS CIDADES
  // ==================================================================
  async listarCidade(request, response) {
    try {
      const sql = 'SELECT cidade_id, nome_cidade, uf_sigla FROM cidade;';
      
      // O destructuring [rows] pega o primeiro elemento do array de resposta do mysql2
      const [rows] = await db.query(sql);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de cidades recuperada com sucesso.',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar cidades.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // LISTAR ESTADOS (UFs) ÚNICOS
  // ==================================================================
  async listarUfs(request, response) {
    try {
      // DISTINCT garante que não venham siglas repetidas (ex: SP, SP, SP vira apenas SP)
      const sql = 'SELECT DISTINCT uf_sigla FROM cidade ORDER BY uf_sigla;';
      
      const [rows] = await db.query(sql);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de UFs disponíveis.',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar UFs.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // CADASTRAR NOVA CIDADE
  // ==================================================================
  async cadastrarCidade(request, response) {
    try {
      const { nome_cidade, uf_sigla } = request.body;

      // 1. VALIDAÇÃO: Garante que os dados obrigatórios chegaram
      if (!nome_cidade || !uf_sigla) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nome da cidade e UF são obrigatórios.'
        });
      }

      // 2. VALIDAÇÃO UF: Garante que a UF tem apenas 2 letras
      if (uf_sigla.length !== 2) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'A UF deve conter exatamente 2 letras.'
        });
      }

      const sql = 'INSERT INTO cidade (nome_cidade, uf_sigla) VALUES (?, ?);';
      const values = [nome_cidade, uf_sigla.toUpperCase()]; // Força UF maiúscula
      
      // 'result' contém informações sobre a inserção (ex: insertId)
      const [result] = await db.query(sql, values);

      return response.status(201).json({ // 201 = Created
        sucesso: true,
        mensagem: 'Cidade cadastrada com sucesso.',
        dados: { 
            cidade_id: result.insertId,
            nome_cidade,
            uf_sigla: uf_sigla.toUpperCase()
        }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao cadastrar cidade.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // EDITAR CIDADE
  // ==================================================================
  async editarCidade(request, response) {
    try {
      const { nome_cidade, uf_sigla } = request.body;
      const { cidade_id } = request.params;

      // Validação básica
      if (!nome_cidade || !uf_sigla) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nome da cidade e UF são obrigatórios para edição.'
        });
      }

      const sql = 'UPDATE cidade SET nome_cidade = ?, uf_sigla = ? WHERE cidade_id = ?;';
      const values = [nome_cidade, uf_sigla.toUpperCase(), cidade_id];
      
      const [result] = await db.query(sql, values);

      // Verifica se alguma linha foi afetada. Se for 0, o ID não existe.
      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Cidade não encontrada para edição.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Cidade editada com sucesso.',
        dados: { cidade_id, nome_cidade, uf_sigla }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao editar cidade.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // APAGAR CIDADE
  // ==================================================================
  async apagarCidade(request, response) {
    try {
      const { cidade_id } = request.params;
      
      const sql = 'DELETE FROM cidade WHERE cidade_id = ?;';
      const values = [cidade_id];
      
      const [result] = await db.query(sql, values);

      // Verifica se algo foi realmente apagado
      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Cidade não encontrada para exclusão.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Cidade apagada com sucesso.'
      });
    } catch (error) {
      // Erro comum aqui: Tentar apagar cidade vinculada a uma farmácia (Erro de chave estrangeira/Foreign Key)
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Não é possível apagar esta cidade pois existem farmácias ou endereços vinculados a ela.'
        });
      }

      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao apagar cidade.',
        dados: error.message
      });
    }
  }
};