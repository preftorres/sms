/**
 * ============================================================================
 * PREFEITURA DE TORRES - SECRETARIA DA SAÚDE
 * Portal de Acessos & Módulo de Auditoria Contratual
 * ============================================================================
 */

const CONFIG = {
  pass: 'admin123',
  keys: {
    links: 'torres_links_v6',
    contract: 'torres_contract_info_v1',
    exams: 'torres_exams_audit_v1',
    adminLogged: 'torres_is_admin_v1'
  }
};

// LINKS PADRÃO EXATOS DO SEU ARQUIVO ORIGINAL
const INITIAL_LINKS = [
  { id: 1, title: 'Vacinas', url: 'http://vaciastorres.dpdns.org', desc: 'Controle de Imunização' },
  { id: 2, title: 'ETP/TR', url: 'https://etp-tr.torres.rs.gov.br/', desc: 'Termos de Referência' },
  { id: 3, title: 'Betha Cloud', url: 'http://betha.cloud/', desc: 'Sistemas ERP' },
  { id: 4, title: '1Doc', url: 'http://torres.1doc.com.br/', desc: 'Processos Digitais' },
  { id: 5, title: 'Webmail', url: 'http://webmail.torres.rs.gov.br/', desc: 'E-mail Institucional' }
];

// INFORMAÇÕES CONTRATUAIS PADRÃO
const INITIAL_CONTRACT = {
  num: '67/2026',
  empenhos: '3406/2026 e 3407/2026',
  prestador: 'M. B. Laboratório de Análises Clínicas Ltda'
};

// EXAMES OFICIAIS DOS EMPENHOS 3406 E 3407/2026 + IMAGEM
const INITIAL_EXAMS = [
  { id: 1, item: 1, cat: 'Laboratorial', descEmpenho: 'ÁCIDO FÓLICO', descPrestador: '02.02.01.002-3 / DOSAGEM DE ACIDO FOLICO', qtdEmpenho: 150, saldoAnterior: 107, faturado: 11 },
  { id: 6, item: 6, cat: 'Laboratorial', descEmpenho: 'ANÁLISE DE URINA (EQU)', descPrestador: '02.02.05.001-7 / URINÁLISE (EQU / EAS)', qtdEmpenho: 600, saldoAnterior: 44, faturado: 44 },
  { id: 16, item: 16, cat: 'Laboratorial', descEmpenho: 'COLESTEROL HDL', descPrestador: '02.02.01.028-7 / DOSAGEM DE COLESTEROL HDL', qtdEmpenho: 1200, saldoAnterior: 514, faturado: 81 },
  { id: 17, item: 17, cat: 'Laboratorial', descEmpenho: 'COLESTEROL LDL', descPrestador: '02.02.01.029-5 / DOSAGEM DE COLESTEROL LDL', qtdEmpenho: 1200, saldoAnterior: 602, faturado: 160 },
  { id: 19, item: 19, cat: 'Laboratorial', descEmpenho: 'CREATININA', descPrestador: '02.02.01.031-7 / DOSAGEM DE CREATININA', qtdEmpenho: 1200, saldoAnterior: 517, faturado: 178 },
  { id: 27, item: 27, cat: 'Laboratorial', descEmpenho: 'CPK', descPrestador: '02.02.01.032-5 / DOSAGEM DE CREATINOFOSFOQUINASE', qtdEmpenho: 200, saldoAnterior: 194, faturado: 3 },
  { id: 34, item: 34, cat: 'Laboratorial', descEmpenho: 'FERRO SÉRICO', descPrestador: '02.02.01.039-2 / DOSAGEM DE FERRO SERICO', qtdEmpenho: 200, saldoAnterior: 71, faturado: 28 },
  { id: 38, item: 38, cat: 'Laboratorial', descEmpenho: 'GLICOSE', descPrestador: '02.02.01.047-3 / DOSAGEM DE GLICOSE', qtdEmpenho: 800, saldoAnterior: 109, faturado: 109 },
  { id: 41, item: 41, cat: 'Laboratorial', descEmpenho: 'HEMOGRAMA COMPLETO', descPrestador: '02.02.02.038-0 / HEMOGRAMA COM CONTAGEM', qtdEmpenho: 2000, saldoAnterior: 1213, faturado: 194 },
  { id: 49, item: 49, cat: 'Laboratorial', descEmpenho: 'PCR PROTEÍNA C REATIVA', descPrestador: '02.02.03.076-8 / PROTEINA C REATIVA', qtdEmpenho: 100, saldoAnterior: 14, faturado: 14 },
  { id: 56, item: 56, cat: 'Laboratorial', descEmpenho: 'PSA TOTAL', descPrestador: '02.02.03.010-5 / DOSAGEM DE PSA TOTAL', qtdEmpenho: 600, saldoAnterior: 461, faturado: 33 },
  { id: 58, item: 58, cat: 'Laboratorial', descEmpenho: 'SÓDIO', descPrestador: '02.02.01.063-5 / DOSAGEM DE SODIO', qtdEmpenho: 600, saldoAnterior: 432, faturado: 54 },
  { id: 68, item: 68, cat: 'Laboratorial', descEmpenho: 'TRIGLICERÍDEOS', descPrestador: '02.02.01.067-8 / DOSAGEM DE TRIGLICERIDEOS', qtdEmpenho: 800, saldoAnterior: 114, faturado: 114 },
  { id: 74, item: 74, cat: 'Laboratorial', descEmpenho: 'VSG / VHS', descPrestador: '02.02.02.015-0 / DETERMINACAO DE VHS', qtdEmpenho: 50, saldoAnterior: 23, faturado: 13 },
  // Exames Representativos de Imagem
  { id: 101, item: 101, cat: 'Imagem', descEmpenho: 'RAIO-X DE TÓRAX AP/PERFIL', descPrestador: '02.04.03.018-8 / RADIOGRAFIA TORACICA', qtdEmpenho: 800, saldoAnterior: 320, faturado: 45 },
  { id: 102, item: 102, cat: 'Imagem', descEmpenho: 'ULTRASSONOGRAFIA DE ABDOME TOTAL', descPrestador: '02.05.02.004-6 / ULTRASSONOGRAFIA ABDOMINAL', qtdEmpenho: 500, saldoAnterior: 230, faturado: 50 },
  { id: 103, item: 103, cat: 'Imagem', descEmpenho: 'ELETROCARDIOGRAMA (ECG)', descPrestador: '02.11.02.003-6 / ELETROCARDIOGRAMA', qtdEmpenho: 1000, saldoAnterior: 640, faturado: 0 }
];

