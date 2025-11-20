const jwt = require('jsonwebtoken');

// Define a chave secreta. 
// IMPORTANTE: No arquivo .env, crie uma linha: JWT_SECRET=sua_senha_super_secreta
const JWT_SECRET = process.env.JWT_SECRET || 'SEU_SEGREDO_JWT_PADRAO';

module.exports = (request, response, next) => {
  // 1. Busca o token no cabeçalho da requisição (Authorization: Bearer <token>)
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ sucesso: false, mensagem: 'Token não fornecido.' });
  }

  // 2. Divide o cabeçalho em duas partes: "Bearer" e o "token_hash"
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return response.status(401).json({ sucesso: false, mensagem: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;

  // 3. Verifica se a primeira parte contém a palavra "Bearer" (padrão da web)
  // O regex /^Bearer$/i garante que aceite "Bearer", "bearer", "BEARER"
  if (!/^Bearer$/i.test(scheme)) {
    return response.status(401).json({ sucesso: false, mensagem: 'Token mal formatado.' });
  }

  // 4. Verifica a validade do Token usando a chave secreta
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Se o token expirou ou a assinatura não bate
      return response.status(401).json({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
    }

    // 5. SUCESSO: Anexa os dados do usuário à requisição
    // CORREÇÃO: Mudei de 'farmaciaId' para 'userId'. 
    // Como seu sistema tem Usuários E Farmácias, 'userId' é um nome genérico melhor.
    // O 'decoded.id' vem do momento que você gerou o token no LoginController.
    request.userId = decoded.id; 
    request.userType = decoded.tipo; // Sugestão: Salve se é 'farmacia' ou 'usuario' no token
    
    // Passa para o próximo passo (o Controller)
    return next();
  });
};