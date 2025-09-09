const db = require('../dataBase/connection');

module.exports = {
  async listarLaboratorio(request, response) {
    try {
      const sql = 'SELECT lab_id, nome_laboratorio, lab_cnpj FROM laboratorio;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de laboratórios',
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

  async cadastrarLaboratorio(request, response) {
    try {
      const { nome_laboratorio, lab_cnpj } = request.body;
      const sql = 'INSERT INTO laboratorio (nome_laboratorio, lab_cnpj) VALUES (?, ?);';
      const values = [nome_laboratorio, lab_cnpj];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório cadastrado com sucesso.',
        dados: { lab_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarLaboratorio(request, response) {
    try {
      const { nome_laboratorio, lab_cnpj } = request.body;
      const { lab_id } = request.params;
      const sql = 'UPDATE laboratorio SET nome_laboratorio = ?, lab_cnpj = ? WHERE lab_id = ?;';
      const values = [nome_laboratorio, lab_cnpj, lab_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório editado com sucesso.',
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

  async apagarLaboratorio(request, response) {
    try {
      const { lab_id } = request.params;
      const sql = 'DELETE FROM laboratorio WHERE lab_id = ?;';
      const values = [lab_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório apagado com sucesso.',
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