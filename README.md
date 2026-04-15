# BMAI — Landing Page

Site estático da BMAI. HTML/CSS/JS puro, **sem build**.

## Estrutura

```
.
├── index.html
├── css/style.css
├── js/main.js
└── assets/
    ├── fonts/
    └── images/
```

## Rodar localmente

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

## Deploy — GitHub Pages

Já ativo em: **https://bmai01.github.io/bmai-landing/**

Qualquer push na branch `main` atualiza automaticamente.

## Deploy — Hostinger

Como é site estático, há 3 formas:

### 1. File Manager (mais simples)
1. Painel Hostinger → **File Manager** → pasta `public_html`
2. Delete o conteúdo padrão
3. Faça upload de **todos** os arquivos desta pasta (ou do `deploy-bmai.zip`)
4. Se usar o zip: clique com botão direito → **Extract**

### 2. FTP
- Host: `ftp.<seudominio>.com`
- Usuário/senha: painel Hostinger → Hospedagem → **Contas FTP**
- Envie o conteúdo para `/public_html/`

### 3. Git Deploy (automático a partir deste repo)
Painel Hostinger → Hospedagem → **Git**:
- Repositório: `https://github.com/BMAi01/bmai-landing.git`
- Branch: `main`
- Diretório: `/public_html`
- Ative **Auto deploy** para sincronizar em cada push

## Formulário

O botão "Enviar para Anna" envia `POST` para `https://anna.bmai.space/lead-site` com:

```json
{ "nome", "email", "whatsapp", "cargo", "colaboradores", "interesse" }
```

Não há redirecionamento para WhatsApp. A Anna (agente de IA) recebe o lead e inicia o contato.