const app = {
  state: {
    view: 'landing', // 'landing', 'saude_links', 'auditoria_exames'
    links: [],
    contract: {},
    exams: [],
    isAdmin: false,
    clockTimer: null,
    filters: { search: '', category: 'ALL', hideZero: false }
  },

  init() {
    this.data.load();
    this.admin.checkSession();
    this.router.init();
  },

  data: {
    load() {
      const rawLinks = localStorage.getItem(CONFIG.keys.links);
      app.state.links = rawLinks ? JSON.parse(rawLinks) : JSON.parse(JSON.stringify(INITIAL_LINKS));

      const rawContract = localStorage.getItem(CONFIG.keys.contract);
      app.state.contract = rawContract ? JSON.parse(rawContract) : JSON.parse(JSON.stringify(INITIAL_CONTRACT));

      const rawExams = localStorage.getItem(CONFIG.keys.exams);
      app.state.exams = rawExams ? JSON.parse(rawExams) : JSON.parse(JSON.stringify(INITIAL_EXAMS));
    },

    saveLinks() {
      localStorage.setItem(CONFIG.keys.links, JSON.stringify(app.state.links));
    },

    saveContract() {
      localStorage.setItem(CONFIG.keys.contract, JSON.stringify(app.state.contract));
    },

    saveExams() {
      localStorage.setItem(CONFIG.keys.exams, JSON.stringify(app.state.exams));
    }
  },

  router: {
    init() {
      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();
    },

    handleRoute() {
      let hash = window.location.hash.replace('#', '').trim();
      if (hash === 'saude') hash = 'saude_links';

      const validViews = ['landing', 'saude_links', 'auditoria_exames'];
      const target = validViews.includes(hash) ? hash : 'landing';

      app.state.view = target;
      app.ui.updateActiveMenu(target);
      app.render.all();
    }
  },

  ui: {
    navigate(view) {
      if (view === 'saude') view = 'saude_links';
      window.location.hash = view;
    },

    // Apenas a página selecionada ganha o fundo azul claro
    updateActiveMenu(activeView) {
      const navButtons = [
        { id: 'nav-btn-landing', view: 'landing' },
        { id: 'nav-btn-saude_links', view: 'saude_links' },
        { id: 'nav-btn-auditoria_exames', view: 'auditoria_exames' }
      ];

      navButtons.forEach(btn => {
        const el = document.getElementById(btn.id);
        if (!el) return;

        if (btn.view === activeView) {
          // FUNDO AZUL CLARO NO ITEM ATIVO
          el.className = 'nav-btn px-4 py-2 rounded-xl transition-all bg-blue-100 text-blue-950 font-black shadow-sm';
        } else {
          // PADRÃO TRANSPARENTE NOS DEMAIS
          el.className = 'nav-btn px-4 py-2 rounded-xl transition-all text-white/80 hover:text-white hover:bg-white/10 font-semibold';
        }
      });
    },

    toggleAuthModal(show) {
      const m = document.getElementById('modal-auth');
      m.classList.toggle('hidden', !show);
      m.classList.toggle('flex', show);
      if (show) {
        const inp = document.getElementById('input-pass');
        inp.value = '';
        setTimeout(() => inp.focus(), 60);
      }
    }
  },

  render: {
    all() {
      const vp = document.getElementById('app-viewport');
      if (!vp) return;

      if (app.state.clockTimer) {
        clearInterval(app.state.clockTimer);
        app.state.clockTimer = null;
      }

      if (app.state.view === 'landing') {
        this.landing(vp);
      } else if (app.state.view === 'saude_links') {
        this.saudeLinks(vp);
      } else if (app.state.view === 'auditoria_exames') {
        this.auditoriaExames(vp);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // TELA 1: LANDING PAGE
    landing(el) {
      el.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center p-6 fade-in">
            <!-- LOGO DA PREFEITURA RESTAURADA -->
            <div class="mb-12 text-center">
                <div class="w-32 h-32 md:w-48 md:h-48 bg-white rounded-full shadow-2xl flex items-center justify-center p-4 mb-6 mx-auto border-4 border-slate-100">
                    <img src="torres-rs-logo-300x139.webp" 
                         alt="Prefeitura de Torres" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
                         class="max-w-full h-auto object-contain">
                    <svg class="w-14 h-14 text-blue-800 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h1 class="text-2xl md:text-4xl font-black text-torres-dark uppercase tracking-tight">Prefeitura Municipal de Torres</h1>
                <div class="h-1 w-24 bg-blue-600 mx-auto mt-4 rounded-full"></div>
            </div>

            <!-- CARD DA SECRETARIA -->
            <button onclick="app.ui.navigate('saude_links')" class="card-landing bg-white p-10 rounded-[3rem] shadow-xl flex flex-col items-center max-w-sm w-full group">
                <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <h2 class="text-2xl font-black text-slate-800 mb-2">Secretaria da Saúde</h2>
                <p class="text-slate-400 font-medium text-center">Acesse a central de sistemas, links úteis e auditoria de cotas.</p>
                <div class="mt-8 px-6 py-2.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">Clique para entrar</div>
            </button>
        </div>
      `;
    },

    // TELA 2: PORTAL DE ACESSOS DA SAÚDE
    saudeLinks(el) {
      el.innerHTML = `
        <div class="bg-torres-dark py-8 px-6 shadow-xl">
            <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="app.ui.navigate('landing')" class="p-2 hover:bg-white/10 rounded-full text-white transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h2 class="text-xl font-black text-white leading-none">SECRETARIA DA SAÚDE</h2>
                        <p class="text-blue-400 text-xs font-bold tracking-widest mt-1 uppercase">Portal de Acessos</p>
                    </div>
                </div>
                <div id="clock-display" class="text-right text-white">
                    <p id="clock-time" class="text-xl font-black leading-none font-mono"></p>
                    <p id="clock-date" class="text-[10px] uppercase font-bold text-blue-400 mt-1"></p>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-6 py-10 fade-in">
            
            <!-- CARD DE DESTAQUE: AUDITORIA DE EXAMES -->
            <div class="mb-10 bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div class="max-w-2xl">
                    <span class="inline-block px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider mb-2">
                        Painel de Controle Contratual
                    </span>
                    <h3 class="text-2xl font-black">Auditoria e Gestão de Exames (Empenhos)</h3>
                    <p class="text-blue-200 text-xs sm:text-sm mt-1">
                        Acompanhamento em tempo real de saldos, faturados no período e alertas de esgotamento do Contrato nº ${app.state.contract.num}.
                    </p>
                </div>
                <button onclick="app.ui.navigate('auditoria_exames')" class="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-900 rounded-2xl font-black text-xs shadow-md transition transform hover:-translate-y-0.5 whitespace-nowrap">
                    Abrir Auditoria de Cotas →
                </button>
            </div>

            <!-- GRID COM OS LINKS EXATOS -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${app.state.links.map(l => `
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
                        <div class="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                        </div>
                        <h3 class="font-black text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition">${l.title}</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">${l.desc}</p>
                    </a>
                `).join('')}
            </div>
        </div>
      `;

      this.startClock();
    },

    startClock() {
      const tick = () => {
        const dateEl = document.getElementById('clock-date');
        const timeEl = document.getElementById('clock-time');
        if (!dateEl || !timeEl) return;
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
        timeEl.textContent = now.toLocaleTimeString('pt-BR');
      };
      tick();
      app.state.clockTimer = setInterval(tick, 1000);
    },

    // TELA 3: AUDITORIA E CONTROLE DE COTAS
    auditoriaExames(el) {
      el.innerHTML = `
        <div class="container mx-auto px-4 sm:px-6 py-8 fade-in">
          
          <!-- BANNER CONTRATUAL -->
          <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6 print:border-none print:shadow-none print:p-0">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 uppercase">Prefeitura de Torres / SMS</span>
                  <span class="text-xs text-slate-400 font-bold">Exercício 2026</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Auditoria de Cotas de Exames — Empenho x Execução
                </h2>
                <div class="mt-2 text-xs text-slate-600 flex flex-wrap gap-x-5 gap-y-1">
                  <span><strong>Contrato:</strong> nº ${app.state.contract.num}</span>
                  <span><strong>Empenhos:</strong> ${app.state.contract.empenhos}</span>
                  <span><strong>Credor:</strong> ${app.state.contract.prestador}</span>
                </div>
              </div>

              <!-- BOTÕES DE AÇÃO -->
              <div class="flex flex-wrap items-center gap-2 print:hidden">
                <button onclick="app.audit.exportCSV()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition">
                  Exportar (.CSV)
                </button>
                <button onclick="window.print()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition">
                  Imprimir / PDF
                </button>
                ${app.state.isAdmin ? `
                  <button onclick="app.admin.trigger(true)" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 shadow transition">
                    ✏️ Editar Contrato/Exames
                  </button>
                ` : ''}
                <button onclick="app.audit.resetToDefault()" class="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border transition">
                  Restaurar Padrão
                </button>
              </div>
            </div>
          </div>

          <!-- KPIS DE RESUMO -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Empenhado</span>
              <p id="kpi-empenhado" class="text-2xl font-black text-slate-800 mt-1">0</p>
              <span class="text-[10px] text-slate-400">Cotas originais somadas</span>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faturado no Período</span>
              <p id="kpi-faturado" class="text-2xl font-black text-blue-600 mt-1">0</p>
              <span class="text-[10px] text-slate-400">Total executado</span>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 bg-purple-50/40">
              <span class="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Itens Esgotados</span>
              <p id="kpi-esgotados" class="text-2xl font-black text-purple-700 mt-1">0</p>
              <span class="text-[10px] text-purple-600">Consumo ≥ 100% ou zerado</span>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-red-100 bg-red-50/40">
              <span class="text-[10px] font-bold text-red-900 uppercase tracking-wider">Alerta Crítico (≥ 30%)</span>
              <p id="kpi-criticos" class="text-2xl font-black text-red-700 mt-1">0</p>
              <span class="text-[10px] text-red-600">Consumo acelerado</span>
            </div>
          </div>

          <!-- FILTROS -->
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between gap-4 print:hidden">
            <div class="flex-1 flex flex-col sm:flex-row gap-3">
              <input type="text" id="filter-search" oninput="app.audit.filter()" placeholder="Buscar por código ou descrição..." class="flex-1 px-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-blue-500">
              <select id="filter-cat" onchange="app.audit.filter()" class="sm:w-48 px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-blue-500 font-semibold">
                <option value="ALL">Todas as Categorias</option>
                <option value="Laboratorial">Laboratorial</option>
                <option value="Imagem">Imagem</option>
              </select>
            </div>
            <label class="inline-flex items-center text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input type="checkbox" id="filter-hide-zero" onchange="app.audit.filter()" class="w-4 h-4 rounded text-blue-600 mr-2 border-slate-300">
              Ocultar não faturados no período (Zero)
            </label>
          </div>

          <!-- TABELA COM SCROLL INTERNO E CABEÇALHO FIXO (STICKY) -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="custom-scroll overflow-y-auto max-h-[600px] relative">
              <table id="table-audit" class="w-full text-left border-collapse text-xs">
                <thead class="sticky-thead bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
                  <tr>
                    <th class="py-3 px-3 text-center w-12">Item</th>
                    <th class="py-3 px-3 w-28">Categoria</th>
                    <th class="py-3 px-3 min-w-[200px]">Descrição no Empenho</th>
                    <th class="py-3 px-3 min-w-[200px]">Descrição / Cód. (Prestador)</th>
                    <th class="py-3 px-3 text-right w-24">Qtd. Emp.</th>
                    <th class="py-3 px-3 text-right w-28">Saldo Ant.</th>
                    <th class="py-3 px-3 text-right w-28 bg-blue-50 border-x border-blue-100">Faturado</th>
                    <th class="py-3 px-3 text-right w-24">Saldo Atual</th>
                    <th class="py-3 px-3 text-right w-24">% Cons.</th>
                    <th class="py-3 px-3 text-right w-24">% Rest.</th>
                    <th class="py-3 px-3 text-center w-32">Situação</th>
                  </tr>
                </thead>
                <tbody id="table-audit-body" class="divide-y divide-slate-200 font-medium"></tbody>
              </table>
            </div>
            <div id="table-empty" class="hidden p-8 text-center text-slate-400 text-xs font-medium">
              Nenhum exame encontrado com os filtros informados.
            </div>
          </div>

        </div>
      `;

      app.audit.renderTable();
    }
  },

  audit: {
    calculate(item) {
      const saldoAnt = Number(item.saldoAnterior) || 0;
      const faturado = Number(item.faturado) || 0;
      const saldoAtual = saldoAnt - faturado;

      let percConsumo = 0;
      let percRestante = 0;

      if (saldoAnt > 0) {
        percConsumo = (faturado / saldoAnt) * 100;
        percRestante = (saldoAtual / saldoAnt) * 100;
      } else if (saldoAnt === 0 && faturado > 0) {
        percConsumo = 100;
        percRestante = 0;
      }

      // Regras de Cores Condicionais
      let style = {
        rowClass: 'bg-white hover:bg-slate-50',
        badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        label: 'Seguro'
      };

      if (faturado === 0) {
        style = {
          rowClass: 'bg-slate-50 text-slate-500',
          badgeClass: 'bg-slate-200 text-slate-600 border border-slate-300',
          label: 'Sem Movimento'
        };
      } else if (percConsumo >= 100 || saldoAtual <= 0) {
        style = {
          rowClass: 'bg-purple-100 text-purple-950 font-bold hover:bg-purple-200/70',
          badgeClass: 'bg-purple-200 text-purple-900 border border-purple-400 font-extrabold',
          label: 'Esgotado'
        };
      } else if (percConsumo >= 50) {
        style = {
          rowClass: 'bg-red-50 text-red-950 font-semibold hover:bg-red-100/70',
          badgeClass: 'bg-red-100 text-red-800 border border-red-300 font-bold',
          label: 'Crítico (≥50%)'
        };
      } else if (percConsumo >= 30) {
        style = {
          rowClass: 'bg-yellow-50 text-yellow-950 hover:bg-yellow-100/70',
          badgeClass: 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold',
          label: 'Alerta (≥30%)'
        };
      }

      return { saldoAtual, percConsumo, percRestante, style };
    },

    updateVal(id, field, val) {
      const parsed = Math.max(0, parseInt(val, 10) || 0);
      const target = app.state.exams.find(x => x.id === id);
      if (!target) return;

      target[field] = parsed;
      app.data.saveExams();
      this.renderTable();
    },

    filter() {
      app.state.filters.search = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
      app.state.filters.category = document.getElementById('filter-cat')?.value || 'ALL';
      app.state.filters.hideZero = !!document.getElementById('filter-hide-zero')?.checked;
      this.renderTable();
    },

    renderTable() {
      const tbody = document.getElementById('table-audit-body');
      const empty = document.getElementById('table-empty');
      if (!tbody) return;

      tbody.innerHTML = '';

      let totalEmp = 0;
      let totalFat = 0;
      let countEsg = 0;
      let countCrit = 0;

      const filtered = app.state.exams.filter(item => {
        const c = this.calculate(item);
        totalEmp += Number(item.qtdEmpenho) || 0;
        totalFat += Number(item.faturado) || 0;

        if (c.percConsumo >= 100 || c.saldoAtual <= 0) countEsg++;
        else if (c.percConsumo >= 30) countCrit++;

        const matchesSearch = !app.state.filters.search ||
          item.descEmpenho.toLowerCase().includes(app.state.filters.search) ||
          item.descPrestador.toLowerCase().includes(app.state.filters.search) ||
          String(item.item).includes(app.state.filters.search);

        const matchesCat = app.state.filters.category === 'ALL' || item.cat === app.state.filters.category;
        const matchesZero = !app.state.filters.hideZero || item.faturado > 0;

        return matchesSearch && matchesCat && matchesZero;
      });

      document.getElementById('kpi-empenhado').textContent = totalEmp.toLocaleString('pt-BR');
      document.getElementById('kpi-faturado').textContent = totalFat.toLocaleString('pt-BR');
      document.getElementById('kpi-esgotados').textContent = countEsg;
      document.getElementById('kpi-criticos').textContent = countCrit;

      if (filtered.length === 0) {
        empty.classList.remove('hidden');
      } else {
        empty.classList.add('hidden');
      }

      filtered.forEach(item => {
        const c = this.calculate(item);
        const tr = document.createElement('tr');
        tr.className = `border-b border-slate-200 transition-colors ${c.style.rowClass}`;

        tr.innerHTML = `
          <td class="py-2.5 px-3 text-center font-bold">${item.item}</td>
          <td class="py-2.5 px-3">
            <span class="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
              ${item.cat}
            </span>
          </td>
          <td class="py-2.5 px-3 font-semibold text-slate-900">${item.descEmpenho}</td>
          <td class="py-2.5 px-3 text-slate-600 font-mono text-[11px]">${item.descPrestador}</td>
          <td class="py-2.5 px-3 text-right font-medium text-slate-600">${item.qtdEmpenho.toLocaleString('pt-BR')}</td>
          
          <!-- Saldo Anterior Editável -->
          <td class="py-2.5 px-3 text-right">
            <input type="number" min="0" value="${item.saldoAnterior}" 
                   onchange="app.audit.updateVal(${item.id}, 'saldoAnterior', this.value)"
                   class="table-num w-20 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white shadow-xs focus:border-blue-500 font-semibold">
          </td>

          <!-- Faturado Editável -->
          <td class="py-2.5 px-3 text-right bg-blue-50/70 border-x border-blue-100">
            <input type="number" min="0" value="${item.faturado}" 
                   onchange="app.audit.updateVal(${item.id}, 'faturado', this.value)"
                   class="table-num w-20 text-right px-2 py-1 text-xs border border-blue-300 rounded bg-white shadow-xs focus:border-blue-600 font-bold text-blue-950">
          </td>

          <!-- Saldo Atual Calculado -->
          <td class="py-2.5 px-3 text-right font-bold ${c.saldoAtual <= 0 ? 'text-red-700 font-black' : ''}">
            ${c.saldoAtual.toLocaleString('pt-BR')}
          </td>
          
          <td class="py-2.5 px-3 text-right font-mono font-bold">${c.percConsumo.toFixed(1)}%</td>
          <td class="py-2.5 px-3 text-right font-mono">${c.percRestante.toFixed(1)}%</td>
          
          <td class="py-2.5 px-3 text-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.style.badgeClass}">
              ${c.style.label}
            </span>
          </td>
        `;
        tbody.appendChild(tr);
      });
    },

    resetToDefault() {
      if (confirm("Deseja restaurar todos os exames e contratos para o padrão oficial? Alterações manuais serão perdidas.")) {
        app.state.exams = JSON.parse(JSON.stringify(INITIAL_EXAMS));
        app.state.contract = JSON.parse(JSON.stringify(INITIAL_CONTRACT));
        app.data.saveExams();
        app.data.saveContract();
        app.render.all();
      }
    },

    exportCSV() {
      const headers = ["Item", "Categoria", "Descricao_Empenho", "Descricao_Prestador", "Qtd_Empenhada", "Saldo_Anterior", "Faturado_Periodo", "Saldo_Atual", "Consumo_Perc", "Saldo_Restante_Perc", "Situacao"];
      const rows = app.state.exams.map(i => {
        const c = this.calculate(i);
        return [
          i.item,
          `"${i.cat}"`,
          `"${i.descEmpenho.replace(/"/g, '""')}"`,
          `"${i.descPrestador.replace(/"/g, '""')}"`,
          i.qtdEmpenho,
          i.saldoAnterior,
          i.faturado,
          c.saldoAtual,
          `"${c.percConsumo.toFixed(2)}%"`,
          `"${c.percRestante.toFixed(2)}%"`,
          `"${c.style.label}"`
        ].join(";");
      });

      const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Auditoria_Exames_Torres_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  },

  admin: {
    checkSession() {
      app.state.isAdmin = localStorage.getItem(CONFIG.keys.adminLogged) === 'true';
    },

    trigger(directToContract = false) {
      if (app.state.isAdmin) {
        this.openPanel(directToContract);
      } else {
        app.ui.toggleAuthModal(true);
      }
    },

    verify() {
      const input = document.getElementById('input-pass');
      if (input.value === CONFIG.pass) {
        app.state.isAdmin = true;
        localStorage.setItem(CONFIG.keys.adminLogged, 'true');
        app.ui.toggleAuthModal(false);
        this.openPanel();
      } else {
        alert("Senha Inválida!");
      }
      input.value = '';
    },

    logout() {
      app.state.isAdmin = false;
      localStorage.removeItem(CONFIG.keys.adminLogged);
      this.exit();
      alert("Sessão administrativa finalizada.");
    },

    openPanel(directToContract = false) {
      document.getElementById('admin-panel').classList.remove('hidden');
      if (directToContract) {
        this.switchTab('contrato');
      } else {
        this.switchTab('links');
      }
      this.renderLinksList();
      this.loadContractFields();
      this.renderExamsList();
    },

    exit() {
      document.getElementById('admin-panel').classList.add('hidden');
      app.render.all();
    },

    switchTab(tab) {
      const viewLinks = document.getElementById('admin-view-links');
      const viewContrato = document.getElementById('admin-view-contrato');
      const btnLinks = document.getElementById('admin-tab-btn-links');
      const btnContrato = document.getElementById('admin-tab-btn-contrato');

      if (tab === 'links') {
        viewLinks.classList.remove('hidden');
        viewContrato.classList.add('hidden');
        btnLinks.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600";
        btnContrato.className = "px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600";
      } else {
        viewLinks.classList.add('hidden');
        viewContrato.classList.remove('hidden');
        btnContrato.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600";
        btnLinks.className = "px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600";
      }
    },

    // --- Gestão de Links & Drag & Drop ---
    renderLinksList() {
      const list = document.getElementById('admin-list-draggable');
      if (!list) return;

      list.innerHTML = app.state.links.map((l, index) => `
        <div draggable="true" data-id="${l.id}" data-index="${index}" class="admin-item bg-white border p-4 rounded-2xl flex items-center gap-4 transition hover:border-blue-400">
            <div class="cursor-grab text-slate-300 hover:text-slate-600">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10h10v2H7zm0-4h10v2H7zm0 8h10v2H7z"/></svg>
            </div>
            <div class="flex-grow cursor-pointer" onclick="app.admin.editLink(${l.id})">
                <span class="block font-bold text-slate-800 text-sm">${l.title}</span>
                <span class="block text-xs text-slate-400 truncate max-w-md">${l.url}</span>
            </div>
            <button onclick="app.admin.removeLink(${l.id})" class="text-red-300 hover:text-red-500 p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
        </div>
      `).join('');

      this.setupDragEvents();
    },

    setupDragEvents() {
      const items = document.querySelectorAll('.admin-item');
      let startIndex;
      items.forEach(item => {
        item.addEventListener('dragstart', () => {
          startIndex = +item.dataset.index;
          item.classList.add('dragging');
        });
        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          item.classList.add('drag-over');
        });
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.addEventListener('drop', () => {
          const endIndex = +item.dataset.index;
          const moving = app.state.links.splice(startIndex, 1)[0];
          app.state.links.splice(endIndex, 0, moving);
          app.data.saveLinks();
          app.admin.renderLinksList();
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
      });
    },

    saveLink() {
      const id = document.getElementById('edit-id').value;
      const title = document.getElementById('field-title').value.trim();
      const url = document.getElementById('field-url').value.trim();
      const desc = document.getElementById('field-desc').value.trim();
      if (!title || !url) return;

      if (id) {
        const idx = app.state.links.findIndex(l => l.id == id);
        if (idx !== -1) app.state.links[idx] = { ...app.state.links[idx], title, url, desc };
      } else {
        app.state.links.push({ id: Date.now(), title, url, desc });
      }

      app.data.saveLinks();
      this.resetForm();
      this.renderLinksList();
    },

    editLink(id) {
      const l = app.state.links.find(x => x.id == id);
      if (!l) return;
      document.getElementById('edit-id').value = l.id;
      document.getElementById('field-title').value = l.title;
      document.getElementById('field-url').value = l.url;
      document.getElementById('field-desc').value = l.desc || '';
      document.getElementById('form-title-label').textContent = "Editando Link";
      document.getElementById('btn-save').textContent = "Atualizar";
      document.getElementById('btn-cancel-edit').classList.remove('hidden');
    },

    resetForm() {
      document.getElementById('edit-id').value = "";
      document.getElementById('field-title').value = "";
      document.getElementById('field-url').value = "";
      document.getElementById('field-desc').value = "";
      document.getElementById('form-title-label').textContent = "Novo Atalho";
      document.getElementById('btn-save').textContent = "Salvar Sistema";
      document.getElementById('btn-cancel-edit').classList.add('hidden');
    },

    removeLink(id) {
      if (confirm("Excluir atalho?")) {
        app.state.links = app.state.links.filter(l => l.id !== id);
        app.data.saveLinks();
        this.renderLinksList();
      }
    },

    // --- Gestão de Contrato & Exames ---
    loadContractFields() {
      document.getElementById('adm-contract-num').value = app.state.contract.num;
      document.getElementById('adm-contract-empenhos').value = app.state.contract.empenhos;
      document.getElementById('adm-contract-prestador').value = app.state.contract.prestador;
    },

    saveContractInfo() {
      app.state.contract.num = document.getElementById('adm-contract-num').value.trim();
      app.state.contract.empenhos = document.getElementById('adm-contract-empenhos').value.trim();
      app.state.contract.prestador = document.getElementById('adm-contract-prestador').value.trim();
      app.data.saveContract();
      alert("Informações do contrato salvas com sucesso!");
    },

    renderExamsList() {
      const tbody = document.getElementById('adm-exams-list-tbody');
      if (!tbody) return;

      tbody.innerHTML = app.state.exams.map(e => `
        <tr class="hover:bg-slate-50">
          <td class="p-3 text-center font-bold">${e.item}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold">${e.cat}</span></td>
          <td class="p-3 font-semibold text-slate-800">${e.descEmpenho}</td>
          <td class="p-3 text-right">${e.qtdEmpenho}</td>
          <td class="p-3 text-right">${e.saldoAnterior}</td>
          <td class="p-3 text-center">
            <button onclick="app.admin.editExam(${e.id})" class="text-blue-600 hover:text-blue-800 font-bold mr-2">Editar</button>
            <button onclick="app.admin.removeExam(${e.id})" class="text-red-500 hover:text-red-700 font-bold">Excluir</button>
          </td>
        </tr>
      `).join('');
    },

    saveExam() {
      const id = document.getElementById('adm-exam-id').value;
      const item = parseInt(document.getElementById('adm-exam-item').value, 10);
      const cat = document.getElementById('adm-exam-cat').value;
      const descEmpenho = document.getElementById('adm-exam-desc-emp').value.trim();
      const descPrestador = document.getElementById('adm-exam-desc-prest').value.trim();
      const qtdEmpenho = parseInt(document.getElementById('adm-exam-qtd').value, 10) || 0;
      const saldoAnterior = parseInt(document.getElementById('adm-exam-saldo-ant').value, 10) || 0;

      if (!item || !descEmpenho) {
        alert("Preencha ao menos o número do item e a descrição do empenho.");
        return;
      }

      if (id) {
        const idx = app.state.exams.findIndex(x => x.id == id);
        if (idx !== -1) {
          app.state.exams[idx] = {
            ...app.state.exams[idx],
            item,
            cat,
            descEmpenho,
            descPrestador: descPrestador || descEmpenho,
            qtdEmpenho,
            saldoAnterior
          };
        }
      } else {
        app.state.exams.push({
          id: Date.now(),
          item,
          cat,
          descEmpenho,
          descPrestador: descPrestador || descEmpenho,
          qtdEmpenho,
          saldoAnterior,
          faturado: 0
        });
      }

      app.state.exams.sort((a, b) => a.item - b.item);
      app.data.saveExams();
      this.resetExamForm();
      this.renderExamsList();
    },

    editExam(id) {
      const e = app.state.exams.find(x => x.id == id);
      if (!e) return;
      document.getElementById('adm-exam-id').value = e.id;
      document.getElementById('adm-exam-item').value = e.item;
      document.getElementById('adm-exam-cat').value = e.cat;
      document.getElementById('adm-exam-desc-emp').value = e.descEmpenho;
      document.getElementById('adm-exam-desc-prest').value = e.descPrestador;
      document.getElementById('adm-exam-qtd').value = e.qtdEmpenho;
      document.getElementById('adm-exam-saldo-ant').value = e.saldoAnterior;

      document.getElementById('adm-exam-form-title').textContent = `Editando Item ${e.item}`;
      document.getElementById('btn-adm-save-exam').textContent = "Atualizar Exame";
      document.getElementById('btn-adm-cancel-exam').classList.remove('hidden');
    },

    resetExamForm() {
      document.getElementById('adm-exam-id').value = '';
      document.getElementById('adm-exam-item').value = '';
      document.getElementById('adm-exam-desc-emp').value = '';
      document.getElementById('adm-exam-desc-prest').value = '';
      document.getElementById('adm-exam-qtd').value = '';
      document.getElementById('adm-exam-saldo-ant').value = '';
      document.getElementById('adm-exam-form-title').textContent = "Adicionar / Editar Exame na Lista";
      document.getElementById('btn-adm-save-exam').textContent = "Salvar Procedimento";
      document.getElementById('btn-adm-cancel-exam').classList.add('hidden');
    },

    removeExam(id) {
      if (confirm("Excluir este exame do contrato?")) {
        app.state.exams = app.state.exams.filter(x => x.id !== id);
        app.data.saveExams();
        this.renderExamsList();
      }
    }
  }
};

// Inicialização segura
window.addEventListener('DOMContentLoaded', () => app.init());
