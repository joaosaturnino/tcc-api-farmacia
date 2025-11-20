require('dotenv').config();
const mysql = require('mysql2/promise');

// 1. Configuração da conexão
// Pegamos as variáveis do arquivo .env para não expor senhas no código
const config = {
    host: process.env.BD_SERVIDOR,
    port: process.env.BD_PORTA || 3306, // Usa 3306 se não houver porta no .env
    user: process.env.BD_USUARIO,
    password: process.env.BD_SENHA,
    database: process.env.BD_BANCO,
    waitForConnections: true, // Se todas as conexões estiverem em uso, espera uma liberar
    connectionLimit: 10,      // Máximo de conexões abertas simultaneamente
    queueLimit: 0,            // 0 = Fila infinita de espera por conexão
    
    // Dica: timezone 'Z' ou '+00:00' ajuda a evitar problemas de data/hora
    timezone: '-03:00'        // Opcional: Ajusta para o horário do Brasil
};

// 2. Criação do Pool (Correção Principal)
// O pool deve ser criado imediatamente para garantir que o 'module.exports' funcione.
// O 'createPool' não conecta no banco na hora, ele apenas configura o objeto.
const pool = mysql.createPool(config);

// 3. Função para testar se a conexão está funcionando
const testConnection = async () => {
    try {
        // Tenta pegar uma conexão emprestada do pool
        const connection = await pool.getConnection();
        
        console.log(`✅ Conexão MySQL estabelecida com sucesso! [Banco: ${config.database}]`);
        
        // Importante: Sempre liberar a conexão de volta para o pool
        connection.release();
    } catch (error) {
        console.error('❌ Erro fatal ao conectar ao banco de dados:', error.code);
        console.error('Detalhes:', error.message);
        
        // Encerra o aplicativo se não conseguir conectar no início, 
        // pois sem banco a API não funciona.
        process.exit(1); 
    }
};

// Executa o teste de conexão ao iniciar a aplicação
testConnection();

// 4. Exportação
// Exportamos o pool para ser usado nos Models/Controllers
module.exports = pool;