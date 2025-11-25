const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl');
const bcrypt = require('bcrypt');

module.exports = {
  // ==================================================================
  // 1. LISTAR FARMÁCIAS (CORRIGIDO: Agora calcula a média das notas)
  // ==================================================================
  async listarFarmacias(request, response) {
    try {
      const { qtde } = request.query;

      // 1. Definição da URL Base para as imagens (Ajuste o IP se necessário)
      const baseUrlImagens = 'http://172.16.0.96:3334/public/logos/';

      // 2. Colunas do SELECT
      // COALESCE(AVG(...), 0) garante que retorne 0 se não tiver avaliação
      const camposSelect = `
        f.farm_id, 
        f.farm_nome, 
        f.farm_cnpj, 
        f.farm_endereco, 
        f.farm_telefone, 
        f.farm_email, 
        f.farm_logo, 
        f.farm_cidade_id,
        COALESCE(AVG(a.ava_nota), 0) as farm_nota
      `;

      // 3. Colunas do GROUP BY (OBRIGATÓRIO colocar todas do select aqui para evitar Erro 500)
      const camposGroupBy = `
        f.farm_id, 
        f.farm_nome, 
        f.farm_cnpj, 
        f.farm_endereco, 
        f.farm_telefone, 
        f.farm_email, 
        f.farm_logo, 
        f.farm_cidade_id
      `;

      let sql;
      let params = [];

      // --- Lógica da Query ---
      if (qtde) {
        sql = `
          SELECT ${camposSelect}
          FROM farmacia f  -- Verifique se no banco é 'farmacias' ou 'farmacia'
          LEFT JOIN avaliacao a ON f.farm_id = a.farmacia_id
          GROUP BY ${camposGroupBy}
          ORDER BY RAND() 
          LIMIT ?;
        `;
        params = [parseInt(qtde)];
      } else {
        sql = `
          SELECT ${camposSelect}
          FROM farmacia f
          LEFT JOIN avaliacao a ON f.farm_id = a.farmacia_id
          GROUP BY ${camposGroupBy};
        `;
      }

      // Executa a query
      const [rows] = await db.query(sql, params);
      
      // 4. Processamento dos dados (Formatação da nota e URL da imagem)
      const farmaciasFormatadas = rows.map(item => {
        return {
          ...item,
          // Formata a nota para 1 casa decimal (ex: 4.5)
          farm_nota: parseFloat(item.farm_nota).toFixed(1),
          // Cria a URL completa da logo se ela existir
          farm_logo_url: item.farm_logo ? `${baseUrlImagens}${item.farm_logo}` : null
        };
      });
      
      return response.status(200).json({
        sucesso: true,
        mensagem: qtde ? `Lista limitada a ${qtde} farmácias.` : 'Lista completa de farmácias.',
        itens: rows.length,
        dados: farmaciasFormatadas
      });

    } catch (error) {
      console.error('Erro no listarFarmacias:', error); 
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar farmácias.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // 2. DETALHES DA FARMÁCIA
  // ==================================================================
  async listarFarmaciaPorId(request, response) {
    try {
      const { farm_id } = request.params;
      // Também podemos adicionar a média aqui se você quiser mostrar na tela de detalhes
      const sql = `
        SELECT f.farm_id, f.farm_nome, f.farm_cnpj, f.farm_endereco, f.farm_telefone, 
               f.farm_email, f.farm_logo, f.farm_cidade_id,
               COALESCE(AVG(a.ava_nota), 0) as media_avaliacao
        FROM farmacia f
        LEFT JOIN avaliacao a ON f.farm_id = a.farmacia_id
        WHERE f.farm_id = ?
        GROUP BY f.farm_id;`;
        
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
        media_avaliacao: parseFloat(farmacia.media_avaliacao).toFixed(1),
        farm_logo_url: gerarUrl(farmacia.farm_logo, 'logos', 'default-logo.png')
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

  // ==================================================================
  // 3. LISTAR MEDICAMENTOS DA FARMÁCIA
  // ==================================================================
  async listarMedicamentosPorFarmacia(request, response) {
    try {
      const { farm_id } = request.params;

      const sql = `
        SELECT 
          med.med_id as id, 
          med.med_nome as nome,
          med.med_dosagem as dosagem,
          lab.lab_nome as laboratorio,
          mp.medp_preco as preco, 
          med.med_imagem as imagem 
        FROM medpreco mp
        INNER JOIN medicamento med ON mp.medicamento_id = med.med_id
        LEFT JOIN laboratorios lab ON med.lab_id = lab.lab_id
        WHERE mp.farmacia_id = ?;`;

      const [rows] = await db.query(sql, [farm_id]);

      const medicamentosComUrl = rows.map(medicamento => ({
        ...medicamento,
        imagem_url: gerarUrl(medicamento.imagem, 'medicamentos', 'sem-imagem.png') 
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de medicamentos da farmácia.',
        itens: medicamentosComUrl.length,
        dados: medicamentosComUrl
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição de medicamentos.',
        dados: error.message
      });
    }
  },

  // ==================================================================
  // 4. CADASTRO
  // ==================================================================
  async cadastrarFarmacias(request, response) {
    try {
      const { farm_nome, farm_cnpj, farm_endereco, farm_telefone, farm_email, farm_senha, farm_cidade_id } = request.body;
      
      if (!farm_nome || !farm_email || !farm_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nome, e-mail e senha são obrigatórios.',
        });
      }

      let nomeArquivo = null;
      if (request.file) {
        nomeArquivo = request.file.filename;
      }

      const hashedSenha = await bcrypt.hash(farm_senha, 10);

      const sql = `INSERT INTO farmacia (farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
          farm_email, farm_senha, farm_logo, farm_cidade_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
      const values = [farm_nome, farm_cnpj, farm_endereco, farm_telefone, farm_email, hashedSenha, nomeArquivo, farm_cidade_id];
      
      const [rows] = await db.query(sql, values);
      
      const farmaciaUrl = gerarUrl(nomeArquivo, 'logos', 'default-logo.png');
      
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

  // ==================================================================
  // 5. EDIÇÃO
  // ==================================================================
  async editarFarmacias(request, response) {
    try {
      const { farm_id } = request.params;
      const camposRecebidos = request.body; 
      
      if (Object.keys(camposRecebidos).length === 0 && !request.file) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nenhum dado fornecido para atualização.',
        });
      }

      const camposParaAtualizar = [];
      const values = [];
      let novoNomeArquivo = null;

      for (const [key, value] of Object.entries(camposRecebidos)) {
        if (value !== null && value !== undefined) {
          if (key === 'farm_senha' && value && value.trim() !== '') {
            const hashed = await bcrypt.hash(value, 10);
            camposParaAtualizar.push(`${key} = ?`);
            values.push(hashed);
          } else {
            camposParaAtualizar.push(`${key} = ?`);
            values.push(value);
          }
        }
      }

      if (request.file) {
        novoNomeArquivo = request.file.filename;
        camposParaAtualizar.push(`farm_logo = ?`);
        values.push(novoNomeArquivo);
      }
      
      if (camposParaAtualizar.length === 0) {
         return response.status(400).json({
          sucesso: false,
          mensagem: 'Nenhum campo válido fornecido para atualização.',
        });
      }

      values.push(farm_id);
      const sql = `UPDATE farmacia SET ${camposParaAtualizar.join(', ')} WHERE farm_id = ?;`;
      await db.query(sql, values);

      let nomeLogoFinal = novoNomeArquivo;
      if (!nomeLogoFinal) {
          const [result] = await db.query('SELECT farm_logo FROM farmacia WHERE farm_id = ?', [farm_id]);
          if (result.length > 0) {
              nomeLogoFinal = result[0].farm_logo;
          }
      }
      
      const farmaciaUrl = gerarUrl(nomeLogoFinal, 'logos', 'default-logo.png');
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmácia editada com sucesso.',
        dados: {
            farm_logo_url: farmaciaUrl 
        }
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
  
  // ==================================================================
  // 6. UTILITÁRIOS (Verificar Email, Senha, Delete)
  // ==================================================================
  async verificarEmail(request, response) {
    try {
      const { farm_email } = request.body;
      if (!farm_email) {
        return response.status(400).json({ sucesso: false, mensagem: 'O e-mail é obrigatório.' });
      }
      const sql = 'SELECT farm_id FROM farmacia WHERE farm_email = ?;';
      const [rows] = await db.query(sql, [farm_email]);
      if (rows.length === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'E-mail não encontrado.' });
      }
      return response.status(200).json({ sucesso: true, mensagem: 'E-mail verificado com sucesso.' });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        dados: error.message
      });
    }
  },

  async redefinirSenhaPorEmail(request, response) {
    try {
      const { farm_email, nova_senha } = request.body;
      if (!farm_email || !nova_senha) {
        return response.status(400).json({ sucesso: false, mensagem: 'E-mail e nova senha são obrigatórios.' });
      }
      if (nova_senha.length < 6) {
        return response.status(400).json({ sucesso: false, mensagem: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      const hashed = await bcrypt.hash(nova_senha, 10);
      const sql = 'UPDATE farmacia SET farm_senha = ? WHERE farm_email = ?;';
      const [result] = await db.query(sql, [hashed, farm_email]);
      
      if (result.affectedRows === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'E-mail não encontrado para atualização.' });
      }
      return response.status(200).json({ sucesso: true, mensagem: 'Senha alterada com sucesso.' });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        dados: error.message
      });
    }
  },

  async alterarSenha(request, response) {
    try {
      const { farm_id } = request.params;
      const { senha_atual, nova_senha } = request.body;

      if (!senha_atual || !nova_senha) {
        return response.status(400).json({ sucesso: false, mensagem: 'Senha atual e nova senha são obrigatórias.' });
      }

      if (nova_senha.length < 6) {
        return response.status(400).json({ sucesso: false, mensagem: 'A senha deve ter no mínimo 6 caracteres.' });
      }

      const [rows] = await db.query('SELECT farm_senha FROM farmacia WHERE farm_id = ?;', [farm_id]);
      if (rows.length === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'Farmácia não encontrada.' });
      }

      const atualHash = rows[0].farm_senha;
      const match = await bcrypt.compare(senha_atual, atualHash);
      if (!match) {
        return response.status(401).json({ sucesso: false, mensagem: 'Senha atual incorreta.' });
      }

      const novaHash = await bcrypt.hash(nova_senha, 10);
      const sql = 'UPDATE farmacia SET farm_senha = ? WHERE farm_id = ?;';
      await db.query(sql, [novaHash, farm_id]);

      return response.status(200).json({ sucesso: true, mensagem: 'Senha alterada com sucesso.' });
    } catch (error) {
      return response.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.', dados: error.message });
    }
  },

  async apagarFarmacias(request, response) {
    try {
      const { farm_id } = request.params;
      const sql = 'DELETE FROM farmacia WHERE farm_id = ?;';
      const values = [farm_id];
      const [rows] = await db.query(sql, values);
      
      if (rows.affectedRows === 0) {
          return response.status(404).json({
              sucesso: false,
              mensagem: 'Farmácia não encontrada para exclusão.'
          });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmácia apagada com sucesso.',
        dados: rows
      });
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
          return response.status(400).json({
              sucesso: false,
              mensagem: 'Não é possível apagar esta farmácia pois ela possui registros vinculados.'
          });
      }
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  }
};