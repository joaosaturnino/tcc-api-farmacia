const jwt = require('jsonwebtoken');

// É altamente recomendável usar variáveis de ambiente para o segredo.
const JWT_SECRET = process.env.JWT_SECRET || 'SEU_SEGREDO_JWT_PADRAO';

module.exports = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ sucesso: false, mensagem: 'Token não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return response.status(401).json({ sucesso: false, mensagem: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return response.status(401).json({ sucesso: false, mensagem: 'Token mal formatado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return response.status(401).json({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
    }

    // Anexa o ID do token ao request para ser usado nos controllers
    // Certifique-se que o payload do seu token contém o campo 'id' com o ID da farmácia.
    request.farmaciaId = decoded.id; 
    
    return next();
  });
};