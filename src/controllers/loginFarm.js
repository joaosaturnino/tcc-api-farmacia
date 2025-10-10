const db = require('../dataBase/connection');
const jwt = require('jsonwebtoken');
const { gerarUrl } = require('../utils/gerarUrl');

module.exports = {
  async loginFarm(request, response) {
    try {
      const { farm_email, farm_senha } = request.body;

      if (!farm_email || !farm_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e senha são obrigatórios.',
        });
      }

      const sql = 'SELECT farm_id, farm_nome, farm_email, farm_senha, farm_logo FROM farmacia WHERE farm_email = ?;';
      const [rows] = await db.query(sql, [farm_email]);

      if (rows.length === 0) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.',
        });
      }

      const farmacia = rows[0];

      if (farm_senha !== farmacia.farm_senha) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.',
        });
      }

      // Aplicação da função para criar a URL da imagem [cite: 248, 259]
      farmacia.farm_logo_url = gerarUrl(farmacia.farm_logo, 'logos', 'default-logo.png');

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
  },

  async loginFunc(request, response) {
    try {
      const { func_email, func_senha } = request.body;

      if (!func_email || !func_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e senha são obrigatórios.',
        });
      }

      const sql = 'SELECT func_id, func_nome, func_email, func_senha FROM funcionarios WHERE func_email = ?;';
      const [rows] = await db.query(sql, [func_email]);

      if (rows.length === 0) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.',
        });
      }

      const funcionario = rows[0];

      if (func_senha !== funcionario.func_senha) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.',
        });
      }

      const payload = {
        func_id: funcionario.func_id,
        func_nome: funcionario.func_nome,
      };

      const secretKey = process.env.JWT_SECRET || 'sua_chave_secreta_de_desenvolvimento';
      const token = jwt.sign(payload, secretKey, { expiresIn: '8h' });

      delete funcionario.func_senha;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso.',
        dados: funcionario,
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