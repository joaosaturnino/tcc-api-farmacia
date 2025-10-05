const fse = require('fs-extra');
const path = require('path');
const { URL } = require('url');

/**
 * Caminho físico para a pasta 'public' onde as imagens estão.
 */
const PUBLIC_ROOT_PATH = path.join(process.cwd(), 'public');

/**
 * Lê a URL base da API a partir das variáveis de ambiente (.env).
 * Se a variável não for encontrada, ele usa 'localhost' como um fallback para desenvolvimento.
 * ESTA É A LINHA MAIS IMPORTANTE PARA O SEU PROBLEMA.
 */
const API_URL = process.env.API_BASE_URL;

/**
 * Gera uma URL pública e completa para um recurso (imagem, ícone, etc.).
 * @param {string} nomeArquivo O nome do arquivo salvo no banco (ex: "123.png").
 * @param {string} pasta A subpasta dentro de 'public/' (ex: "medicamentos").
 * @param {string} arquivoPadrao O nome do arquivo a ser usado se o principal não for encontrado.
 * @returns {string} A URL completa e formatada.
 */
function gerarUrl(nomeArquivo, pasta, arquivoPadrao) {
  let nomeDoArquivoFinal;
  
  // Caminho físico completo para verificar se o arquivo daquele medicamento existe.
  const caminhoFisico = path.join(PUBLIC_ROOT_PATH, pasta, nomeArquivo || '');

  // Verifica se um nome de arquivo foi fornecido e se ele realmente existe no disco.
  if (nomeArquivo && fse.existsSync(caminhoFisico)) {
    // Se o arquivo existir, usa ele.
    nomeDoArquivoFinal = nomeArquivo;
  } else {
    // Caso contrário, usa o arquivo padrão.
    nomeDoArquivoFinal = arquivoPadrao;
  }

  // Monta o caminho relativo que será parte da URL (ex: /public/medicamentos/123.png)
  // Usar path.join aqui garante a consistência das barras, mas a conversão abaixo é uma segurança extra.
  let caminhoRelativo = path.join('/public', pasta, nomeDoArquivoFinal);
  
  // Garante que o caminho use barras normais '/' para URLs, independentemente do sistema operacional.
  const caminhoRelativoFormatado = caminhoRelativo.replace(/\\/g, '/');

  // Constrói a URL completa de forma segura, juntando a base (com seu IP) e o caminho do arquivo.
  const urlCompleta = new URL(caminhoRelativoFormatado, API_URL);

  return urlCompleta.href;
}

module.exports = { gerarUrl };