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
      'nav.cta':       'Falar com a Anna',

      /* HERO */
      'hero.badge':   '+10.000 horas economizadas com IA',
      'hero.title':   '<span class="h-line">IA não precisa ser complicada,</span><span class="h-line">mas precisa dar <span class="hero-resultado">resultado</span></span>',
      'hero.sub':     'DEVOLVEMOS O CONTROLE DO NEGÓCIO AO EMPREENDEDOR QUE DEIXA DE OPERAR NO IMPROVISO<br>E PASSA A TOMAR DECISÕES BASEADO EM DADOS.',
      'hero.cta':     'Falar com a Anna',
      'hero.stat1':   'Projetos realizados',
      'hero.stat2':   'Aumento na conversão do WhatsApp',
      'hero.stat3':   'Dias de implementação média',

      /* QUEM SOMOS */
      'qs.title':     'O processo vem antes.<br><span style="color:var(--orange)">A IA vem depois.</span>',
      'qs.sub':       'Inteligência sobre caos só multiplica o caos. Por isso estruturamos o fluxo do seu negócio primeiro — e só depois construímos a IA, moldada à operação.',
      'qs.card_eyebrow': 'Método · BMAi',
      'qs.card_h3':   'Processo estruturado.<br><span style="color:var(--orange)">IA sob medida.</span>',
      'qs.card_p':    'Antes da tecnologia, organizamos o fluxo do seu negócio pra criar um terreno eficiente pra IA potencializar. Depois construímos a Inteligência sob medida pra função específica de cada operação — nada de solução genérica. A IA é moldada ao processo, não o contrário.',
      'qs.brand_tag': 'integrando IA…',

      /* MÉTODO */
      'metodo.title': 'Do diagnóstico<br><span style="color:var(--orange)">à escala real.</span>',
      'metodo.sub':   'Enxergamos o seu negócio como ele realmente é — único. 4 fases sequenciais, cada uma construindo sobre a anterior. Nenhum passo é pulado.',

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
      'faq.1.q':   'Vou precisar demitir minha equipe?',
      'faq.1.a':   'Não. A IA não substitui seu time — ela potencializa. Tira de cima dele o que é repetitivo, burocrático e trava resultado: responder as mesmas dúvidas, preencher planilha, atualizar CRM, dar follow-up. Com isso, o seu atendente vende, o seu gestor decide e o seu dono volta a pensar no negócio. A gente já viu equipes pequenas performarem como equipes 3x maiores depois da implementação.',
      'faq.2.q':   'Preciso ter conhecimento técnico?',
      'faq.2.a':   'Zero. Você nos conta como funciona a sua operação — nós traduzimos para IA. Toda parte técnica (prompt, integrações, infra, deploy, ajustes) fica com a BMAi. Seu trabalho é validar o que faz sentido para o seu negócio. É como contratar um diretor operacional que também é engenheiro — sem precisar ser um.',
      'faq.3.q':   'Funciona para o meu segmento?',
      'faq.3.a':   'Se o seu negócio tem atendimento, vendas, gestão de equipe ou processo repetitivo — funciona. Já rodamos em saúde, material de construção, restaurante, marketing, serviços, indústria. A diferença é que não aplicamos "solução de prateleira" — a análise é feita no seu contexto específico antes de qualquer ferramenta entrar em cena.',
      'faq.4.q':   'E se as interações parecerem artificiais?',
      'faq.4.a':   'Esse é o medo legítimo de todo empresário — e o primeiro problema que a gente resolve. Nossos agentes são treinados com o tom da sua empresa, a linguagem do seu cliente e as nuances do seu processo. Fazemos testes em produção antes de liberar e ajustamos até o ponto em que o cliente não perceba a diferença. Se parecer robô, a culpa é nossa — e a gente refaz.',
      'faq.5.q':   'Não sei se é o momento certo para isso...',
      'faq.5.a':   'Se o seu time está saturado, se você perde lead por falta de follow-up, se decisões demoram por falta de dado ou se você ainda responde WhatsApp às 22h — o momento é agora. Postergar implementação de IA é o custo invisível mais caro de 2026: seu concorrente já começou. Começamos pelo diagnóstico e você decide se faz sentido avançar.',
      'faq.6.q':   'Quanto custa?',
      'faq.6.a':   'Não trabalhamos com tabela. Cada projeto é precificado com base no diagnóstico real: escopo da operação, número de frentes que a IA vai atender, nível de integração com os sistemas que você já usa e complexidade dos fluxos. Solução sob medida não cabe em pacote fechado — e é exatamente por isso que o ROI aparece no primeiro mês. No diagnóstico inicial você sai com um orçamento claro e um mapa do que muda na sua operação.',
      'faq.7.q':   'Quanto tempo leva para estar funcionando?',
      'faq.7.a':   'Entre 20 e 35 dias em média, dependendo do escopo. Análise leva 1-2 semanas, implementação 3-6 semanas. Por ser análise bem feita, o ROI aparece no primeiro mês — não é milagre, é personalização somada a método. Cronograma preciso é entregue na fase de Análise, com marcos semanais.',
      'faq.8.q':   'E o suporte depois da implementação?',
      'faq.8.a':   'Se a gente construiu, a gente mantém. Não te deixamos desamparado. O "A" final do AIRA é Acompanhamento: monitoramos os indicadores, ajustamos prompt e lógica conforme seu negócio evolui e te damos acesso ao nosso SaaS interno de acompanhamento de métricas. Cliente BMAi vira parceiro — não só mais um.',

      /* FORM */
      'form.tag':     'Fale com a Anna',
      'form.title':   'Pronto para estruturar<br><span style="color:var(--orange)">seu negócio de verdade?</span>',
      'form.lead':    'Preencha o formulário. A Anna entra em contato em até 24h para entender o momento da sua empresa.',
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
      'form.submit':  'Enviar para Anna',
      'form.disclaim':'Ao enviar, a Anna entrará em contato com você.',
      'form.fb_ok':   'Recebido! A Anna vai entrar em contato em até 24h.',
      'form.fb_err':  'Não conseguimos enviar agora. Tente novamente em instantes ou chame a Anna no WhatsApp.',
      'form.fb_wall': 'Preencha o campo destacado para enviar.',
      'form.fb_walm': 'Preencha os %n campos destacados para enviar.',
      'form.fb_mail': 'Verifique o e-mail e os campos destacados.',

      /* CTA FINAL */
      'cta.title': 'Crescer sem eficiência é crescer com <span style="color:var(--orange)">prazo de validade.</span>',
      'cta.sub':   'Até quando você vai continuar postergando a escala do seu negócio?',
      'cta.btn':   'Fale com a Anna',

      /* FOOTER */
      'footer.kind':    'Engenharia de inteligência aplicada.',
      'footer.h_site':  'Site',
      'footer.h_ctc':   'Contato',
      'footer.l_quem':  'Quem somos',
      'footer.l_met':   'Método AIRA',
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
      'nav.cta':    'Chat with Anna',

      'hero.badge': '+10,000 hours saved with AI',
      'hero.title': '<span class="h-line">AI doesn\'t have to be complicated,</span><span class="h-line">it just has to deliver <span class="hero-resultado">results</span></span>',
      'hero.sub':   'WE GIVE CONTROL OF THE BUSINESS BACK TO THE OWNER WHO STOPS OPERATING ON GUESSWORK<br>AND STARTS MAKING DECISIONS BASED ON DATA.',
      'hero.cta':   'Chat with Anna',
      'hero.stat1': 'Projects delivered',
      'hero.stat2': 'Increase in WhatsApp conversion',
      'hero.stat3': 'Average implementation days',

      'qs.title':     'Process comes first.<br><span style="color:var(--orange)">AI comes second.</span>',
      'qs.sub':       'Intelligence on top of chaos only multiplies chaos. That\'s why we structure your business flow first — and only then build the AI, shaped to the operation.',
      'qs.card_eyebrow': 'Method · BMAi',
      'qs.card_h3':   'Structured process.<br><span style="color:var(--orange)">Tailored AI.</span>',
      'qs.card_p':    'Before the technology, we organize your business flow to create fertile ground for AI to amplify. Then we build Intelligence tailored to the specific function of each operation — no off-the-shelf solutions. The AI adapts to the process, not the other way around.',
      'qs.brand_tag': 'integrating AI…',

      'metodo.title': 'From diagnosis<br><span style="color:var(--orange)">to real scale.</span>',
      'metodo.sub':   'We see your business for what it really is — unique. 4 sequential phases, each building on the last. No step is skipped.',

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
      'faq.1.q':   'Will I have to lay off my team?',
      'faq.1.a':   'No. AI doesn\'t replace your team — it amplifies it. It takes off their plate the repetitive, bureaucratic work that blocks results: answering the same questions, filling spreadsheets, updating CRM, doing follow-up. With that, your agent sells, your manager decides, and your owner gets back to thinking about the business. We\'ve seen small teams perform like 3× larger teams after implementation.',
      'faq.2.q':   'Do I need technical knowledge?',
      'faq.2.a':   'Zero. You tell us how your operation works — we translate to AI. All the technical work (prompt, integrations, infra, deploy, tuning) stays with BMAi. Your job is to validate what makes sense for your business. It\'s like hiring an operations director who\'s also an engineer — without having to be one.',
      'faq.3.q':   'Does it work for my industry?',
      'faq.3.a':   'If your business has customer service, sales, team management or any repetitive process — it works. We\'ve run it in healthcare, construction materials, restaurants, marketing, services, industry. The difference is we don\'t apply "shelf solutions" — the analysis happens inside your specific context before any tool enters the picture.',
      'faq.4.q':   'What if the interactions feel artificial?',
      'faq.4.a':   'That\'s the legitimate fear of every business owner — and the first problem we solve. Our agents are trained on your company\'s tone, your customer\'s language and the nuances of your process. We run tests in production before going live and tune until the customer can\'t tell the difference. If it sounds like a robot, that\'s on us — and we rebuild.',
      'faq.5.q':   'Not sure it\'s the right moment for this…',
      'faq.5.a':   'If your team is saturated, if you lose leads to missed follow-up, if decisions stall for lack of data or if you\'re still answering WhatsApp at 10pm — the moment is now. Delaying AI implementation is the most expensive invisible cost of 2026: your competitor already started. We begin with the diagnosis and you decide whether to move forward.',
      'faq.6.q':   'How much does it cost?',
      'faq.6.a':   'We don\'t work with a pricing table. Each project is priced based on the real diagnosis: scope of the operation, number of fronts the AI will handle, level of integration with the tools you already use, and complexity of flows. A tailored solution doesn\'t fit inside a fixed package — and that\'s exactly why ROI shows up in the first month. In the initial diagnosis you leave with a clear estimate and a map of what changes in your operation.',
      'faq.7.q':   'How long until it\'s running?',
      'faq.7.a':   '20 to 35 days on average, depending on scope. Analysis takes 1-2 weeks, implementation 3-6 weeks. Because the analysis is done right, ROI shows up in the first month — not magic, just personalization plus method. Precise timeline is delivered in the Analysis phase, with weekly milestones.',
      'faq.8.q':   'What about support after implementation?',
      'faq.8.a':   'If we built it, we maintain it. We don\'t leave you stranded. The final "A" in AIRA is Accompaniment: we monitor indicators, tune prompt and logic as your business evolves, and give you access to our internal SaaS for metric tracking. BMAi clients become partners — not just another account.',

      'form.tag':     'Chat with Anna',
      'form.title':   'Ready to truly structure<br><span style="color:var(--orange)">your business?</span>',
      'form.lead':    'Fill out the form. Anna will reach out within 24h to understand where your company stands.',
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
      'form.submit':  'Send to Anna',
      'form.disclaim':'By submitting, Anna will reach out to you.',
      'form.fb_ok':   'Got it! Anna will be in touch within 24h.',
      'form.fb_err':  'We couldn\'t send right now. Try again in a moment or reach Anna on WhatsApp.',
      'form.fb_wall': 'Please fill the highlighted field to send.',
      'form.fb_walm': 'Please fill the %n highlighted fields to send.',
      'form.fb_mail': 'Check the email and the highlighted fields.',

      'cta.title': 'Growing without efficiency is growing with <span style="color:var(--orange)">an expiration date.</span>',
      'cta.sub':   'How much longer will you keep postponing scale?',
      'cta.btn':   'Chat with Anna',

      'footer.kind':    'Applied intelligence engineering.',
      'footer.h_site':  'Site',
      'footer.h_ctc':   'Contact',
      'footer.l_quem':  'About',
      'footer.l_met':   'AIRA Method',
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
      'nav.cta':    'Hablar con Anna',

      'hero.badge': '+10.000 horas ahorradas con IA',
      'hero.title': '<span class="h-line">La IA no necesita ser complicada,</span><span class="h-line">pero necesita entregar <span class="hero-resultado">resultados</span></span>',
      'hero.sub':   'DEVOLVEMOS EL CONTROL DEL NEGOCIO AL EMPRENDEDOR QUE DEJA DE OPERAR POR INTUICIÓN<br>Y PASA A TOMAR DECISIONES BASADAS EN DATOS.',
      'hero.cta':   'Hablar con Anna',
      'hero.stat1': 'Proyectos entregados',
      'hero.stat2': 'Aumento en conversión de WhatsApp',
      'hero.stat3': 'Días promedio de implementación',

      'qs.title':     'El proceso viene primero.<br><span style="color:var(--orange)">La IA viene después.</span>',
      'qs.sub':       'Inteligencia sobre caos solo multiplica el caos. Por eso estructuramos el flujo de tu negocio primero — y solo después construimos la IA, moldeada a la operación.',
      'qs.card_eyebrow': 'Método · BMAi',
      'qs.card_h3':   'Proceso estructurado.<br><span style="color:var(--orange)">IA a medida.</span>',
      'qs.card_p':    'Antes de la tecnología, organizamos el flujo de tu negocio para crear un terreno eficiente donde la IA potencie. Después construimos la Inteligencia a medida para la función específica de cada operación — nada de solución genérica. La IA se adapta al proceso, no al revés.',
      'qs.brand_tag': 'integrando IA…',

      'metodo.title': 'Del diagnóstico<br><span style="color:var(--orange)">a la escala real.</span>',
      'metodo.sub':   'Vemos tu negocio como realmente es — único. 4 fases secuenciales, cada una construyendo sobre la anterior. Ningún paso se salta.',

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
      'faq.1.q':   '¿Tendré que despedir a mi equipo?',
      'faq.1.a':   'No. La IA no reemplaza a tu equipo — lo potencia. Le quita de encima lo repetitivo, burocrático y que traba el resultado: responder las mismas dudas, llenar planillas, actualizar CRM, hacer follow-up. Con eso, tu atendedor vende, tu gerente decide y tu dueño vuelve a pensar en el negocio. Ya vimos equipos pequeños desempeñándose como equipos 3× más grandes después de la implementación.',
      'faq.2.q':   '¿Necesito conocimiento técnico?',
      'faq.2.a':   'Cero. Nos cuentas cómo funciona tu operación — nosotros traducimos a IA. Toda la parte técnica (prompt, integraciones, infra, deploy, ajustes) queda con BMAi. Tu trabajo es validar lo que tiene sentido para tu negocio. Es como contratar un director operacional que también es ingeniero — sin tener que serlo.',
      'faq.3.q':   '¿Funciona para mi rubro?',
      'faq.3.a':   'Si tu negocio tiene atención, ventas, gestión de equipo o proceso repetitivo — funciona. Ya lo hemos corrido en salud, materiales de construcción, restaurantes, marketing, servicios, industria. La diferencia es que no aplicamos "solución de estantería" — el análisis se hace dentro de tu contexto específico antes de que cualquier herramienta entre en escena.',
      'faq.4.q':   '¿Y si las interacciones parecen artificiales?',
      'faq.4.a':   'Ese es el miedo legítimo de todo empresario — y el primer problema que resolvemos. Nuestros agentes se entrenan con el tono de tu empresa, el lenguaje de tu cliente y los matices de tu proceso. Hacemos pruebas en producción antes de liberar y ajustamos hasta que el cliente no perciba la diferencia. Si suena a robot, la culpa es nuestra — y rehacemos.',
      'faq.5.q':   'No sé si es el momento correcto…',
      'faq.5.a':   'Si tu equipo está saturado, si pierdes leads por falta de follow-up, si las decisiones demoran por falta de datos o si todavía respondes WhatsApp a las 22h — el momento es ahora. Posponer la implementación de IA es el costo invisible más caro de 2026: tu competidor ya empezó. Empezamos por el diagnóstico y tú decides si tiene sentido avanzar.',
      'faq.6.q':   '¿Cuánto cuesta?',
      'faq.6.a':   'No trabajamos con tabla. Cada proyecto se cotiza con base en el diagnóstico real: alcance de la operación, número de frentes que la IA atenderá, nivel de integración con los sistemas que ya usas y complejidad de los flujos. Una solución a medida no cabe en un paquete cerrado — y es exactamente por eso que el ROI aparece en el primer mes. En el diagnóstico inicial sales con un presupuesto claro y un mapa de lo que cambia en tu operación.',
      'faq.7.q':   '¿Cuánto tarda en estar funcionando?',
      'faq.7.a':   'Entre 20 y 35 días en promedio, dependiendo del alcance. Análisis toma 1-2 semanas, implementación 3-6 semanas. Por ser análisis bien hecho, el ROI aparece en el primer mes — no es milagro, es personalización sumada a método. El cronograma preciso se entrega en la fase de Análisis, con hitos semanales.',
      'faq.8.q':   '¿Y el soporte después de la implementación?',
      'faq.8.a':   'Si nosotros lo construimos, nosotros lo mantenemos. No te dejamos desamparado. La "A" final de AIRA es Acompañamiento: monitoreamos los indicadores, ajustamos prompt y lógica conforme tu negocio evoluciona y te damos acceso a nuestro SaaS interno de seguimiento de métricas. Cliente BMAi se vuelve socio — no solo un cliente más.',

      'form.tag':     'Hablar con Anna',
      'form.title':   '¿Listo para estructurar<br><span style="color:var(--orange)">tu negocio de verdad?</span>',
      'form.lead':    'Completa el formulario. Anna se pondrá en contacto en hasta 24h para entender el momento de tu empresa.',
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
      'form.submit':  'Enviar a Anna',
      'form.disclaim':'Al enviar, Anna se pondrá en contacto contigo.',
      'form.fb_ok':   '¡Recibido! Anna se pondrá en contacto en hasta 24h.',
      'form.fb_err':  'No pudimos enviar ahora. Intenta nuevamente en un momento o escribe a Anna por WhatsApp.',
      'form.fb_wall': 'Completa el campo destacado para enviar.',
      'form.fb_walm': 'Completa los %n campos destacados para enviar.',
      'form.fb_mail': 'Verifica el correo y los campos destacados.',

      'cta.title': 'Crecer sin eficiencia es crecer con <span style="color:var(--orange)">fecha de vencimiento.</span>',
      'cta.sub':   '¿Hasta cuándo vas a seguir postergando la escala de tu negocio?',
      'cta.btn':   'Hablar con Anna',

      'footer.kind':    'Ingeniería de inteligencia aplicada.',
      'footer.h_site':  'Sitio',
      'footer.h_ctc':   'Contacto',
      'footer.l_quem':  'Quiénes somos',
      'footer.l_met':   'Método AIRA',
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
