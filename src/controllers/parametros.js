const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl'); // Importante para imagens

module.exports = {

  // ==================================================================
  // LISTAR MEDICAMENTOS POR NOME (BUSCA SIMPLES)
  // ==================================================================
  async listarMedicamentosParametros(request, response) {
    try {
      // Pega o parâmetro da URL (ex: /buscar?med_nome=Dipi)
      const { med_nome } = request.query; 
      
      const medPesq = med_nome ? `%${med_nome}%` : `%%`;
      
      const sql = `
        SELECT 
          med_id, med_nome, med_dosagem, med_quantidade, 
          forma_id, med_descricao, lab_id, med_imagem, tipo_id 
        FROM medicamento 
        WHERE med_nome LIKE ? AND med_ativo = 1;
      `;

      const values = [medPesq];
      
      // Executa a consulta apenas uma vez
      const [rows] = await db.query(sql, values);

      // Processa as imagens
      const dadosComUrl = rows.map(item => ({
        ...item,
        med_imagem: gerarUrl(item.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Resultado da busca de medicamentos.',
        itens: dadosComUrl.length,
        dados: dadosComUrl
      });

    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message // Corrigido de 'mensage'
      });
    }
  },

  // ==================================================================
  // LISTAR CIDADES (FILTRO POR UF E NOME)
  // ==================================================================
  async listarCidadeParametro(request, response) {
    try {
      const { uf_sigla, nome_cidade } = request.query;
      
      // Construção dinâmica da query
      let sql = 'SELECT cidade_id, nome_cidade, uf_sigla FROM cidade WHERE 1=1';
      const values = [];

      // Se enviou UF, adiciona o filtro
      if (uf_sigla) {
        sql += ' AND uf_sigla = ?';
        values.push(uf_sigla);
      }

      // Se enviou parte do nome, adiciona o filtro
      if (nome_cidade) {
        sql += ' AND nome_cidade LIKE ?';
        values.push(`%${nome_cidade}%`);
      }

      sql += ' ORDER BY nome_cidade ASC LIMIT 50;'; // Limite de segurança

      const [rows] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de cidades filtrada.',
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

  // ==================================================================
  // LISTAR FORMAS FARMACÊUTICAS POR NOME
  // ==================================================================
  async listarFormasParametros(request, response) {
    try {
      const { forma_nome } = request.query;
      const formaPesq = forma_nome ? `%${forma_nome}%` : `%%`;
      
      const sql = 'SELECT forma_id, forma_nome FROM forma_farmaceutica WHERE forma_nome LIKE ?;';
      const values = [formaPesq];
      
      const [rows] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de formas farmacêuticas.', // Mensagem corrigida
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
};