# Política de Privacidade

> [🇬🇧 English version](PRIVACY.en.md)

Esta extensão/user-script ("CREA-GO OTP Autofill") não é operada por
nenhuma empresa: é um projeto de código aberto e não coleta nem envia
dados para o autor, para a Mozilla, para o Google ou para qualquer outro
terceiro além do serviço que **você mesmo** cria e controla.

## O que é armazenado

Localmente, no armazenamento interno da extensão (`browser.storage.local`)
ou do gerenciador de user-scripts (`GM_setValue`), isolado por
extensão/script e inacessível a páginas web:

- A URL do seu Apps Script e o token de autenticação, sempre
  criptografados com AES-256-GCM usando uma chave derivada do seu
  CPF/CNPJ (veja `src/core/crypto.js`).
- O padrão de e-mail mascarado que o CREA exibe (ex.: `ex***lo@g***.com`),
  usado apenas para associar a configuração à conta correta.

Nada disso sai do seu navegador, exceto para a chamada descrita abaixo.

## O que é transmitido, para onde e por quê

A única comunicação de rede feita pela extensão é uma requisição HTTPS
para `https://script.google.com/*` — especificamente, para o Apps Script
que você mesmo implantou na sua própria conta Google. Essa requisição
envia:

- o token de 256 bits gerado localmente (não é um dado pessoal: é um
  segredo aleatório);
- o padrão de e-mail já mascarado mencionado acima.

E recebe de volta o código OTP mais recente (se houver um enviado nos
últimos 10 minutos) para preencher o formulário de login do CREA.

Nenhum outro destino, nenhum outro tipo de dado. Não há telemetria,
analytics, ou qualquer chamada de rede fora dessa única finalidade.

## Por que isso aparece como "coleta de dados" na instalação

A partir de novembro de 2025, o Firefox exige que toda extensão nova
declare, no `manifest.json`, se transmite algum tipo de dado — mesmo
quando esse dado nunca chega ao desenvolvedor. Como o propósito desta
extensão é justamente obter um código de autenticação de um serviço
remoto (o seu próprio Apps Script), ela declara a categoria
`authenticationInfo` como obrigatória (`required`), para ser transparente
sobre essa transmissão mesmo sendo para um serviço que você mesmo
controla. Veja `REVIEWER_NOTES.md` para mais detalhes técnicos.

## Dúvidas

Abra uma [issue no GitHub](https://github.com/qgustavor/crea-otp-autofill/issues).
