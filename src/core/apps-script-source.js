// ============================================================
// CREA-GO OTP Autofill — Servidor de códigos OTP
//
// Este script roda na sua conta Google e permite que o
// user-script/extensão do navegador busque o código de
// validação (OTP) enviado pelo CREA-GO para o seu e-mail.
//
// Como funciona:
//   1. O navegador envia uma requisição com um token secreto.
//   2. Este script verifica se o token está correto.
//   3. Se estiver, ele procura nos seus e-mails recentes
//      a mensagem do CREA com o código de 6 dígitos.
//   4. Retorna o código para o navegador preencher, junto com
//      a data/hora em que o e-mail foi recebido — assim o
//      navegador consegue ignorar códigos antigos (de um
//      login anterior) em vez de reenviá-los ao CREA.
//
// Segurança:
//   - Apenas quem possui o token abaixo consegue consultar.
//   - O script só lê e-mails do CREA, nunca modifica nada.
//   - No pior caso, um código OTP sozinho é inútil sem a
//     senha da conta do CREA.
//
// Formato da resposta (JSON):
//   { status: 'unauthorized' }                        -> token inválido
//   { status: 'pending' }                             -> nenhum código encontrado ainda
//   { status: 'ok', code, codeTimestamp }             -> código encontrado
//     - code: string de 6 caracteres alfanuméricos
//     - codeTimestamp: data do e-mail em milissegundos (epoch)

// Token de autenticação — gerado automaticamente.
// Não compartilhe este valor com ninguém.
const TOKEN = '{{token}}'

/**
 * Função principal do script
 * Ela recebe as requisições, processa autenticação, procura o código no e-mail e retorna ele
 */
function doGet (e) {
  // Verifica se o token de autenticação é válido
  if (!e.parameter.token || e.parameter.token !== TOKEN) {
    return jsonResponse({ status: 'unauthorized' })
  }

  // Busca e-mails do CREA dos últimos 10 minutos
  // "in:anywhere" garante que encontra mesmo se o e-mail
  // foi para Lixeira, Spam ou outra pasta.
  const query = 'from:naoresponder@creagoias.org.br subject:"Código de validação" newer_than:10m in:anywhere'
  const threads = GmailApp.search(query, 0, 10)

  if (!threads.length) {
    return jsonResponse({ status: 'pending' })
  }

  // Identifica qual e-mail corresponde ao padrão fornecido
  const emailPattern = e.parameter.emailPattern
  let targetMessage = null

  if (emailPattern) {
    // Converte o padrão ofuscado do CREA para uma expressão regular
    // Exemplo: "ex***le@e***.com" vira "ex.*le@e.*\.com"
    const escapedParts = emailPattern
      .split('***')
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

    const regex = new RegExp(escapedParts.join('.*'), 'i')

    // Procura nas threads recentes pelo e-mail que bate com o padrão
    for (const thread of threads) {
      const messages = thread.getMessages()
      const message = messages[messages.length - 1]

      // Verifica os cabeçalhos onde o e-mail original pode estar
      const headersToSearch = [
        message.getTo(),
        message.getHeader('Delivered-To'),
        message.getHeader('X-Forwarded-To')
      ].join(' ')

      if (regex.test(headersToSearch)) {
        targetMessage = message
        break
      }
    }
  } else {
    // Sem padrão de e-mail, pega o e-mail mais recente
    const msgs = threads[0].getMessages()
    targetMessage = msgs[msgs.length - 1]
  }

  if (!targetMessage) {
    return jsonResponse({ status: 'pending' })
  }

  // Extrai o código de 6 caracteres alfanuméricos do corpo do e-mail
  const body = targetMessage.getBody()
  const match = body.match(/<span[^>]*>\s+\b([A-Z0-9]{6})\b\s+<\/span>/)

  if (!match) {
    return jsonResponse({ status: 'pending' })
  }

  return jsonResponse({
    status: 'ok',
    code: match[1],
    // Data em que o CREA enviou o e-mail (não a data em que o
    // buscamos), usada pelo navegador para descartar códigos
    // de um login anterior.
    codeTimestamp: targetMessage.getDate().getTime()
  })
}

/** Essa função retorna uma resposta em formato JSON */
function jsonResponse (data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
