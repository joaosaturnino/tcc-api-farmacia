const fse = require('fs-extra');
const path = require('path');
require('dotenv').config(); // Garante que as variáveis de ambiente sejam lidas

/**
 * Caminho físico para a pasta 'public' no servidor.
 * Usado para checar se o arquivo existe no disco.
 */
const PUBLIC_ROOT_PATH = path.join(process.cwd(), 'public');

/**
 * Lê a URL base da API.
 * IMPORTANTE: Se não houver variável de ambiente, usa o IP da máquina.
 * 'localhost' não funciona no Android/Expo, tem que ser o IP da rede (IPv4).
 */
const API_URL = process.env.API_BASE_URL || 'http://10.72.152.164:3334';

/**
 * Gera uma URL pública completa para um recurso.
 * Verifica se o arquivo existe; se não, retorna a imagem padrão.
 *
 * @param {string} nomeArquivo O nome do arquivo salvo no banco (ex: "produto-123.jpg").
 * @param {string} pasta A subpasta dentro de 'public/' (ex: "produtos").
 * @param {string} arquivoPadrao O nome do arquivo fallback (ex: "padrao.png").
 * @returns {string} A URL completa (ex: 'http://192.168.200.27:3334/public/produtos/foto.jpg').
 */
function gerarUrl(nomeArquivo, pasta, arquivoPadrao) {
    
    // 1. Monta o caminho físico do arquivo solicitado para teste
    // Ex: C:\Projetos\PharmaX\public\produtos\foto-teste.jpg
    const caminhoFisicoArquivo = path.join(PUBLIC_ROOT_PATH, pasta, nomeArquivo || '');

    let arquivoFinal = arquivoPadrao;

    // 2. Verifica se o nomeArquivo foi enviado E se ele realmente existe na pasta
    if (nomeArquivo && nomeArquivo.trim() !== '' && fse.existsSync(caminhoFisicoArquivo)) {
        arquivoFinal = nomeArquivo;
    }

    // 3. Monta o caminho relativo para a URL (Web path)
    // Usa path.join para garantir a estrutura, depois substitui barras invertidas
    // Ex: /public/produtos/foto.jpg
    let caminhoRelativo = path.join('/public', pasta, arquivoFinal);
    
    // CORREÇÃO PARA WINDOWS: Transforma '\' em '/'
    const caminhoWeb = caminhoRelativo.replace(/\\/g, '/');

    // 4. Concatena a URL do servidor com o caminho da imagem
    // Retorna ex: http://192.168.200.27:3334/public/produtos/padrao.png
    try {
        // new URL lida corretamente com barras duplas e formatação
        const urlCompleta = new URL(caminhoWeb, API_URL);
        return urlCompleta.href;
    } catch (error) {
        console.error("Erro ao gerar URL:", error.message);
        // Fallback de segurança caso a URL falhe
        return `${API_URL}${caminhoWeb}`;
    }
}

module.exports = { gerarUrl };