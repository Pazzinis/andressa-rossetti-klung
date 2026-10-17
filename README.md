# Andressa Rossetti Klung · Psicóloga

Site institucional de Andressa Rossetti Klung, psicóloga (CRP 07/13685), com informações sobre psicoterapia presencial em Capão da Canoa e atendimento on-line.

Página: https://pazzinis.github.io/andressa-rossetti-klung/

O GitHub Pages publica os arquivos estáticos da branch `main`, na raiz do repositório.

## Desenvolvimento

O site não precisa de instalação nem de build. Para abrir uma prévia local:

```sh
python -m http.server 4174
```

Abra `http://localhost:4174/`. O conteúdo fica em `index.html`, o sistema visual em
`styles.css` e as interações do menu e da galeria em `script.js`. As fotos do
consultório usam WebP na resolução original para reduzir o carregamento.

Ao atualizar CSS ou JavaScript, altere também o parâmetro `v` dos respectivos
links no HTML para que navegadores recebam a nova versão.

Antes de publicar, confira o layout em celular e desktop, a navegação pelo menu,
o fechamento da galeria com Escape e a abertura das informações de reembolso.
`node --check script.js` verifica a sintaxe do JavaScript.
