# Confia+

**Human Recruitment Journey · Automatizamos tarefas para humanizar relações.**

Protótipo para o Hackathon People Strategy with AI, no desafio «Recrutar com Confiança». A Ana Martins acompanha a sua candidatura a People Experience Specialist na Horizonte. A Marta Silva acompanha entrevistas e pedidos de contacto no painel de recrutamento.

## Executar localmente

Requer Node.js 22.13+ na série 22 ou Node.js 24+ e npm.

```sh
npm ci
npm run dev
```

Abre o endereço mostrado pelo Vite. Entra como candidato ou recrutador através da página inicial. Usa o botão de mudança de perfil para acompanhar os mesmos dados nas duas perspetivas. O botão «Reiniciar demonstração» repõe os dados iniciais após confirmação.

## Verificar e criar o build

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Para validar um caminho de publicação específico (Bash):

```sh
VITE_BASE_PATH=/nome-do-repositorio/ npm run build
VITE_BASE_PATH=/nome-do-repositorio/ npm run preview
```

Abre a subpasta indicada pelo Vite. Por omissão, o caminho base é relativo. A navegação usa estado interno, pelo que recarregar mantém o mesmo URL e restaura a vista guardada. Serve a pasta `dist/` por HTTP; os módulos JavaScript requerem um servidor estático.

## Publicar no GitHub Pages

1. Coloca o conteúdo desta pasta na raiz de um repositório GitHub e faz push para a branch predefinida.
2. Em **Settings → Pages → Build and deployment**, escolhe **GitHub Actions** como fonte.
3. Em **Actions**, executa o workflow **Publicar Confia+ no GitHub Pages** na branch predefinida ou faz um novo push.
4. Confirma que o job `deploy` terminou com sucesso e abre o URL apresentado em **Settings → Pages**.

O workflow instala o lockfile, verifica TypeScript, executa os testes, obtém o caminho base com `actions/configure-pages` e publica `dist/` através do mecanismo oficial do Pages. Serve repositórios com nomes arbitrários e sites na raiz. O workflow está preparado para execução no repositório de destino.

## Organização do código

| Local | Responsabilidade |
| --- | --- |
| `src/pages/` | Entrada, jornada, Concierge, agendamento e painel |
| `src/context/AppContext.tsx` | Estado comum, regras de transição, histórico, persistência e reinício |
| `src/services/conciergeEngine.ts` | Normalização do texto e respostas por intenção |
| `src/data/mockData.ts` | Dados fictícios, horários, pontos e pressupostos das estimativas |
| `src/components/ui.tsx` | Logótipo, diálogo e cabeçalhos reutilizáveis |
| `src/App.test.tsx` | Regras de negócio e fluxos da interface |
| `.github/workflows/deploy.yml` | Build e publicação no GitHub Pages |

## Simulação e privacidade

- O Concierge usa regras locais. Uma pergunta sem resposta oferece encaminhamento, que só é registado mediante confirmação. Pedidos explícitos são registados de imediato e pedidos ativos idênticos são deduplicados.
- A entrevista, os horários e a notificação de convite são fictícios. O último estado da entrevista aparece no painel e as operações anteriores ficam no registo de atividade.
- Os indicadores são simulados. Contam respostas conhecidas e operações de agendamento (confirmação, alteração e cancelamento). A estimativa de tempo usa **2 minutos por resposta e 5 por operação**, valores configuráveis em `estimatedMinutes` em `src/data/mockData.ts`.
- Os pontos e as conquistas são simbólicos. Apenas a missão de cultura marca a etapa correspondente na jornada. Marcar uma entrevista atualiza a respetiva etapa e o feedback fica por realizar no cenário demonstrado. A Marta gere manualmente os estados dos Momentos Humanos. As decisões de recrutamento são humanas.
- O armazenamento pertence ao navegador e à origem do site. Mantém-se até que os dados sejam limpos ou que a demonstração seja reiniciada. Usa apenas texto fictício. O protótipo funciona sem serviços de IA, backend, autenticação, calendários externos ou envio de mensagens. Os perfis são vistas da mesma demo, sem separação de permissões equivalente à de um sistema real. O estado destina-se a uma sessão ativa do protótipo.

## Guião de apresentação ao júri · dois minutos

| Tempo | O que mostrar |
| --- | --- |
| **0:00–0:25 · O problema** | Começa na página inicial. Explica como emails, perguntas repetidas e agendamento ocupam tempo que a equipa podia dedicar a conversas com os candidatos. |
| **0:25–0:55 · A experiência da candidata** | Entra como candidata. Abre «Exploradora da Cultura», lê um valor e conclui a missão. Mostra os 50 pontos, a conquista e o progresso. Explica que a participação é opcional. |
| **0:55–1:20 · A automação** | Abre o Concierge e escolhe «Como funciona a entrevista?». Usa «Agendar entrevista», escolhe 24 de novembro às 10h00 e confirma. |
| **1:20–1:50 · O diferencial** | Volta ao Concierge e escreve «Gostava de falar com a Marta para esclarecer algumas dúvidas.» Muda para recrutador, mostra a entrevista e os indicadores. Abre o pedido e marca-o como «Em acompanhamento» e depois «Concluído». |
| **1:50–2:00 · A mensagem final** | «Confia+: automatizamos tarefas para humanizar relações.» |
