const db = require('../dataBase/connection');

module.exports = {
  async listarMedicamentos(request, response) {
    try {
      const sql = `SELECT med_id, med_nome, med_dosagem, med_quantidade, 
                  forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_data_cadastro, med_data_atualizacao, med_ativo FROM medicamento;`;
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de medicamentos',
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

  async cadastrarMedicamentos(request, response) {
    try {
      const { med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, med_imagem, tipo_id } = request.body;
      const sql = `INSERT INTO medicamento (med_nome, med_dosagem, med_quantidade, 
                  forma_id, med_descricao, lab_id, med_imagem, tipo_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
      const values = [med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, med_imagem, tipo_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Medicamento cadastrado com sucesso.',
        dados: { med_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarMedicamentos(request, response) {
    try {
      const { med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, med_imagem, tipo_id } = request.body;
      const { med_id } = request.params;
      const sql = `UPDATE medicamento SET med_nome = ?, med_dosagem = ?, med_quantidade = ?, 
                  forma_id = ?, med_descricao = ?, lab_id = ?, med_imagem = ?, tipo_id = ? 
                  WHERE med_id = ?;`;
      const values = [med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Medicamento editado com sucesso.',
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

  async apagarMedicamentos(request, response) {
    try {
      const { med_id } = request.params;
      const sql = 'DELETE FROM medicamento WHERE med_id = ?;';
      const values = [med_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Medicamento apagado com sucesso.',
        dados: rows
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