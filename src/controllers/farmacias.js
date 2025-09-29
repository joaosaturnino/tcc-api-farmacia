const db = require('../dataBase/connection');
const { geraUrl } = require('../utils/gerarUrl'); // Note o nome da função

module.exports = {
  async listarFarmacias(request, response) {
    try {
      const sql = `SELECT farm_id, farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                  farm_email,  farm_logo, farm_cidade_id FROM farmacia;`;
      const [rows] = await db.query(sql);
      
      // Adicione URLs completas para as logos
      const farmaciasComUrl = rows.map(farmacia => ({
        ...farmacia,
        farm_logo_url: geraUrl(farmacia.farm_logo, 'teste', 'default-logo.png')
      }));
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de farmácias',
        itens: rows.length,
        dados: farmaciasComUrl
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async listarFarmaciaPorId(request, response) {
    try {
      const { farm_id } = request.params; // Pega o ID dos parâmetros da rota
      const sql = `SELECT farm_id, farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                  farm_email, farm_logo, farm_cidade_id FROM farmacia WHERE farm_id = ?;`;
      const [rows] = await db.query(sql, [farm_id]);

      if (rows.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Farmácia não encontrada.',
        });
      }

      const farmacia = rows[0];
      const farmaciaComUrl = {
        ...farmacia,
        farm_logo_url: geraUrl(farmacia.farm_logo, 'teste', 'default-logo.png')
      };
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Dados da farmácia.',
        dados: farmaciaComUrl
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async cadastrarFarmacias(request, response) {
  try {
    // Debug completo
    console.log('Content-Type:', request.get('Content-Type'));
    console.log('Body keys:', Object.keys(request.body));
    console.log('Body values:', request.body);
    
    // Extrai dados de forma mais segura
    const farm_nome = request.body.farm_nome;
    const farm_cnpj = request.body.farm_cnpj;
    const farm_endereco = request.body.farm_endereco;
    const farm_telefone = request.body.farm_telefone;
    const farm_email = request.body.farm_email;
    const farm_senha = request.body.farm_senha;
    const farm_logo = request.body.farm_logo; // Pode ser null
    const farm_cidade_id = request.body.farm_cidade_id;
    
    

    console.log('Dados extraídos:');
    console.log('farm_nome:', farm_nome);
    console.log('farm_endereco:', farm_endereco);
    console.log('farm_telefone:', farm_telefone);
    console.log('farm_email:', farm_email);
    console.log('farm_senha:', farm_senha);
    console.log('farm_cnpj:', farm_cnpj);
    console.log('farm_cidade_id:', farm_cidade_id);

    // Validação
    if (!farm_nome || farm_nome.trim() === '') {
      return response.status(400).json({
        sucesso: false,
        mensagem: 'O nome da farmácia é obrigatório.',
        dados: null
      });
    }

    let nomeArquivo = null;
    if (request.files && request.files.length > 0) {
      nomeArquivo = request.files[0].filename;
      console.log('Arquivo recebido:', nomeArquivo);
    }

    const sql = `INSERT INTO farmacia (farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                farm_email, farm_senha, farm_logo, farm_cidade_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    const values = [farm_nome, farm_cnpj, farm_endereco, farm_telefone, farm_email, farm_senha, nomeArquivo, farm_cidade_id];
    
    const [rows] = await db.query(sql, values);
    
    const farmaciaUrl = geraUrl(nomeArquivo, 'teste', 'default-logo.png');
    
    return response.status(201).json({
      sucesso: true,
      mensagem: 'Farmácia cadastrada com sucesso.',
      dados: { 
        farm_id: rows.insertId,
        farm_logo: nomeArquivo,
        farm_logo_url: farmaciaUrl
      }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return response.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno no servidor.',
      dados: error.message
    });
  }
},

  async editarFarmacias(request, response) {
  try {
    const { farm_id } = request.params;
    const camposRecebidos = request.body;
    
    // Verifica se algum dado foi enviado para atualização
    if (Object.keys(camposRecebidos).length === 0 && !request.files) {
      return response.status(400).json({
        sucesso: false,
        mensagem: 'Nenhum dado fornecido para atualização.',
      });
    }

    const camposParaAtualizar = [];
    const values = [];

    // Mapeia os campos recebidos para os nomes das colunas no banco de dados
    Object.entries(camposRecebidos).forEach(([key, value]) => {
      // Adiciona apenas os campos que não estão vazios ou nulos
      if (value !== null && value !== undefined) {
        camposParaAtualizar.push(`${key} = ?`);
        values.push(value);
      }
    });

    // Trata o upload de um novo logo
    if (request.files && request.files.length > 0) {
      const nomeArquivo = request.files[0].filename;
      camposParaAtualizar.push(`farm_logo = ?`);
      values.push(nomeArquivo);
    }
    
    // Se não houver campos válidos para atualizar, retorna erro
    if (camposParaAtualizar.length === 0) {
       return response.status(400).json({
        sucesso: false,
        mensagem: 'Nenhum campo válido fornecido para atualização.',
      });
    }

    // Adiciona o farm_id ao final do array de valores para a cláusula WHERE
    values.push(farm_id);

    const sql = `UPDATE farmacia SET ${camposParaAtualizar.join(', ')} WHERE farm_id = ?;`;
    
    const [rows] = await db.query(sql, values);
    
    return response.status(200).json({
      sucesso: true,
      mensagem: 'Farmácia editada com sucesso.',
      dados: rows
    });
  } catch (error) {
    console.error('Erro ao editar farmácia:', error); 
    return response.status(500).json({
      sucesso: false,
      mensagem: 'Erro no servidor.',
      dados: error.message
    });
  }
},


  async apagarFarmacias(request, response) {
    try {
      const { farm_id } = request.params;
      const sql = 'DELETE FROM farmacia WHERE farm_id = ?;';
      const values = [farm_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmácia apagada com sucesso.',
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