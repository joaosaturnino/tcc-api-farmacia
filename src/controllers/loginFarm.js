const db = require('../dataBase/connection');
const jwt = require('jsonwebtoken'); // O token ainda é útil para gerenciar a sessão

module.exports = {
  async login(request, response) {
    try {
      // 1. Extrair email e senha do corpo da requisição
      const { farm_email, farm_senha } = request.body;

      // 2. Validação básica
      if (!farm_email || !farm_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e senha são obrigatórios.',
        });
      }

      // 3. Buscar a farmácia pelo e-mail no banco de dados
      // A coluna farm_senha aqui deve conter a senha em texto plano
      const sql = 'SELECT farm_id, farm_nome, farm_email, farm_senha FROM farmacia WHERE farm_email = ?;';
      const [rows] = await db.query(sql, [farm_email]);

      // 4. Verificar se a farmácia foi encontrada
      if (rows.length === 0) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.',
        });
      }

      const farmacia = rows[0];

      // 5. COMPARAÇÃO DIRETA E INSEGURA DA SENHA
      // Compara a string da senha enviada com a string da senha salva no banco.
      if (farm_senha !== farmacia.farm_senha) {
        return response.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.',
        });
      }

      // Se a senha estiver correta, o processo continua
      // 6. Gerar o Token JWT
      const payload = {
        farm_id: farmacia.farm_id,
        farm_nome: farmacia.farm_nome,
      };

      const secretKey = process.env.JWT_SECRET || 'sua_chave_secreta_de_desenvolvimento';
      const token = jwt.sign(payload, secretKey, { expiresIn: '8h' });

      // 7. Remover a senha do objeto antes de retornar a resposta
      delete farmacia.farm_senha;

      // 8. Enviar a resposta de sucesso
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