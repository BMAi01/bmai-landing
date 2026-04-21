/* ============================================
   I18N — traduções curadas PT/EN/ES
   Switch instantâneo via dictionary (zero network).
   ============================================ */
(function () {
  const DICT = {
    pt: {
      'html.lang': 'pt-BR',

      /* NAV */
      'nav.metodo':    'Método',
      'nav.team':      'Team',
      'nav.cases':     'Cases',
      'nav.faq':       'FAQ',
      'nav.cta':       'Falar com o time da BMAi',

      /* HERO */
      'hero.badge':   '+10.000 horas economizadas com IA',
      'hero.title':   '<span class="h-line">IA não precisa ser complicada,</span><span class="h-line">mas precisa dar <span class="hero-resultado">resultado</span></span>',
      'hero.sub':     'DEVOLVEMOS O CONTROLE DO NEGÓCIO AO EMPREENDEDOR QUE DEIXA DE OPERAR NO IMPROVISO<br>E PASSA A TOMAR DECISÕES BASEADO EM DADOS.',
      'hero.cta':     'Falar com o time da BMAi',
      'hero.stat1':   'Projetos realizados',
      'hero.stat2':   'Aumento na conversão do WhatsApp',
      'hero.stat3':   'Dias de implementação média',

      /* QUEM SOMOS */
      'qs.title':     'O processo vem antes.<br><span style="color:var(--orange)">A IA vem depois.</span>',

      /* Section seals */
      'seal.qs':     'Quem somos',
      'seal.metodo': 'Método DEIA',
      'seal.cases':  'Cases',
      'seal.team':   'Time BMAi',
      'seal.form':   'Contato',
      'seal.faq':    'FAQ',
      'seal.cta':    'Próximo passo',
      'qs.sub':       'Inteligência sobre caos só multiplica o caos. Por isso estruturamos o fluxo do seu negócio primeiro — e só depois construímos a IA, moldada à operação.',
      'qs.card1_eyebrow': 'Fase 01 · Processo',
      'qs.card1_h3':      'Estruturamos<br><span style="color:var(--orange)">o processo.</span>',
      'qs.card1_p':       'Preparamos um terreno eficiente para a IA potencializar.',
      'qs.card2_eyebrow': 'Fase 02 · Inteligência',
      'qs.card2_h3':      'Construímos<br><span style="color:var(--orange)">IA sob medida.</span>',
      'qs.card2_p':       'Inteligências Artificiais personalizadas para a função específica.',
      'qs.brand_tag': 'integrando IA…',

      /* MÉTODO */
      'metodo.title': 'Do diagnóstico<br><span style="color:var(--orange)">à escala real.</span>',
      'metodo.sub':   'Quatro fases, uma lógica: entender, organizar, construir, sustentar. Nenhuma é pulada — cada uma constrói em cima da anterior.',

      /* CASES */
      'cases.heading': 'Preferido pelas empresas que<br/><span style="color:var(--orange)">lideram com IA.</span>',
      'cases.lead':    '"Eles viram nosso negócio como único, me trataram como parceiro e me senti visto e ouvido de verdade para desenvolver uma solução de IA para a minha empresa."',
      'cases.btn':     'Quero ser o próximo case',

      'cs_hero.sector': 'Saúde',
      'cs_hero.quote':  '"O volume travava a clínica. 300 mensagens por dia chegando sem parar e tudo parava fora do horário comercial. A BMAI colocou IA no atendimento — hoje o paciente é respondido na hora, até de madrugada, e só chega pra gente o que realmente precisa de humano."',
      'cs_hero.role':   'CEO na GastroObesi',
      'cs_hero.s1':     'mensagens/dia respondidas com IA',
      'cs_hero.s2':     'atendimento sem parar',
      'cs_hero.s3':     'contratações extras necessárias',

      'cs1.sector': 'Marketing Digital',
      'cs1.result': 'Agente de prospecção rodando <span class="cs-card__metric">24h em 3 canais</span> — zero leads esquecidos, <span class="cs-card__metric">+4h/dia</span> devolvidas ao time',
      'cs1.quote':  '"Antes a gente perdia lead todo dia. Agora o agente nunca dorme — Instagram, WhatsApp, e-mail, tudo coberto."',
      'cs1.role':   'CEO · Mataco',

      'cs2.sector': 'Material de Construção',
      'cs2.result': '<span class="cs-card__metric">400 atendimentos/dia</span> com IA — atendimento, prospecção e estoque resolvidos de uma vez',
      'cs2.quote':  '"Chegavam 400 mensagens sem controle e o estoque vivia no improviso. Hoje a operação inteira roda sozinha."',
      'cs2.role':   'CEO · Só Hydráulica',

      'cs3.sector': 'Restaurante',
      'cs3.result': 'Estoque no piloto automático — <span class="cs-card__metric">0 rupturas</span>, desperdício em queda e <span class="cs-card__metric">3 a 5 pessoas</span> liberadas do controle manual',
      'cs3.quote':  '"Antes era tudo no improviso. Compra errada toda semana, falta de produto na hora do serviço. A IA antecipa tudo agora."',
      'cs3.role':   'CEO · O Canto',

      /* TEAM */
      'team.title':        'Nosso time entende<br><span style="color:var(--orange)">o seu negócio.</span>',
      'team.scroll_hint':  'Role para conhecer o time →',
      'team.matheus.role': 'Sócio Fundador',
      'team.matheus.bio':  'Construí a BMAI porque vi de perto o que acontece quando um negócio cresce sem estrutura — o dono vira escravo da operação. Minha missão é mudar isso: transformar empresas que dependem de uma pessoa em negócios que funcionam por sistema.',
      'team.matheus.sig':  'Sócio Fundador · BMAI',
      'team.pedro.role':   'Sócio Fundador',
      'team.pedro.bio':    'Acredito que gerar valor verdadeiro às pessoas e às empresas é a única forma de resultado real e sustentável. Cada solução que a BMAi entrega precisa gerar impacto real — tempo de volta pro dono, previsibilidade de receita e um negócio que cresce sem depender de improviso.',
      'team.pedro.sig':    'Sócio Fundador · BMAI',
      'team.anna.role':    'Atendente',
      'team.anna.bio':     'Cada cliente que chega na BMAI tem uma história. Meu trabalho é ouvir essa história, entender o momento do negócio e garantir que a conversa certa aconteça com a pessoa certa. Relacionamento não é protocolo — é presença.',
      'team.anna.sig':     'Atendente · BMAI',

      /* FAQ */
      'faq.title': 'Perguntas frequentes.',
      'faq.1.q':   'Como funciona?',
      'faq.1.a':   'Primeiro é realizada uma avaliação do seu negócio — processos, momento e maturidade — pra validar se existe algo em que a BMAi consegue te ajudar. Precisamos conhecer a fundo o negócio, suas nuances e fluxos, pra desenhar algo que encaixe perfeitamente pra você. Depois, com a solução adequada definida, começam as implementações e evoluções dos agentes — e os primeiros resultados já aparecem. Ao final, tudo ajustado e funcionando, você acompanha os resultados e trabalha a melhoria contínua junto com a gente.',
      'faq.2.q':   'Preciso demitir meus colaboradores?',
      'faq.2.a':   'Não. A IA não substitui seu time, potencializa. Trabalhos repetitivos, burocráticos, processos complexos e cheios de detalhes — é aí que a IA entra pra aliviar você e sua equipe. Isso permite realocar gente boa pra funções estratégicas e táticas, de maior valor e impacto no crescimento do negócio. A IA existe pra nos servir — o erro começa quando isso se inverte.',
      'faq.3.q':   'Preciso ter conhecimento técnico?',
      'faq.3.a':   'Nenhum. Você nos conta como funciona a sua operação — e a BMAi transforma em IA. Toda a parte técnica (prompts, integrações, infra, deploy, ajustes) fica com o time da BMAi. Seu trabalho é validar o que faz sentido pro seu negócio. É como contratar um diretor operacional que também é engenheiro — sem precisar ser um.',
      'faq.4.q':   'Não sei se funciona no meu segmento',
      'faq.4.a':   'Já validamos soluções em segmentos muito diferentes. O que de fato importa é o processo: se ele está bem definido e você sabe o que precisa ser feito, fica mais fácil aplicar IA. Nosso trabalho começa justamente aí — mapeando e estruturando antes de construir qualquer inteligência.',
      'faq.5.q':   'IA no meu nicho não converte, precisa ser humanizado',
      'faq.5.a':   'A IA realmente não faz tudo sozinha — mas nossos agentes são treinados com o tom da sua empresa, a linguagem do seu cliente e as nuances específicas do público. A gente consegue esse encaixe porque estuda bem o processo e o perfil do consumidor — então o que o agente fala é exatamente o que o cliente quer ouvir.',
      'faq.6.q':   'Quanto custa?',
      'faq.6.a':   'Não trabalhamos com tabela. Cada projeto é precificado com base no diagnóstico real: escopo da operação, número de frentes que a IA vai atender, nível de integração com os sistemas que você já usa e complexidade dos fluxos. Durante todo o processo, nosso time te receita uma solução que encaixe no seu negócio em todos os âmbitos — do operacional ao financeiro.',
      'faq.7.q':   'Quanto tempo leva tudo isso?',
      'faq.7.a':   'Cada solução é única e tem suas próprias nuances — isso é alinhado antes, durante e depois da implementação. Em média, pra projetos de complexidade média, entre 5 e 35 dias a solução já está 100% ativa.',
      'faq.8.q':   'O que acontece depois da implementação?',
      'faq.8.a':   'Nosso time faz melhorias e manutenção constantes pra solução continuar funcionando bem e evoluindo. Você tem acesso direto ao suporte pra ajustar métricas e resolver o que for precisando — a parceria não termina no deploy, começa nele.',

      /* FORM */
      'form.tag':     'Fale com o time da BMAi',
      'form.title':   'Pronto para estruturar<br><span style="color:var(--orange)">seu negócio de verdade?</span>',
      'form.lead':    'Preencha o formulário. O time da BMAi entra em contato em até 24h para entender o momento da sua empresa.',
      'form.b1':      'Diagnóstico real do seu processo comercial',
      'form.b2':      'Identificação dos principais entraves operacionais',
      'form.b3':      'Proposta com método e cronograma em até 48h',
      'form.b4':      'Sem spam. Sem robô. Uma conversa real.',
      'form.p_nome':  'Nome completo',
      'form.p_emp':   'Nome da empresa',
      'form.p_mail':  'E-mail corporativo',
      'form.p_tel':   'Telefone / WhatsApp',
      'form.p_cargo': 'Cargo',
      'form.p_seg':   'Segmento',
      'form.p_col':   'Número de colaboradores',
      'form.submit':  'Enviar para o time da BMAi',
      'form.disclaim':'Ao enviar, o time da BMAi entrará em contato com você.',
      'form.fb_ok':   'Recebido! O time da BMAi vai entrar em contato em até 24h.',
      'form.fb_err':  'Não conseguimos enviar agora. Tente novamente em instantes ou chame o time da BMAi no WhatsApp.',
      'form.fb_wall': 'Preencha o campo destacado para enviar.',
      'form.fb_walm': 'Preencha os %n campos destacados para enviar.',
      'form.fb_mail': 'Verifique o e-mail e os campos destacados.',

      /* CTA FINAL */
      'cta.title': 'Crescer sem eficiência é crescer com <span style="color:var(--orange)">prazo de validade.</span>',
      'cta.sub':   'Até quando você vai continuar postergando a escala do seu negócio?',
      'cta.btn':   'Fale com o time da BMAi',

      /* FOOTER */
      'footer.kind':    'Engenharia de inteligência aplicada.',
      'footer.h_site':  'Site',
      'footer.h_ctc':   'Contato',
      'footer.l_quem':  'Quem somos',
      'footer.l_met':   'Método DEIA',
      'footer.l_cases': 'Cases',
      'footer.l_team':  'Team',
      'footer.l_faq':   'FAQ',
      'footer.copy':    '© <span id="footerYear">2026</span> BMAi · Todos os direitos reservados',
      'footer.backtop': 'Voltar ao topo'
    },

    /* ============================================ EN ============================================ */
    en: {
      'html.lang': 'en',

      'nav.metodo': 'Method',
      'nav.team':   'Team',
      'nav.cases':  'Cases',
      'nav.faq':    'FAQ',
      'nav.cta':    'Chat with the BMAi team',

      'hero.badge': '+10,000 hours saved with AI',
      'hero.title': '<span class="h-line">AI doesn\'t have to be complicated,</span><span class="h-line">it just has to deliver <span class="hero-resultado">results</span></span>',
      'hero.sub':   'WE GIVE CONTROL OF THE BUSINESS BACK TO THE OWNER WHO STOPS OPERATING ON GUESSWORK<br>AND STARTS MAKING DECISIONS BASED ON DATA.',
      'hero.cta':   'Chat with the BMAi team',
      'hero.stat1': 'Projects delivered',
      'hero.stat2': 'Increase in WhatsApp conversion',
      'hero.stat3': 'Average implementation days',

      'qs.title':     'Process comes first.<br><span style="color:var(--orange)">AI comes second.</span>',

      /* Section seals */
      'seal.qs':     'About us',
      'seal.metodo': 'DEIA Method',
      'seal.cases':  'Cases',
      'seal.team':   'BMAi Team',
      'seal.form':   'Contact',
      'seal.faq':    'FAQ',
      'seal.cta':    'Next step',
      'qs.sub':       'Intelligence on top of chaos only multiplies chaos. That\'s why we structure your business flow first — and only then build the AI, shaped to the operation.',
      'qs.card1_eyebrow': 'Phase 01 · Process',
      'qs.card1_h3':      'We structure<br><span style="color:var(--orange)">the process.</span>',
      'qs.card1_p':       'We prepare fertile ground for AI to amplify.',
      'qs.card2_eyebrow': 'Phase 02 · Intelligence',
      'qs.card2_h3':      'We build<br><span style="color:var(--orange)">tailored AI.</span>',
      'qs.card2_p':       'Artificial Intelligences customized for the specific function.',
      'qs.brand_tag': 'integrating AI…',

      'metodo.title': 'From diagnosis<br><span style="color:var(--orange)">to real scale.</span>',
      'metodo.sub':   'Four phases, one logic: understand, organize, build, sustain. None is skipped — each builds on the last.',

      'cases.heading': 'Chosen by companies that<br/><span style="color:var(--orange)">lead with AI.</span>',
      'cases.lead':    '"They saw our business as unique, treated me as a partner, and I felt truly seen and heard in building an AI solution for my company."',
      'cases.btn':     'I want to be the next case',

      'cs_hero.sector': 'Healthcare',
      'cs_hero.quote':  '"Volume was strangling the clinic. 300 messages a day pouring in non-stop, and everything ground to a halt outside business hours. BMAI put AI into support — today the patient gets a response instantly, even at 3am, and only what truly needs a human reaches us."',
      'cs_hero.role':   'CEO at GastroObesi',
      'cs_hero.s1':     'messages/day answered with AI',
      'cs_hero.s2':     'non-stop support',
      'cs_hero.s3':     'extra hires needed',

      'cs1.sector': 'Digital Marketing',
      'cs1.result': 'Prospecting agent running <span class="cs-card__metric">24/7 on 3 channels</span> — zero leads forgotten, <span class="cs-card__metric">+4h/day</span> given back to the team',
      'cs1.quote':  '"We used to lose a lead every day. Now the agent never sleeps — Instagram, WhatsApp, email, all covered."',
      'cs1.role':   'CEO · Mataco',

      'cs2.sector': 'Construction Materials',
      'cs2.result': '<span class="cs-card__metric">400 interactions/day</span> with AI — support, prospecting and inventory solved in one stroke',
      'cs2.quote':  '"400 messages were coming in with no control and inventory ran on guesswork. Today the whole operation runs itself."',
      'cs2.role':   'CEO · Só Hydráulica',

      'cs3.sector': 'Restaurant',
      'cs3.result': 'Inventory on autopilot — <span class="cs-card__metric">0 stockouts</span>, waste dropping and <span class="cs-card__metric">3 to 5 people</span> freed from manual control',
      'cs3.quote':  '"Before, everything was improv. Wrong purchase every week, product missing mid-service. AI anticipates everything now."',
      'cs3.role':   'CEO · O Canto',

      'team.title':        'Our team understands<br><span style="color:var(--orange)">your business.</span>',
      'team.scroll_hint':  'Scroll to meet the team →',
      'team.matheus.role': 'Founding Partner',
      'team.matheus.bio':  'I built BMAI because I saw up close what happens when a business grows without structure — the owner becomes a slave to the operation. My mission is to change that: turn companies that depend on one person into businesses that run on systems.',
      'team.matheus.sig':  'Founding Partner · BMAI',
      'team.pedro.role':   'Founding Partner',
      'team.pedro.bio':    'I believe generating real value for people and companies is the only path to lasting results. Every solution BMAi delivers has to create real impact — time back for the owner, predictable revenue, and a business that grows without relying on improv.',
      'team.pedro.sig':    'Founding Partner · BMAI',
      'team.anna.role':    'Client Lead',
      'team.anna.bio':     'Every client who arrives at BMAI has a story. My job is to hear that story, understand where the business stands, and make sure the right conversation happens with the right person. Relationship isn\'t protocol — it\'s presence.',
      'team.anna.sig':     'Client Lead · BMAI',

      'faq.title': 'Frequently asked questions.',
      'faq.1.q':   'How does it work?',
      'faq.1.a':   'First, we run an evaluation of your business — processes, current stage and operational maturity — to validate whether there\'s something BMAi can actually help you with. We need to dive deep into the business, its nuances and flows, to design something that fits your operation perfectly. Then, with the right solution defined, we start the implementation and evolution of the agents — and the first results begin to show. In the end, with everything tuned and running, you track results and work on continuous improvement side by side with us.',
      'faq.2.q':   'Do I need to lay off my team?',
      'faq.2.a':   'No. AI doesn\'t replace your team — it amplifies it. Repetitive, bureaucratic tasks, complex processes loaded with detail — that\'s where AI comes in to take the load off you and your team. It lets you reallocate good people to strategic and tactical roles, with higher value and impact on business growth. AI exists to serve us — the mistake starts when that relationship flips.',
      'faq.3.q':   'Do I need technical knowledge?',
      'faq.3.a':   'None. You tell us how your operation works — and BMAi turns it into AI. The whole technical side (prompts, integrations, infra, deploy, tuning) stays with the BMAi team. Your job is to validate what makes sense for your business. It\'s like hiring an operations director who\'s also an engineer — without needing to be one yourself.',
      'faq.4.q':   'I\'m not sure it works in my industry',
      'faq.4.a':   'We\'ve validated solutions across very different industries. What actually matters is the process: if it\'s well defined and you know what needs to happen, it\'s easier to apply AI. That\'s exactly where our work starts — mapping and structuring before building any intelligence.',
      'faq.5.q':   'AI doesn\'t convert in my niche, it needs to feel human',
      'faq.5.a':   'AI really can\'t do everything on its own — but our agents are trained with your company\'s tone, your customer\'s language and the specific nuances of your audience. We pull off that fit because we study the process and consumer profile deeply — so what the agent says is exactly what the customer wants to hear.',
      'faq.6.q':   'How much does it cost?',
      'faq.6.a':   'We don\'t work with a fixed pricing table. Each project is priced based on the real diagnosis: scope of operation, number of fronts AI will cover, level of integration with your existing systems and complexity of the flows. Throughout the whole process, our team prescribes a solution that fits your business on every level — operational to financial.',
      'faq.7.q':   'How long does all this take?',
      'faq.7.a':   'Every solution is unique and has its own nuances — that gets aligned before, during and after implementation. On average, for medium-complexity projects, within 5 to 35 days the solution is 100% live.',
      'faq.8.q':   'What happens after implementation?',
      'faq.8.a':   'Our team makes continuous improvements and maintenance so the solution keeps working well and evolving. You get direct access to support to tune metrics and solve whatever you need — the partnership doesn\'t end at deploy, it starts there.',

      'form.tag':     'Chat with the BMAi team',
      'form.title':   'Ready to truly structure<br><span style="color:var(--orange)">your business?</span>',
      'form.lead':    'Fill out the form. The BMAi team will reach out within 24h to understand where your company stands.',
      'form.b1':      'Real diagnosis of your commercial process',
      'form.b2':      'Identification of key operational bottlenecks',
      'form.b3':      'Proposal with method and timeline within 48h',
      'form.b4':      'No spam. No bots. A real conversation.',
      'form.p_nome':  'Full name',
      'form.p_emp':   'Company name',
      'form.p_mail':  'Business email',
      'form.p_tel':   'Phone / WhatsApp',
      'form.p_cargo': 'Role',
      'form.p_seg':   'Industry',
      'form.p_col':   'Number of employees',
      'form.submit':  'Send to the BMAi team',
      'form.disclaim':'By submitting, the BMAi team will reach out to you.',
      'form.fb_ok':   'Got it! The BMAi team will be in touch within 24h.',
      'form.fb_err':  'We couldn\'t send right now. Try again in a moment or reach the BMAi team on WhatsApp.',
      'form.fb_wall': 'Please fill the highlighted field to send.',
      'form.fb_walm': 'Please fill the %n highlighted fields to send.',
      'form.fb_mail': 'Check the email and the highlighted fields.',

      'cta.title': 'Growing without efficiency is growing with <span style="color:var(--orange)">an expiration date.</span>',
      'cta.sub':   'How much longer will you keep postponing scale?',
      'cta.btn':   'Chat with the BMAi team',

      'footer.kind':    'Applied intelligence engineering.',
      'footer.h_site':  'Site',
      'footer.h_ctc':   'Contact',
      'footer.l_quem':  'About',
      'footer.l_met':   'DEIA Method',
      'footer.l_cases': 'Cases',
      'footer.l_team':  'Team',
      'footer.l_faq':   'FAQ',
      'footer.copy':    '© <span id="footerYear">2026</span> BMAi · All rights reserved',
      'footer.backtop': 'Back to top'
    },

    /* ============================================ ES ============================================ */
    es: {
      'html.lang': 'es',

      'nav.metodo': 'Método',
      'nav.team':   'Equipo',
      'nav.cases':  'Casos',
      'nav.faq':    'FAQ',
      'nav.cta':    'Hablar con el equipo BMAi',

      'hero.badge': '+10.000 horas ahorradas con IA',
      'hero.title': '<span class="h-line">La IA no necesita ser complicada,</span><span class="h-line">pero necesita entregar <span class="hero-resultado">resultados</span></span>',
      'hero.sub':   'DEVOLVEMOS EL CONTROL DEL NEGOCIO AL EMPRENDEDOR QUE DEJA DE OPERAR POR INTUICIÓN<br>Y PASA A TOMAR DECISIONES BASADAS EN DATOS.',
      'hero.cta':   'Hablar con el equipo BMAi',
      'hero.stat1': 'Proyectos entregados',
      'hero.stat2': 'Aumento en conversión de WhatsApp',
      'hero.stat3': 'Días promedio de implementación',

      'qs.title':     'El proceso viene primero.<br><span style="color:var(--orange)">La IA viene después.</span>',

      /* Section seals */
      'seal.qs':     'Quiénes somos',
      'seal.metodo': 'Método DEIA',
      'seal.cases':  'Cases',
      'seal.team':   'Equipo BMAi',
      'seal.form':   'Contacto',
      'seal.faq':    'FAQ',
      'seal.cta':    'Próximo paso',
      'qs.sub':       'Inteligencia sobre caos solo multiplica el caos. Por eso estructuramos el flujo de tu negocio primero — y solo después construimos la IA, moldeada a la operación.',
      'qs.card1_eyebrow': 'Fase 01 · Proceso',
      'qs.card1_h3':      'Estructuramos<br><span style="color:var(--orange)">el proceso.</span>',
      'qs.card1_p':       'Preparamos un terreno eficiente para que la IA potencie.',
      'qs.card2_eyebrow': 'Fase 02 · Inteligencia',
      'qs.card2_h3':      'Construimos<br><span style="color:var(--orange)">IA a medida.</span>',
      'qs.card2_p':       'Inteligencias Artificiales personalizadas para la función específica.',
      'qs.brand_tag': 'integrando IA…',

      'metodo.title': 'Del diagnóstico<br><span style="color:var(--orange)">a la escala real.</span>',
      'metodo.sub':   'Cuatro fases, una lógica: entender, organizar, construir, sostener. Ninguna se salta — cada una se construye sobre la anterior.',

      'cases.heading': 'Preferido por empresas que<br/><span style="color:var(--orange)">lideran con IA.</span>',
      'cases.lead':    '"Vieron nuestro negocio como único, me trataron como socio y me sentí realmente visto y escuchado para desarrollar una solución de IA para mi empresa."',
      'cases.btn':     'Quiero ser el próximo caso',

      'cs_hero.sector': 'Salud',
      'cs_hero.quote':  '"El volumen estrangulaba la clínica. 300 mensajes por día llegando sin parar y todo se frenaba fuera del horario comercial. BMAI puso IA en la atención — hoy el paciente recibe respuesta al instante, incluso de madrugada, y solo llega a nosotros lo que realmente necesita un humano."',
      'cs_hero.role':   'CEO en GastroObesi',
      'cs_hero.s1':     'mensajes/día respondidos con IA',
      'cs_hero.s2':     'atención sin parar',
      'cs_hero.s3':     'contrataciones extra necesarias',

      'cs1.sector': 'Marketing Digital',
      'cs1.result': 'Agente de prospección funcionando <span class="cs-card__metric">24h en 3 canales</span> — cero leads olvidados, <span class="cs-card__metric">+4h/día</span> devueltas al equipo',
      'cs1.quote':  '"Antes perdíamos un lead por día. Ahora el agente nunca duerme — Instagram, WhatsApp, correo, todo cubierto."',
      'cs1.role':   'CEO · Mataco',

      'cs2.sector': 'Materiales de Construcción',
      'cs2.result': '<span class="cs-card__metric">400 atenciones/día</span> con IA — atención, prospección y stock resueltos de una vez',
      'cs2.quote':  '"Llegaban 400 mensajes sin control y el stock vivía por intuición. Hoy toda la operación corre sola."',
      'cs2.role':   'CEO · Só Hydráulica',

      'cs3.sector': 'Restaurante',
      'cs3.result': 'Stock en piloto automático — <span class="cs-card__metric">0 rupturas</span>, desperdicio en caída y <span class="cs-card__metric">3 a 5 personas</span> liberadas del control manual',
      'cs3.quote':  '"Antes era todo improvisación. Compra equivocada cada semana, falta de producto en pleno servicio. La IA anticipa todo ahora."',
      'cs3.role':   'CEO · O Canto',

      'team.title':        'Nuestro equipo entiende<br><span style="color:var(--orange)">tu negocio.</span>',
      'team.scroll_hint':  'Desplázate para conocer al equipo →',
      'team.matheus.role': 'Socio Fundador',
      'team.matheus.bio':  'Construí BMAI porque vi de cerca lo que pasa cuando un negocio crece sin estructura — el dueño se vuelve esclavo de la operación. Mi misión es cambiar eso: transformar empresas que dependen de una persona en negocios que funcionan por sistema.',
      'team.matheus.sig':  'Socio Fundador · BMAI',
      'team.pedro.role':   'Socio Fundador',
      'team.pedro.bio':    'Creo que generar valor real para personas y empresas es la única forma de resultado real y sostenible. Cada solución que BMAi entrega necesita generar impacto real — tiempo de vuelta al dueño, previsibilidad de ingresos y un negocio que crece sin depender de la improvisación.',
      'team.pedro.sig':    'Socio Fundador · BMAI',
      'team.anna.role':    'Responsable de Clientes',
      'team.anna.bio':     'Cada cliente que llega a BMAI tiene una historia. Mi trabajo es escuchar esa historia, entender el momento del negocio y garantizar que la conversación correcta suceda con la persona correcta. Relación no es protocolo — es presencia.',
      'team.anna.sig':     'Responsable de Clientes · BMAI',

      'faq.title': 'Preguntas frecuentes.',
      'faq.1.q':   '¿Cómo funciona?',
      'faq.1.a':   'Primero se realiza una evaluación de tu negocio — procesos, momento y madurez — para validar si existe algo en lo que BMAi puede ayudarte. Necesitamos conocer a fondo el negocio, sus matices y flujos, para diseñar algo que encaje perfectamente para ti. Después, con la solución adecuada definida, comienzan las implementaciones y evoluciones de los agentes — y los primeros resultados ya aparecen. Al final, con todo ajustado y funcionando, acompañas los resultados y trabajas la mejora continua junto con nosotros.',
      'faq.2.q':   '¿Necesito despedir a mis colaboradores?',
      'faq.2.a':   'No. La IA no sustituye a tu equipo, lo potencia. Trabajos repetitivos, burocráticos, procesos complejos y cargados de detalles — es ahí donde la IA entra para aliviarte a ti y a tu equipo. Eso permite reubicar gente buena en funciones estratégicas y tácticas, de mayor valor e impacto en el crecimiento del negocio. La IA existe para servirnos — el error empieza cuando eso se invierte.',
      'faq.3.q':   '¿Necesito conocimiento técnico?',
      'faq.3.a':   'Ninguno. Tú nos cuentas cómo funciona tu operación — y BMAi la transforma en IA. Toda la parte técnica (prompts, integraciones, infraestructura, deploy, ajustes) queda con el equipo BMAi. Tu trabajo es validar qué tiene sentido para tu negocio. Es como contratar a un director operacional que también es ingeniero — sin tener que serlo tú.',
      'faq.4.q':   'No sé si funciona en mi sector',
      'faq.4.a':   'Ya validamos soluciones en sectores muy distintos. Lo que realmente importa es el proceso: si está bien definido y sabes lo que hay que hacer, es más fácil aplicar IA. Nuestro trabajo empieza justo ahí — mapeando y estructurando antes de construir cualquier inteligencia.',
      'faq.5.q':   'En mi nicho la IA no convierte, tiene que ser humanizado',
      'faq.5.a':   'La IA realmente no hace todo por sí sola — pero nuestros agentes son entrenados con el tono de tu empresa, el lenguaje de tu cliente y los matices específicos de tu público. Conseguimos ese encaje porque estudiamos bien el proceso y el perfil del consumidor — entonces lo que el agente dice es exactamente lo que el cliente quiere oír.',
      'faq.6.q':   '¿Cuánto cuesta?',
      'faq.6.a':   'No trabajamos con tabla. Cada proyecto se cotiza con base en el diagnóstico real: alcance de la operación, número de frentes que la IA va a atender, nivel de integración con los sistemas que ya usas y complejidad de los flujos. Durante todo el proceso, nuestro equipo te receta una solución que encaje en tu negocio en todos los ámbitos — del operacional al financiero.',
      'faq.7.q':   '¿Cuánto tiempo lleva todo esto?',
      'faq.7.a':   'Cada solución es única y tiene sus propios matices — eso se alinea antes, durante y después de la implementación. En promedio, para proyectos de complejidad media, entre 5 y 35 días la solución ya está 100% activa.',
      'faq.8.q':   '¿Qué pasa después de la implementación?',
      'faq.8.a':   'Nuestro equipo hace mejoras y mantenimiento constantes para que la solución siga funcionando bien y evolucionando. Tienes acceso directo al soporte para ajustar métricas y resolver lo que necesites — la asociación no termina en el deploy, empieza ahí.',

      'form.tag':     'Hablar con el equipo BMAi',
      'form.title':   '¿Listo para estructurar<br><span style="color:var(--orange)">tu negocio de verdad?</span>',
      'form.lead':    'Completa el formulario. El equipo BMAi se pondrá en contacto en hasta 24h para entender el momento de tu empresa.',
      'form.b1':      'Diagnóstico real de tu proceso comercial',
      'form.b2':      'Identificación de los principales cuellos de botella operacionales',
      'form.b3':      'Propuesta con método y cronograma en hasta 48h',
      'form.b4':      'Sin spam. Sin bots. Una conversación real.',
      'form.p_nome':  'Nombre completo',
      'form.p_emp':   'Nombre de la empresa',
      'form.p_mail':  'Correo corporativo',
      'form.p_tel':   'Teléfono / WhatsApp',
      'form.p_cargo': 'Cargo',
      'form.p_seg':   'Sector',
      'form.p_col':   'Número de colaboradores',
      'form.submit':  'Enviar al equipo BMAi',
      'form.disclaim':'Al enviar, el equipo BMAi se pondrá en contacto contigo.',
      'form.fb_ok':   '¡Recibido! El equipo BMAi se pondrá en contacto en hasta 24h.',
      'form.fb_err':  'No pudimos enviar ahora. Intenta nuevamente en un momento o escribe al equipo BMAi por WhatsApp.',
      'form.fb_wall': 'Completa el campo destacado para enviar.',
      'form.fb_walm': 'Completa los %n campos destacados para enviar.',
      'form.fb_mail': 'Verifica el correo y los campos destacados.',

      'cta.title': 'Crecer sin eficiencia es crecer con <span style="color:var(--orange)">fecha de vencimiento.</span>',
      'cta.sub':   '¿Hasta cuándo vas a seguir postergando la escala de tu negocio?',
      'cta.btn':   'Hablar con el equipo BMAi',

      'footer.kind':    'Ingeniería de inteligencia aplicada.',
      'footer.h_site':  'Sitio',
      'footer.h_ctc':   'Contacto',
      'footer.l_quem':  'Quiénes somos',
      'footer.l_met':   'Método DEIA',
      'footer.l_cases': 'Casos',
      'footer.l_team':  'Equipo',
      'footer.l_faq':   'FAQ',
      'footer.copy':    '© <span id="footerYear">2026</span> BMAi · Todos los derechos reservados',
      'footer.backtop': 'Volver arriba'
    }
  };

  const I18N = {
    lang: 'pt',
    dict: DICT,

    t(key) {
      return (DICT[this.lang] || DICT.pt)[key] ?? DICT.pt[key] ?? key;
    },

    apply() {
      document.documentElement.lang = this.t('html.lang');

      // Elementos com data-i18n → innerHTML
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = this.t(key);
        if (val !== undefined) el.innerHTML = val;
      });

      // Atributos via data-i18n-attr="attr:key[,attr:key]"
      document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        el.getAttribute('data-i18n-attr').split(',').forEach(pair => {
          const [attr, key] = pair.trim().split(':');
          const val = this.t(key);
          if (val !== undefined) el.setAttribute(attr, val);
        });
      });

      // Restaura ano dinâmico no footer (innerHTML pode ter resetado o span)
      const y = document.getElementById('footerYear');
      if (y) y.textContent = new Date().getFullYear();

      // Notifica outros módulos (ARIA_DATA, FAQ etc se precisar)
      window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: this.lang } }));
    },

    set(lang) {
      if (!DICT[lang]) return;
      this.lang = lang;
      try { localStorage.setItem('bmai-lang', lang); } catch (e) {}
      this.apply();
    },

    init() {
      let stored = null;
      try { stored = localStorage.getItem('bmai-lang'); } catch (e) {}
      let lang = stored;
      if (!lang || !DICT[lang]) {
        const nav = (navigator.language || 'pt').slice(0, 2).toLowerCase();
        lang = DICT[nav] ? nav : 'pt';
      }
      this.lang = lang;
      this.apply();
    }
  };

  window.I18N = I18N;
  // Inicializa assim que DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18N.init());
  } else {
    I18N.init();
  }
})();
