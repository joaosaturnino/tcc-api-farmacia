const db = require('../dataBase/connection');
const jwt = require('jsonwebtoken');

module.exports = {
  async login(request, response) {
    try {
      const { farm_email, farm_senha } = request.body;

      if (!farm_email || !farm_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e senha são obrigatórios.',
        });
      }

      // A coluna farm_senha no banco de dados deve conter a senha em texto plano
      const sql = 'SELECT farm_id, farm_nome, farm_email, farm_senha FROM farmacia WHERE farm_email = ?;';
      const [rows] = await db.query(sql, [farm_email]);

      if (rows.length === 0) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.',
        });
      }

      const farmacia = rows[0];

      // ===================================================================
      // LÓGICA SEM BCRYPT: Comparação direta e insegura da senha
      // ===================================================================
      if (farm_senha !== farmacia.farm_senha) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.',
        });
      }

      // Se a senha estiver correta, gerar o token
      const payload = {
        farm_id: farmacia.farm_id,
        farm_nome: farmacia.farm_nome,
      };

      const secretKey = process.env.JWT_SECRET || 'sua_chave_secreta_de_desenvolvimento';
      const token = jwt.sign(payload, secretKey, { expiresIn: '8h' });

      delete farmacia.farm_senha;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso.',
        dados: farmacia,
        token: token,
      });

    } catch (error) {
      console.error('Erro no login:', error);
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno no servidor ao tentar fazer login.',
        dados: error.message
      });
    }
  }
};