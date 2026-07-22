# CREA-GO OTP Autofill

Preenchimento automático de códigos OTP para o portal [CREANET](https://creanet.crea-go.org.br/) do CREA-GO.

> [🇬🇧 English version](README.en.md)

## O que faz

Quando você faz login no CREANET, o sistema envia um código de 6 dígitos por e-mail. Este projeto lê esse código automaticamente do seu Gmail e preenche o formulário para você — sem precisar abrir o e-mail.

É útil para quem faz login frequentemente ou para delegação segura de acesso (permitindo que alguém use a conta do CREA sem ter acesso direto à caixa de entrada do e-mail).

## Como usar

### 1. Instale a extensão ou o user-script

| Navegador | Método |
|-----------|--------|
| **Firefox** (e forks) | Instale a [extensão para Firefox](../../releases/latest) |
| **Chrome, Edge, etc.** | Instale um gerenciador de user-scripts ([Violentmonkey](https://violentmonkey.github.io/), [Tampermonkey](https://www.tampermonkey.net/)) e depois instale o [user-script](../../releases/latest/download/crea-otp-autofill.user.js) |

### 2. Faça login no CREA

Na tela de código de verificação, o sistema detecta seu e-mail e oferece a opção de configurar o preenchimento automático. Basta seguir o passo a passo na tela.

É só isso. No próximo login, o código será preenchido automaticamente.

## Como funciona

O sistema tem dois componentes:

1. **Extensão/user-script** (roda no seu navegador): detecta a tela de verificação do CREA e preenche o código automaticamente.
2. **Google Apps Script** (roda na sua conta Google): um pequeno script que lê o e-mail do CREA e retorna o código OTP quando solicitado pelo navegador.

Na primeira vez, o sistema guia você para criar o Apps Script na sua conta Google. Você não precisa programar — basta copiar o código gerado, colar no Google Apps Script e compartilhar a URL de volta.

## Segurança

### Modelo de ameaça

O código OTP sozinho é inútil sem a senha da conta do CREA. Mesmo em um cenário de vazamento total (alguém obtém acesso ao endpoint + token), o máximo que conseguiria é o último código OTP gerado.

### Medidas

- **Criptografia de credenciais**: as credenciais da API do Apps Script que retorna o OTP são armazenadas de forma criptografada, utilizando a identificação de login do usuário (CPF ou CNPJ). Essa etapa impede que terceiros obtenham o OTP a menos que possuam as credenciais do usuário (CPF/CNPJ).
- **Autenticação por token**: o endpoint do Apps Script exige um token de 256 bits gerado localmente no navegador. Sem o token correto, o endpoint retorna erro.
- **Armazenamento isolado**: as credenciais criptografadas ficam no armazenamento interno da extensão ou do gerenciador de user-scripts, e não são expostas no código-fonte.
- **Criptografia em trânsito**: todas as comunicações usam HTTPS (Google Apps Script exige HTTPS).
- **Escopo mínimo**: o Apps Script tem permissão apenas para ler e-mails do Gmail. Não modifica, envia ou exclui nada.
- **Código aberto**: todo o código é público e auditável.

### Detalhes técnicos

Para quem quiser auditar ou entender os mecanismos internos:

- A criptografia local das credenciais utiliza PBKDF2 com 100.000 rodadas para derivação de chave a partir do CPF/CNPJ do usuário e AES-GCM para a cifragem dos dados.
- Tokens são gerados com `crypto.getRandomValues(new Uint8Array(32))` e codificados em hexadecimal (64 caracteres, 256 bits de entropia). Este é o mecanismo padrão recomendado pelo W3C para geração de valores criptograficamente seguros em navegadores.
- No user-script, o armazenamento usa as APIs `GM_getValue` / `GM_setValue` do gerenciador de scripts (Tampermonkey, Violentmonkey, etc.), que isolam os dados por script.
- Na extensão, usa `browser.storage.local`, que é isolado por extensão e inacessível a páginas web.

## Múltiplas contas

Cada configuração é associada ao padrão de e-mail que o CREA mostra na tela de login (ex.: `ex***lo@g***.com`). Você pode configurar quantas contas quiser — cada uma com seu próprio Apps Script.

## Desenvolvimento

### Requisitos

- Bun 1.0+

### Setup

```bash
git clone https://github.com/qgustavor/crea-otp-autofill.git
cd crea-otp-autofill
bun install
```

### Build

```bash
bun run build            # Compila tudo
bun run build:userscript # Apenas o user-script
bun run build:extension  # Apenas a extensão

bun run watch            # Recompila ao salvar
```

Os arquivos compilados ficam em `dist/`:

```
dist/
├── userscript/
│   └── crea-otp-autofill.user.js   ← User-script pronto para instalar
└── extension/
    ├── manifest.json
    └── content.js                   ← Extensão pronta para carregar
```

### Lint

O projeto usa [neostandard](https://github.com/neostandard/neostandard):

```bash
bun run lint
bun run lint:fix
```

### Estrutura do código

```
src/
├── core/                        ← Código compartilhado (user-script + extensão)
│   ├── main.js                  ← Lógica principal e orquestração
│   ├── storage.js               ← Abstração de armazenamento (GM_* vs browser.storage)
│   ├── crypto.js                ← Geração de tokens e criptografia
│   ├── fetcher.js               ← Comunicação com o Apps Script
│   ├── apps-script-template.js  ← Gerador do código do Apps Script
│   └── ui.js                    ← Interface do wizard e mensagens
├── userscript/
│   └── entry.js                 ← Entry point do user-script
└── extension/
    ├── content.js               ← Entry point da extensão
    └── manifest.json
```

O build usa [esbuild](https://esbuild.github.io/), que compila cada entry point em um único arquivo, resolvendo os imports do `core/` automaticamente.

### Testar a extensão no Firefox

1. Abra `about:debugging#/runtime/this-firefox`
2. Clique em "Carregar extensão temporária"
3. Selecione o arquivo `dist/extension/manifest.json`

### Releases

As releases são automatizadas via GitHub Actions. Para publicar uma nova versão:

1. Incremente a versão e crie a tag automaticamente:
   ```bash
   bun pm version patch   # ou minor / major
   ```
2. Envie o commit e a nova tag para o GitHub:
   ```bash
   git push --follow-tags
   ```
3. O CI compila o projeto e cria a release com os arquivos prontos.

## Contribuição

Este projeto foi desenvolvido com auxílio do [Claude](https://claude.ai/) (Anthropic) e [Gemini](https://aistudio.google.com/) (Google). Contribuições, issues e sugestões são bem-vindas.

## Licença

[MIT](LICENSE)
