const fse = require('fs-extra');
const path = require('path');
const { URL } = require('url'); // Módulo nativo do Node.js para trabalhar com URLs

/**
 * Caminho físico para a pasta 'public'.
 */
const PUBLIC_ROOT_PATH = path.join(process.cwd(), 'public');

/**
 * Lê a URL base da API a partir das variáveis de ambiente.
 * Fornece um valor padrão caso a variável não esteja definida.
 */
const API_URL = process.env.API_BASE_URL || 'http://localhost:3334';

// NOVO: Define o prefixo de rota que o Express usa para servir arquivos de LOGO/UPLOAD
// Deve corresponder à rota estática configurada no seu app.js/server.js.
// Assumindo que o Multer salva em 'uploads/logos/' e que o Express serve esse caminho.
const UPLOAD_ROUTE_PREFIX = '/uploads/logos/'; 

/**
 * Gera uma URL pública e COMPLETA para um recurso (imagem, ícone, etc.).
 * @param {string} nomeArquivo - O nome do arquivo salvo no DB.
 * @param {string} pasta - O nome da subpasta (obrigatório, mas será ignorado para uploads).
 * @param {string} arquivoPadrao - O nome do arquivo padrão caso o principal não seja encontrado.
 * @returns {string} A URL completa e formatada (ex: 'http://localhost:3334/uploads/logos/logo-123.png').
 */
function gerarUrl(nomeArquivo, pasta, arquivoPadrao) {
  // ATENÇÃO: Se o Multer salva arquivos em 'uploads/logos/', a variável 'pasta' 
  // que vem do controller ('teste') não é o caminho físico correto para verificar.
  // Vamos usar um caminho físico que é mais provável para logos.
  
  // Caminho físico onde o Multer SALVA as logos (ex: 'root/uploads/logos/nome.png')
  const CAMINHO_FISICO_LOGO = path.join(process.cwd(), 'uploads', 'logos', nomeArquivo || arquivoPadrao);

  let caminhoRelativo;

  // 1. Verifica se a logo existe no diretório de uploads do Multer
  if (nomeArquivo && fse.existsSync(CAMINHO_FISICO_LOGO)) {
    // CORREÇÃO ESSENCIAL: Usa o prefixo de rota de uploads
    caminhoRelativo = path.join(UPLOAD_ROUTE_PREFIX, nomeArquivo);
  } else {
    // 2. Se a logo real não existe ou é nula, usa a logo padrão.
    // ATENÇÃO: Vamos manter a lógica original para a logo padrão, assumindo
    // que a logo padrão ainda está em /public/teste/.
    caminhoRelativo = path.join('/public', pasta, arquivoPadrao);
  }
  
  // Garante que o caminho relativo use barras '/'
  const caminhoRelativoFormatado = caminhoRelativo.replace(/\\/g, '/');

  // Constrói a URL completa de forma segura
  const urlCompleta = new URL(caminhoRelativoFormatado, API_URL);

  return urlCompleta.href;
}

// CORREÇÃO: Altera o nome da função exportada para corresponder ao import em farmacias.js
module.exports = { geraUrl: gerarUrl };