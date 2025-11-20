const db = require('../dataBase/connection');

module.exports = {
  // ==================================================================
  // LISTAR TODAS AS AVALIAÇÕES
  // ==================================================================
  async listarAvaliacao(request, response) {
    try {
      // SQL: Seleciona apenas as colunas necessárias para evitar tráfego de dados inútil
      const sql = 'SELECT ava_id, usuario_id, farmacia_id, ava_nota, ava_comentario FROM avaliacao;';
      
      // Executa a query no banco. O 'await' espera o banco responder.
      const [rows] = await db.query(sql);
      
      // Retorna status 200 (OK) com a lista
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de avaliações recuperada com sucesso.',
        itens: rows.length, // Conta quantos itens vieram
        dados: rows
      });
    } catch (error) {
      // Se der erro no banco, retorna 500 (Erro Interno)
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar avaliações.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // CADASTRAR UMA NOVA AVALIAÇÃO
  // ==================================================================
  async cadastrarAvaliacao(request, response) {
    try {
      // Desestruturação: retira as variáveis de dentro do corpo da requisição (JSON)
      const { usuario_id, farmacia_id, ava_nota, ava_comentario } = request.body;

      // 1. VALIDAÇÃO BÁSICA: Verifica se campos obrigatórios existem
      if (!usuario_id || !farmacia_id || ava_nota === undefined) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Usuário, Farmácia e Nota são obrigatórios.'
        });
      }

      // 2. VALIDAÇÃO DA NOTA: Garante que seja entre 1 e 5
      if (ava_nota < 1 || ava_nota > 5) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'A nota deve ser entre 1 e 5.'
        });
      }

      // SQL de Inserção com placeholders (?) para evitar SQL Injection
      const sql = 'INSERT INTO avaliacao (usuario_id, farmacia_id, ava_nota, ava_comentario) VALUES (?, ?, ?, ?);';
      const values = [usuario_id, farmacia_id, ava_nota, ava_comentario];
      
      // Executa a inserção
      const [rows] = await db.query(sql, values);

      // Retorna 201 (Created) ou 200 (OK)
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Avaliação cadastrada com sucesso.',
        dados: { 
            ava_id: rows.insertId, // Retorna o ID que acabou de ser criado
            usuario_id,
            farmacia_id
        }
      });
    } catch (error) {
      console.error('Erro no cadastro de avaliação:', error);
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao salvar avaliação.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // EDITAR AVALIAÇÃO (ATUALIZAR NOTA OU COMENTÁRIO)
  // ==================================================================
  async editarAvaliacao(request, response) {
    try {
      const { ava_nota, ava_comentario } = request.body;
      const { ava_id } = request.params; // O ID vem da URL (ex: /avaliacao/5)

      // Validação da Nota na edição também
      if (ava_nota && (ava_nota < 1 || ava_nota > 5)) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'A nota deve ser entre 1 e 5.'
        });
      }

      const sql = 'UPDATE avaliacao SET ava_nota = ?, ava_comentario = ? WHERE ava_id = ?;';
      const values = [ava_nota, ava_comentario, ava_id];
      
      const [result] = await db.query(sql, values);

      // Verifica se alguma linha foi afetada (se o ID existia)
      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Avaliação não encontrada para edição.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Avaliação editada com sucesso.'
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao editar avaliação.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // APAGAR AVALIAÇÃO
  // ==================================================================
  async apagarAvaliacao(request, response) {
    try {
      const { ava_id } = request.params;

      const sql = 'DELETE FROM avaliacao WHERE ava_id = ?;';
      const values = [ava_id];
      
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return response.status(404).json({
            sucesso: false,
            mensagem: 'Avaliação não encontrada para exclusão.'
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Avaliação apagada com sucesso.'
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao apagar avaliação.',
        dados: error.message
      });
    }
  }
};