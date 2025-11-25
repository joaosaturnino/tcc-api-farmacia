const db = require('../dataBase/connection');

module.exports = {
  // ==================================================================
  // LISTAR AVALIAÇÕES
  // ==================================================================
  async listarAvaliacao(request, response) {
    try {
      const { farmacia_id } = request.query; 

      let sql = 'SELECT ava_id, usuario_id, farmacia_id, ava_nota, ava_comentario FROM avaliacao';
      const values = [];

      if (farmacia_id) {
        sql += ' WHERE farmacia_id = ?';
        values.push(farmacia_id);
      }
      
      const [rows] = await db.query(sql, values);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de avaliações recuperada com sucesso.',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar avaliações.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // CADASTRAR OU EDITAR (UPSERT)
  // ==================================================================
  async cadastrarAvaliacao(request, response) {
    try {
      const { usuario_id, farmacia_id, ava_nota, ava_comentario } = request.body;

      // 1. Validações
      if (!usuario_id || !farmacia_id || ava_nota === undefined) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Usuário, Farmácia e Nota são obrigatórios.'
        });
      }

      if (ava_nota < 1 || ava_nota > 5) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'A nota deve ser entre 1 e 5.'
        });
      }

      // 2. VERIFICAÇÃO: O usuário já avaliou esta farmácia?
      const sqlCheck = 'SELECT ava_id FROM avaliacao WHERE usuario_id = ? AND farmacia_id = ?';
      const [existente] = await db.query(sqlCheck, [usuario_id, farmacia_id]);

      // ==============================================================
      // CENÁRIO A: JÁ EXISTE -> EDITAR (UPDATE)
      // ==============================================================
      if (existente.length > 0) {
        const idExistente = existente[0].ava_id;
        
        const sqlUpdate = 'UPDATE avaliacao SET ava_nota = ?, ava_comentario = ? WHERE ava_id = ?';
        await db.query(sqlUpdate, [ava_nota, ava_comentario, idExistente]);

        return response.status(200).json({
          sucesso: true,
          mensagem: 'Sua avaliação anterior foi atualizada com sucesso!',
          dados: { ava_id: idExistente, usuario_id, farmacia_id, ava_nota }
        });
      }

      // ==============================================================
      // CENÁRIO B: NÃO EXISTE -> CADASTRAR (INSERT)
      // ==============================================================
      const sqlInsert = 'INSERT INTO avaliacao (usuario_id, farmacia_id, ava_nota, ava_comentario) VALUES (?, ?, ?, ?);';
      const [rows] = await db.query(sqlInsert, [usuario_id, farmacia_id, ava_nota, ava_comentario]);

      return response.status(201).json({
        sucesso: true,
        mensagem: 'Avaliação cadastrada com sucesso.',
        dados: { 
            ava_id: rows.insertId, 
            usuario_id,
            farmacia_id
        }
      });

    } catch (error) {
      console.error('Erro no processo de avaliação:', error);
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao salvar avaliação.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // EDITAR AVALIAÇÃO (Pelo ID, caso use rota específica)
  // ==================================================================
  async editarAvaliacao(request, response) {
    try {
      const { ava_nota, ava_comentario } = request.body;
      const { ava_id } = request.params;

      if (ava_nota && (ava_nota < 1 || ava_nota > 5)) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'A nota deve ser entre 1 e 5.'
        });
      }

      const sql = 'UPDATE avaliacao SET ava_nota = ?, ava_comentario = ? WHERE ava_id = ?;';
      const [result] = await db.query(sql, [ava_nota, ava_comentario, ava_id]);

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
      const [result] = await db.query(sql, [ava_id]);

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