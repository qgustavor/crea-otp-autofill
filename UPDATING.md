# Atualizando o script do Google Apps Script

Estas instruções são para quem **já configurou** o CREA OTP Autofill antes e
precisa atualizar o script que roda na sua conta Google — seja porque
recebeu o e-mail de aviso de atualização, seja porque viu uma nova versão
nas [releases do projeto](https://github.com/qgustavor/crea-otp-autofill/releases).

Se você ainda não configurou o CREA OTP Autofill, use o assistente de
configuração embutido na extensão/user-script em vez deste guia — ele já
cuida de tudo isso automaticamente na primeira vez.

**Importante:** atualizar o código **não muda o endereço (URL) do seu
Web App**. Você não precisa criar uma nova implantação, nem atualizar a
URL salva na extensão/user-script — só o conteúdo do script muda.

## Passo a passo

1. **Pegue o token do script atual.**
   Acesse o [Google Apps Script](https://script.google.com/home), abra o
   projeto que você já criou para o CREA OTP Autofill, e copie o valor
   que está entre aspas na linha:

   ```js
   const TOKEN = '...' // <- copie o que está entre aspas aqui
   ```

   Esse token é o que autentica seu navegador junto ao script. Não
   compartilhe esse valor com ninguém — trate-o como uma senha.

2. **Pegue o código da versão mais recente.**
   Copie o conteúdo de [`src/core/apps-script-source.js`](https://github.com/qgustavor/crea-otp-autofill/blob/main/src/core/apps-script-source.js)
   deste repositório.

3. **Substitua o código atual pelo novo.**
   De volta ao editor do Google Apps Script, selecione todo o conteúdo
   existente e apague. Cole no lugar o código copiado no passo 2.

4. **Preencha o token.**
   No código recém-colado, encontre a linha:

   ```js
   const TOKEN = '{{token}}'
   ```

   E substitua `{{token}}` pelo token que você copiou no passo 1,
   mantendo as aspas. Por exemplo:

   ```js
   const TOKEN = 'a1b2c3d4e5f6'
   ```

5. **Salve.** `Ctrl+S` ou `Cmd+S`. Não é preciso reimplantar (não use
   "Implantar" → "Nova implantação" nem "Gerenciar implantações").

6. **Autorize novamente, se solicitado.** Versões mais novas do script
   podem precisar de uma permissão que a versão anterior não usava (por
   exemplo, para poder avisar por e-mail quando uma atualização estiver
   disponível). Se o Google mostrar uma tela de autorização ao salvar ou
   na primeira execução seguinte, isso é esperado — revise as permissões
   pedidas e aceite para continuar usando o preenchimento automático.

Pronto — nenhuma outra configuração (na extensão, no user-script, ou na
URL salva) precisa mudar.
