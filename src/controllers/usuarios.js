const db = require('../dataBase/connection');

module.exports = {
  async listarUsuario(request, response) {
    try {
      const sql = 'SELECT usu_id, usu_nome, usu_email, usu_cpf FROM usuarios;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de usuários',
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

  async cadastrarUsuario(request, response) {
    try {
      const { usu_nome, usu_email, usu_senha, usu_cpf } = request.body;
      const sql = 'INSERT INTO usuarios (usu_nome, usu_email, usu_senha, usu_cpf) VALUES (?, ?, ?, ?);';
      const values = [usu_nome, usu_email, usu_senha, usu_cpf];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário cadastrado com sucesso.',
        dados: { usu_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarUsuario(request, response) {
    try {
      const { usu_nome, usu_email, usu_senha, usu_cpf } = request.body;
      const { usu_id } = request.params;
      const sql = 'UPDATE usuarios SET usu_nome = ?, usu_email = ?, usu_senha = ?, usu_cpf = ? WHERE usu_id = ?;';
      const values = [usu_nome, usu_email, usu_senha, usu_cpf, usu_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário editado com sucesso.',
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

  async apagarUsuario(request, response) {
    try {
      const { usu_id } = request.params;
      const sql = 'DELETE FROM usuarios WHERE usu_id = ?;';
      const values = [usu_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário apagado com sucesso.',
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