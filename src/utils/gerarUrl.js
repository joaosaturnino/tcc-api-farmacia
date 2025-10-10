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

/**
 * Gera uma URL pública e COMPLETA para um recurso (imagem, ícone, etc.).
 *
 * @param {string} nomeArquivo O nome do arquivo salvo no banco (ex: "produto-123.jpg").
 * @param {string} pasta A subpasta dentro de 'public/' (ex: "produtos").
 * @param {string} arquivoPadrao O nome do arquivo a ser usado se o principal não for encontrado.
 * @returns {string} A URL completa e formatada (ex: 'http://localhost:3333/public/produtos/produto-123.jpg').
 */
function gerarUrl(nomeArquivo, pasta, arquivoPadrao) {
  // Define qual arquivo será verificado: o nomeArquivo ou o arquivoPadrao
  const arquivoVerificar = nomeArquivo || arquivoPadrao; 
  // Caminho físico completo para verificar se o arquivo existe
  const caminhoFisico = path.join(PUBLIC_ROOT_PATH, pasta, arquivoVerificar); 

  let caminhoRelativo;

  // Se um nome de arquivo foi fornecido e ele de fato existe no sistema de arquivos...
  if (nomeArquivo && fse.existsSync(caminhoFisico)) { 
    // ...usa o caminho para esse arquivo.
    caminhoRelativo = path.join('/public', pasta, nomeArquivo); 
  } else {
    // ...caso contrário, usa o caminho do arquivo padrão.
    caminhoRelativo = path.join('/public', pasta, arquivoPadrao); 
  }
  // Garante que o caminho relativo use barras normais '/' em vez de '\'
  const caminhoRelativoFormatado = caminhoRelativo.replace(/\\/g, '/'); 
  
  // Constrói a URL completa de forma segura, evitando barras duplas (//)
  const urlCompleta = new URL(caminhoRelativoFormatado, API_URL);
  
  return urlCompleta.href; 
}

// Exporta a função para ser usada em outros arquivos
module.exports = { gerarUrl };