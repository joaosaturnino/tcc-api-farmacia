const db = require('../dataBase/connection');
const jwt = require('jsonwebtoken');
const { gerarUrl } = require('../utils/gerarUrl');
const bcrypt = require('bcrypt');

module.exports = {
  // ==================================================================
  // LOGIN DA FARMÁCIA (GESTOR)
  // ==================================================================
  async loginFarm(request, response) {
    try {
      const { farm_email, farm_senha } = request.body;

      // 1. Validação de entrada
      if (!farm_email || !farm_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e senha são obrigatórios.',
        });
      }

      // 2. Busca a farmácia pelo e-mail
      const sql = 'SELECT farm_id, farm_nome, farm_email, farm_senha, farm_logo FROM farmacia WHERE farm_email = ?;';
      const [rows] = await db.query(sql, [farm_email]);

      // 3. Verifica se encontrou
      if (rows.length === 0) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas.',
        });
      }

      const farmacia = rows[0];

      // 4. Verifica a senha (Hash)
      const match = await bcrypt.compare(farm_senha, farmacia.farm_senha);
      if (!match) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas.',
        });
      }

      // 5. Prepara a URL da imagem
      farmacia.farm_logo_url = gerarUrl(farmacia.farm_logo, 'logos', 'default-logo.png');

      // 6. Gera o Token JWT
      // Padronizamos o payload para usar 'id' e adicionamos o 'tipo'
      const payload = {
        id: farmacia.farm_id,
        nome: farmacia.farm_nome,
        tipo: 'farmacia' // Identificador para o middleware saber quem é
      };

      const secretKey = process.env.JWT_SECRET || 'sua_chave_secreta_de_desenvolvimento';
      const token = jwt.sign(payload, secretKey, { expiresIn: '8h' });

      // 7. Remove a senha do objeto de retorno (Segurança)
      delete farmacia.farm_senha;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Login de Farmácia realizado com sucesso.',
        dados: farmacia,
        token: token,
      });

    } catch (error) {
      console.error('Erro no login da farmácia:', error);
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno no servidor.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // LOGIN DE FUNCIONÁRIO
  // ==================================================================
  async loginFunc(request, response) {
    try {
      const { func_email, func_senha } = request.body;

      if (!func_email || !func_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e senha são obrigatórios.',
        });
      }
      
      // Busca funcionário e também o ID da farmácia a qual ele pertence
      const sql = 'SELECT func_id, func_nome, func_email, func_senha, farmacia_id, func_nivel FROM funcionario WHERE func_email = ?;';
      const [rows] = await db.query(sql, [func_email]);

      if (rows.length === 0) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas.',
        });
      }

      const funcionario = rows[0];

      // Verifica a senha
      // NOTA: Certifique-se de que o cadastro de funcionários está usando bcrypt.hash
      const matchFunc = await bcrypt.compare(func_senha, funcionario.func_senha);
      
      if (!matchFunc) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas.',
        });
      }

      // Gera Token JWT
      const payload = {
        id: funcionario.func_id,
        nome: funcionario.func_nome,
        tipo: 'funcionario',
        farmacia_id: funcionario.farmacia_id, // Útil para filtrar dados da farmácia dele
        nivel: funcionario.func_nivel
      };

      const secretKey = process.env.JWT_SECRET || 'sua_chave_secreta_de_desenvolvimento';
      const token = jwt.sign(payload, secretKey, { expiresIn: '8h' });

      // Remove a senha do retorno
      delete funcionario.func_senha;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Login de Funcionário realizado com sucesso.',
        dados: funcionario,
        token: token,
      });

    } catch (error) {
      console.error('Erro no login de funcionário:', error);
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno no servidor.',
        dados: error.message
      });
    }
  }
};