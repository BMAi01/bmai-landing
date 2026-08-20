# BMAI — Landing Page

Site estático da BMAI. HTML/CSS/JS puro, sem framework.

> **Tem um passo de build:** `npm run build` gera `css/*.min.css` e `js/*.min.js`, que são
> os arquivos que as páginas realmente carregam. Editar o `.css`/`.js` cru sem rodar isso
> não muda nada em produção.

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

## Idiomas

O site fala **7 idiomas**: português, inglês, espanhol, italiano, francês, chinês e russo.
São dois mecanismos, porque as páginas são de dois tipos:

| Onde | Arquivo | Como a chave funciona |
|---|---|---|
| Home (`index.html`) | `js/i18n.js` | chave curta escrita à mão (`hero.title`), marcada no HTML com `data-i18n` |
| Subpáginas (blog, artigo, SEO, jurídicas, radar, edição) | `js/i18n-sub.js` + `i18n/<pagina>.json` | **a chave é o próprio texto em português** |

O português é o que está servido no HTML: quem não troca de idioma não baixa dicionário
nenhum, e o Google continua lendo a página em português (sem URL duplicada por idioma).
O dicionário da subpágina só é baixado quando o visitante escolhe outro idioma.

🔴 **A armadilha:** nas subpáginas, mexer no texto em português muda a chave, e a tradução
para de casar **em silêncio** — aquele trecho volta a aparecer em português, sem erro no
console. Depois de editar texto de subpágina, rode:

```bash
python -m http.server 8000
npm i --no-save playwright        # se ainda não tiver
npm run i18n:conferir
```

Ele abre cada página num navegador de verdade e aponta três coisas: texto novo sem
tradução, tradução órfã (texto que não existe mais) e bloco de texto que nenhum seletor
do `i18n-sub.js` alcança. Corrigido o texto, ajuste a chave correspondente em
`i18n/<pagina>.json` nos 6 idiomas.

`i18n/_dinamicas.json` é uma lista de apoio: são as frases que só entram na tela quando o
visitante age (aviso de formulário, "ver menos", erro do radar). O site não lê esse
arquivo, ele só evita alarme falso no `i18n:conferir`.

**Cache:** os `.json` são servidos com um mês de cache. Mexeu no conteúdo deles, suba a
constante `VERSAO` no topo do `js/i18n-sub.js` **e** o `?v=` do `i18n-sub.min.js` no HTML.
