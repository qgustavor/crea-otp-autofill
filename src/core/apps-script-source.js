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
//   5. Se o navegador espera uma versão deste script mais nova do que a
//      instalada aqui, envia um único e-mail avisando sobre isso para o
//      dono desta conta.
//
// Segurança:
//   - Apenas quem possui o token abaixo consegue consultar.
//   - O script só lê e-mails do CREA, nunca modifica nada.
//   - No pior caso, um código OTP sozinho é inútil sem a
//     senha da conta do CREA.
//   - Este script envia e-mails para a própria conta (aviso de
//     atualização) e guarda um único número internamente (a última
//     versão sobre a qual você já foi avisado), só para não repetir o
//     aviso. Nada além disso é armazenado ou enviado a terceiros.
//
// Formato da resposta (JSON):
//   { status: 'unauthorized' }                        -> token inválido
//   { status: 'pending' }                             -> nenhum código encontrado ainda
//   { status: 'ok', code, codeTimestamp }             -> código encontrado
//     - code: string de 6 caracteres alfanuméricos
//     - codeTimestamp: data do e-mail em milissegundos (epoch)
//
// apiVersion está presente em toda resposta (mesmo erros), para que o
// navegador saiba se este script precisa ser atualizado.
// ============================================================

// Token de autenticação — gerado automaticamente.
// Não compartilhe este valor com ninguém.
const TOKEN = '{{token}}'

// Versão deste protocolo. O navegador usa este número para saber se este
// script precisa ser atualizado (colando uma versão nova por cima, sem
// precisar criar uma nova implantação/URL).
const API_VERSION = 2

/**
 * Função principal do script
 * Ela recebe as requisições, processa autenticação, procura o código no e-mail e retorna ele
 */
function doGet (e) {
  // Verifica se o token de autenticação é válido
  if (!e.parameter.token || e.parameter.token !== TOKEN) {
    return jsonResponse({ status: 'unauthorized' })
  }

  // Se o navegador que fez esta requisição já espera uma versão do
  // protocolo mais nova do que a que este script entende, avisa o dono
  // da conta por e-mail (uma única vez por versão). Nunca deve impedir
  // a resposta normal abaixo, mesmo se falhar.
  try {
    notifyIfOutdated(e.parameter.clientVersion)
  } catch (err) {
    // Ignorado de propósito — ver comentário acima.
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

/**
 * Se o navegador solicitante esperar uma versão de protocolo mais recente do que a
 * reconhecida por esta implantação, envia um e-mail ao proprietário da conta informando sobre o fato — e não
 * à pessoa que estiver usando o navegador no momento, já que, com o acesso delegado,
 * essas podem ser pessoas diferentes que não têm como atualizar este script
 * por conta própria. Limitado via PropertiesService para que seja acionado no máximo uma vez
 * por versão-alvo, independentemente do número de solicitações recebidas.
 *
 * @param {string|undefined} clientVersionParam — e.parameter.clientVersion
 */
function notifyIfOutdated (clientVersionParam) {
  const clientVersion = Number(clientVersionParam)
  if (!Number.isFinite(clientVersion) || clientVersion <= API_VERSION) return

  const props = PropertiesService.getScriptProperties()
  const alreadyNotifiedFor = Number(props.getProperty('notifiedVersion') || 0)
  if (alreadyNotifiedFor >= clientVersion) return

  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: 'CREA OTP Autofill: uma atualização está disponível',
    body: buildUpdateEmailBody(clientVersion)
  })

  props.setProperty('notifiedVersion', String(clientVersion))
}

/** @param {number} clientVersion */
function buildUpdateEmailBody (clientVersion) {
  return [
    'Este e-mail foi enviado automaticamente pelo script do Google Apps Script',
    'que você (ou alguém que você ajudou a configurar) instalou nesta conta do',
    'Google como parte do CREA OTP Autofill.',
    '',
    'Ele foi enviado porque um navegador tentou usar este script para buscar um',
    'código de login do CREA, e esse navegador já espera uma versão mais nova',
    'deste script do que a que está instalada aqui.',
    '',
    'Isso não interrompe o preenchimento automático, que continua funcionando',
    'normalmente.',
    '',
    '  Versão atual do script:         ' + API_VERSION,
    '  Versão esperada pelo navegador: ' + clientVersion,
    '',
    'Veja o que mudou e como atualizar em:',
    'https://github.com/qgustavor/crea-otp-autofill/releases',
    '',
    'Para atualizar, não é preciso criar uma nova implantação, o endereço',
    'continua o mesmo. Basta colar o código atualizado por cima do atual.',
    'Instruções detalhadas: https://github.com/qgustavor/crea-otp-autofill/blob/main/UPDATING.md',
    '',
    'Você não receberá este aviso de novo até a próxima atualização de',
    'protocolo.'
  ].join('\n')
}

/** Essa função retorna uma resposta em formato JSON */
function jsonResponse (data) {
  return ContentService
    .createTextOutput(JSON.stringify({ apiVersion: API_VERSION, ...data }))
    .setMimeType(ContentService.MimeType.JSON)
}
