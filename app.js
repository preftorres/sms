/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * Portal Integrado & Hub de Auditoria de Contratos
 * Arquivo: app.js
 * ============================================================================
 */

const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbzB_7aIOl2t5Pq3nVBHJ7TyPd2vJsXBJ5HZ0mkg7Xn2mzewLPZ0brFBJB_rp5NfPkjwrw/exec";

const CONFIG = {
  pass: 'admin123',
  keys: {
    links: 'torres_links_v6',
    contractsList: 'torres_contracts_hub_v1',
    activeContractTab: 'torres_active_tab_v1',
    examsCache: 'torres_exams_cache_v1',
    adminLogged: 'torres_is_admin_v1'
  }
};

// LINKS INSTITUCIONAIS
const INITIAL_LINKS = [
  { id: 1, title: 'Vacinas', url: 'http://vaciastorres.dpdns.org', desc: 'Controle de Imunização' },
  { id: 2, title: 'ETP/TR', url: 'https://etp-tr.torres.rs.gov.br/', desc: 'Termos de Referência' },
  { id: 3, title: 'Betha Cloud', url: 'http://betha.cloud/', desc: 'Sistemas ERP' },
  { id: 4, title: '1Doc', url: 'http://torres.1doc.com.br/', desc: 'Processos Digitais' },
  { id: 5, title: 'Webmail', url: 'http://webmail.torres.rs.gov.br/', desc: 'E-mail Institucional' }
];

// CONTRATOS PADRÃO COM DATA E HORA DE CRIAÇÃO
const DEFAULT_CONTRACTS = [
  {
    tabName: "Contrato_67_2026",
    num: "67/2026",
    empenhos: "3406/2026 e 3407/2026",
    prestador: "M. B. Laboratório de Análises Clínicas Ltda",
    createdAt: "12/09/2026 às 08:30"
  }
];

// MODELO DE PROCEDIMENTOS
const TEMPLATE_EXAMS = [
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
  { id: 101, item: 101, cat: 'Imagem', descEmpenho: 'RAIO-X DE TÓRAX AP/PERFIL', descPrestador: '02.04.03.018-8 / RADIOGRAFIA TORACICA', qtdEmpenho: 800, saldoAnterior: 320, faturado: 45 },
  { id: 102, item: 102, cat: 'Imagem', descEmpenho: 'ULTRASSONOGRAFIA DE ABDOME TOTAL', descPrestador: '02.05.02.004-6 / ULTRASSONOGRAFIA ABDOMINAL', qtdEmpenho: 500, saldoAnterior: 230, faturado: 50 },
  { id: 103, item: 103, cat: 'Imagem', descEmpenho: 'ELETROCARDIOGRAMA (ECG)', descPrestador: '02.11.02.003-6 / ELETROCARDIOGRAMA', qtdEmpenho: 1000, saldoAnterior: 640, faturado: 0 }
];

const app = {
  state: {
    view: 'landing', // 'landing', 'saude_links', 'auditoria_hub', 'auditoria_detalhe'
    links: [],
    contracts: [],
    activeContractTab: 'Contrato_67_2026',
    exams: [],
    isAdmin: false,
    clockTimer: null,
    filters: { search: '', category: 'ALL', hideZero: false }
  },

  init() {
    this.data.loadLocal();
    this.admin.checkSession();
    this.router.init();

    if (GOOGLE_API_URL) {
      this.data.syncFromCloud();
    }
  },

  data: {
    loadLocal() {
      const rawLinks = localStorage.getItem(CONFIG.keys.links);
      app.state.links = rawLinks ? JSON.parse(rawLinks) : JSON.parse(JSON.stringify(INITIAL_LINKS));

      const rawContracts = localStorage.getItem(CONFIG.keys.contractsList);
      app.state.contracts = rawContracts ? JSON.parse(rawContracts) : JSON.parse(JSON.stringify(DEFAULT_CONTRACTS));

      const rawActiveTab = localStorage.getItem(CONFIG.keys.activeContractTab);
      app.state.activeContractTab = rawActiveTab || app.state.contracts[0].tabName;

      const rawExamsCache = localStorage.getItem(`${CONFIG.keys.examsCache}_${app.state.activeContractTab}`);
      app.state.exams = rawExamsCache ? JSON.parse(rawExamsCache) : JSON.parse(JSON.stringify(TEMPLATE_EXAMS));
    },

    saveLocalExams() {
      localStorage.setItem(`${CONFIG.keys.examsCache}_${app.state.activeContractTab}`, JSON.stringify(app.state.exams));
    },

    saveLocalContracts() {
      localStorage.setItem(CONFIG.keys.contractsList, JSON.stringify(app.state.contracts));
      localStorage.setItem(CONFIG.keys.activeContractTab, app.state.activeContractTab);
    },

    saveLinks() {
      localStorage.setItem(CONFIG.keys.links, JSON.stringify(app.state.links));
    },

    // Consulta à nuvem
    async syncFromCloud(showFeedback = false) {
      if (!GOOGLE_API_URL) return;
      try {
        app.ui.setSyncStatus(true, "Consultando Planilha Google...");
        const url = `${GOOGLE_API_URL}?contract=${encodeURIComponent(app.state.activeContractTab)}`;
        const response = await fetch(url, { redirect: 'follow' });
        const res = await response.json();

        if (res.status === "success") {
          if (Array.isArray(res.contracts) && res.contracts.length > 0) {
            // Preserva as datas de criação locais caso o Google Sheets não as tenha
            app.state.contracts = res.contracts.map(c => {
              const local = app.state.contracts.find(l => l.tabName === c.tabName);
              return {
                ...c,
                createdAt: c.createdAt || (local ? local.createdAt : "12/09/2026 às 08:30")
              };
            });
            this.saveLocalContracts();
          }

          if (Array.isArray(res.exams) && res.exams.length > 0) {
            app.state.exams = res.exams;
            this.saveLocalExams();
          } else if (app.state.activeContractTab === 'Contrato_67_2026' && app.state.exams.length > 0) {
            // Auto-povoamento da primeira aba
            await this.seedActiveContract(false);
          }

          if (app.state.view === 'auditoria_detalhe') {
            app.render.auditoriaDetalhe(document.getElementById('app-viewport'));
          } else if (app.state.view === 'auditoria_hub') {
            app.render.auditoriaHub(document.getElementById('app-viewport'));
          }

          if (showFeedback) alert("Dados atualizados com sucesso diretamente do Google Sheets!");
        }
      } catch (err) {
        console.warn("Modo Offline ativado.", err);
        if (showFeedback) alert("Modo offline: exibindo dados do cache local.");
      } finally {
        app.ui.setSyncStatus(false);
      }
    },

    async sendToCloud(payload) {
      if (!GOOGLE_API_URL) return;
      try {
        app.ui.setSyncStatus(true, "Gravando na planilha...");
        payload.contract = app.state.activeContractTab;

        await fetch(GOOGLE_API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Erro na sincronização:", err);
      } finally {
        setTimeout(() => app.ui.setSyncStatus(false), 800);
      }
    },

    async seedActiveContract(showConfirm = true) {
      if (!showConfirm || confirm(`Deseja enviar a base de exames para a aba "${app.state.activeContractTab}" na Planilha Google?`)) {
        app.ui.setSyncStatus(true, "Enviando dados para a aba...");
        await app.data.sendToCloud({
          action: "INITIAL_SEED",
          exams: app.state.exams
        });
      }
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

      // 'auditoria_exames' agora leva para o Hub de Contratos
      if (hash === 'auditoria_exames' || hash === 'auditoria') {
        app.state.view = 'auditoria_hub';
      } else if (hash.startsWith('auditoria_contrato=')) {
        const tab = hash.split('=')[1];
        app.state.activeContractTab = tab;
        app.state.view = 'auditoria_detalhe';
      } else if (['landing', 'saude_links'].includes(hash)) {
        app.state.view = hash;
      } else {
        app.state.view = 'landing';
      }

      app.ui.updateActiveMenu();
      app.render.all();
    }
  },

  ui: {
    navigate(view) {
      if (view === 'saude') view = 'saude_links';
      window.location.hash = view;
    },

    updateActiveMenu() {
      const activeNav = (app.state.view === 'auditoria_hub' || app.state.view === 'auditoria_detalhe')
        ? 'nav-btn-auditoria_exames'
        : (app.state.view === 'saude_links' ? 'nav-btn-saude_links' : 'nav-btn-landing');

      ['nav-btn-landing', 'nav-btn-saude_links', 'nav-btn-auditoria_exames'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === activeNav) {
          el.className = 'nav-btn px-4 py-2 rounded-xl transition-all bg-blue-100 text-blue-950 font-black shadow-sm';
        } else {
          el.className = 'nav-btn px-4 py-2 rounded-xl transition-all text-white/80 hover:text-white hover:bg-white/10 font-semibold';
        }
      });
    },

    toggleAuthModal(show) {
      const m = document.getElementById('modal-auth');
      if (!m) return;
      m.classList.toggle('hidden', !show);
      m.classList.toggle('flex', show);
      if (show) {
        const inp = document.getElementById('input-pass');
        if (inp) {
          inp.value = '';
          setTimeout(() => inp.focus(), 60);
        }
      }
    },

    setSyncStatus(isSyncing, text = "") {
      const indicator = document.getElementById('cloud-sync-status');
      if (!indicator) return;
      if (isSyncing) {
        indicator.textContent = `☁️ ${text}`;
        indicator.classList.remove('hidden');
      } else {
        indicator.classList.add('hidden');
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
      } else if (app.state.view === 'auditoria_hub') {
        this.auditoriaHub(vp);
      } else if (app.state.view === 'auditoria_detalhe') {
        this.auditoriaDetalhe(vp);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // TELA 1: LANDING PAGE
    landing(el) {
      el.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center p-6 fade-in">
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

            <button onclick="app.ui.navigate('saude_links')" class="card-landing bg-white p-10 rounded-[3rem] shadow-xl flex flex-col items-center max-w-sm w-full group">
                <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <h2 class="text-2xl font-black text-slate-800 mb-2">Secretaria da Saúde</h2>
                <p class="text-slate-400 font-medium text-center">Acesse a central de sistemas, links úteis e auditoria de contratos.</p>
                <div class="mt-8 px-6 py-2.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">Clique para entrar</div>
            </button>
        </div>
      `;
    },

    // TELA 2: PORTAL DE ACESSOS (CARD HARMONIOSO COM BORDA AZUL, SEM O BANNER PESADO)
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
                        <p class="text-blue-400 text-xs font-bold tracking-widest mt-1 uppercase">Portal Integrado de Acessos</p>
                    </div>
                </div>
                <div id="clock-display" class="text-right text-white">
                    <p id="clock-time" class="text-xl font-black leading-none font-mono"></p>
                    <p id="clock-date" class="text-[10px] uppercase font-bold text-blue-400 mt-1"></p>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-6 py-10 fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                
                <!-- CARD DESTAQUE: AUDITORIA DE CONTRATOS (INTEGRADO À GRADE COM BORDA AZUL DE DESTAQUE) -->
                <button onclick="app.ui.navigate('auditoria_exames')" 
                   class="text-left bg-white p-8 rounded-[2.5rem] border-2 border-blue-500 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between relative overflow-hidden ring-4 ring-blue-50/60">
                    <div class="absolute top-4 right-5">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                            Gestão & Auditoria
                        </span>
                    </div>
                    <div>
                        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                        </div>
                        <h3 class="font-black text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition">Auditoria de Cotas de Exames</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">Painel de conferência e controle de execução dos contratos e empenhos da saúde.</p>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                        <span>Acessar Painel</span>
                        <span class="group-hover:translate-x-1 transition">→</span>
                    </div>
                </button>

                <!-- LINKS INSTITUCIONAIS EXATOS -->
                ${app.state.links.map(l => `
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between">
                        <div>
                            <div class="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            </div>
                            <h3 class="font-black text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition">${l.title}</h3>
                            <p class="text-sm text-slate-400 font-medium leading-tight">${l.desc}</p>
                        </div>
                        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-600 transition">
                            <span>Abrir Sistema</span>
                            <span class="group-hover:translate-x-1 transition">↗</span>
                        </div>
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

    // TELA 3A: HUB DE CONTRATOS (SELEÇÃO EM CARDS COM DATA E HORA DE CRIAÇÃO)
    auditoriaHub(el) {
      el.innerHTML = `
        <div class="container mx-auto px-6 py-10 fade-in">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
                <div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Auditoria & Fiscalização de Saúde</span>
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Contratos de Exames Cadastrados</h2>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">Selecione um contrato para auditar procedimentos e cotas ou cadastre um novo.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="app.data.syncFromCloud(true)" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
                        🔄 Atualizar da Planilha
                    </button>
                    <button onclick="app.audit.openNewContractModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
                        <span class="text-sm">+</span> Novo Contrato
                    </button>
                </div>
            </div>

            <!-- GRADE DE CARDS DOS CONTRATOS -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${app.state.contracts.map(c => `
                    <div class="bg-white rounded-[2.5rem] p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <span class="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase border border-blue-100">
                                    Aba: ${c.tabName}
                                </span>
                                <span class="text-[11px] font-bold text-slate-400">Ativo</span>
                            </div>
                            
                            <h3 class="text-xl font-black text-slate-900 group-hover:text-blue-600 transition">Contrato nº ${c.num}</h3>
                            <p class="text-xs font-semibold text-slate-600 mt-1 line-clamp-2">${c.prestador}</p>
                            
                            <div class="mt-4 p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 space-y-1">
                                <p><strong>Empenhos:</strong> ${c.empenhos}</p>
                                <p class="text-slate-400 text-[10px] flex items-center gap-1 mt-2">
                                    <span>📅</span> Registrado em: <b class="text-slate-600">${c.createdAt || "12/09/2026 às 08:30"}</b>
                                </p>
                            </div>
                        </div>

                        <div class="mt-6 pt-4 border-t border-slate-100">
                            <button onclick="app.audit.openContractDetail('${c.tabName}')" 
                                    class="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2">
                                <span>Abrir Auditoria deste Contrato</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                `).join('')}

                <!-- CARD PONTILHADO "+ NOVO CONTRATO" -->
                <button onclick="app.audit.openNewContractModal()" 
                   class="bg-white/60 hover:bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center group min-h-[280px]">
                    <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <h4 class="font-black text-slate-800 text-base mb-1 group-hover:text-blue-600 transition">Cadastrar Novo Contrato</h4>
                    <p class="text-xs text-slate-400 max-w-xs">Cria uma nova aba e inicia o controle de cotas e procedimentos.</p>
                    <span class="mt-4 text-xs font-bold text-blue-600">+ Adicionar</span>
                </button>
            </div>
        </div>
      `;
    },

    // TELA 3B: DETALHE DO CONTRATO SELECIONADO (TABELA, KPIS E FILTROS)
    auditoriaDetalhe(el) {
      const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];

      el.innerHTML = `
        <div class="container mx-auto px-4 sm:px-6 py-8 fade-in">
          
          <!-- BARRA SUPERIOR DE IDENTIFICAÇÃO E RETORNO -->
          <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6 print:border-none print:shadow-none print:p-0">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <button onclick="app.ui.navigate('auditoria_exames')" class="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition">
                    ← Voltar aos Contratos
                  </button>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 uppercase">
                    Aba: ${currentContract.tabName}
                  </span>
                  <span id="cloud-sync-status" class="hidden text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold"></span>
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900">
                  Auditoria de Cotas — Contrato nº ${currentContract.num}
                </h2>
                <div class="mt-1 text-xs text-slate-600 flex flex-wrap gap-x-5 gap-y-1">
                  <span><strong>Empenhos:</strong> ${currentContract.empenhos}</span>
                  <span><strong>Prestador:</strong> ${currentContract.prestador}</span>
                  <span><strong>Cadastrado em:</strong> ${currentContract.createdAt || "12/09/2026"}</span>
                </div>
              </div>

              <!-- BARRA DE AÇÕES LIMPA E DIRETA -->
              <div class="flex flex-wrap items-center gap-2 print:hidden">
                <button onclick="app.data.syncFromCloud(true)" title="Puxar dados atualizados desta aba no Google Sheets" class="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1">
                  <span>🔄</span> Sincronizar
                </button>
                <button onclick="app.audit.exportCSV()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition">
                  Exportar (.CSV)
                </button>
                <button onclick="window.print()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition">
                  Imprimir / PDF
                </button>
                ${app.state.isAdmin ? `
                  <button onclick="app.admin.trigger(true)" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 shadow transition">
                    ⚙️ Procedimentos
                  </button>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- KPIS -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Empenhado</span>
              <p id="kpi-empenhado" class="text-2xl font-black text-slate-800 mt-1">0</p>
              <span class="text-[10px] text-slate-400">Cotas deste contrato</span>
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
              <span class="text-[10px] text-red-600">Requer atenção</span>
            </div>
          </div>

          <!-- FILTROS -->
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between gap-4 print:hidden">
            <div class="flex-1 flex flex-col sm:flex-row gap-3">
              <input type="text" id="filter-search" oninput="app.audit.filter()" placeholder="Buscar por código ou descrição nesta aba..." class="flex-1 px-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-blue-500">
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

          <!-- TABELA DE EXAMES COM SCROLL INTERNO E STICKY HEADER -->
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
              Nenhum exame cadastrado para este contrato.
            </div>
          </div>

        </div>
      `;

      app.audit.renderTable();
    }
  },

  audit: {
    // Abre a auditoria de um contrato específico a partir do Hub
    openContractDetail(tabName) {
      app.state.activeContractTab = tabName;
      app.data.saveLocalContracts();

      const rawExams = localStorage.getItem(`${CONFIG.keys.examsCache}_${tabName}`);
      app.state.exams = rawExams ? JSON.parse(rawExams) : [];

      window.location.hash = `auditoria_contrato=${tabName}`;
    },

    openNewContractModal() {
      const m = document.getElementById('modal-new-contract');
      if (m) m.classList.remove('hidden'), m.classList.add('flex');
    },

    closeNewContractModal() {
      const m = document.getElementById('modal-new-contract');
      if (m) m.classList.add('hidden'), m.classList.remove('flex');
    },

    async confirmCreateContract() {
      const num = document.getElementById('new-contract-num').value.trim();
      const empenhos = document.getElementById('new-contract-empenhos').value.trim();
      const prestador = document.getElementById('new-contract-prestador').value.trim();
      const copyTemplate = document.getElementById('new-contract-copy-template').checked;

      if (!num || !prestador) {
        alert("Preencha ao menos o número do contrato e o prestador.");
        return;
      }

      const safeTabName = `Contrato_${num.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Data e hora de criação formatada
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const createdAtStr = `${dateStr} às ${timeStr}`;

      const newContractObj = {
        tabName: safeTabName,
        num: num,
        empenhos: empenhos || 'A definir',
        prestador: prestador,
        createdAt: createdAtStr
      };

      app.state.contracts.push(newContractObj);
      app.state.activeContractTab = safeTabName;
      app.state.exams = copyTemplate ? JSON.parse(JSON.stringify(TEMPLATE_EXAMS)) : [];

      app.data.saveLocalContracts();
      app.data.saveLocalExams();
      this.closeNewContractModal();

      // Transiciona direto para os exames do novo contrato
      this.openContractDetail(safeTabName);

      // Envia ordem para criar a nova aba no Google Sheets com data de criação
      await app.data.sendToCloud({
        action: "CREATE_CONTRACT",
        ...newContractObj,
        initialExams: app.state.exams
      });
    },

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
      app.data.saveLocalExams();
      this.renderTable();

      // Grava no Google Sheets na aba do contrato atual
      app.data.sendToCloud({
        action: "UPDATE_VALUES",
        contract: app.state.activeContractTab,
        id: id,
        [field]: parsed,
        itemData: target
      });
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
          
          <td class="py-2.5 px-3 text-right">
            <input type="number" min="0" value="${item.saldoAnterior}" 
                   onchange="app.audit.updateVal(${item.id}, 'saldoAnterior', this.value)"
                   class="table-num w-20 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white shadow-xs focus:border-blue-500 font-semibold">
          </td>

          <td class="py-2.5 px-3 text-right bg-blue-50/70 border-x border-blue-100">
            <input type="number" min="0" value="${item.faturado}" 
                   onchange="app.audit.updateVal(${item.id}, 'faturado', this.value)"
                   class="table-num w-20 text-right px-2 py-1 text-xs border border-blue-300 rounded bg-white shadow-xs focus:border-blue-600 font-bold text-blue-950">
          </td>

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

    exportCSV() {
      const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];
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
      a.download = `Auditoria_${currentContract.tabName}_Torres_${new Date().toISOString().slice(0, 10)}.csv`;
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
      if (input && input.value === CONFIG.pass) {
        app.state.isAdmin = true;
        localStorage.setItem(CONFIG.keys.adminLogged, 'true');
        app.ui.toggleAuthModal(false);
        this.openPanel();
      } else {
        alert("Senha Inválida!");
      }
      if (input) input.value = '';
    },

    logout() {
      app.state.isAdmin = false;
      localStorage.removeItem(CONFIG.keys.adminLogged);
      this.exit();
      alert("Sessão administrativa finalizada.");
    },

    openPanel(directToContract = false) {
      const panel = document.getElementById('admin-panel');
      if (!panel) return;
      panel.classList.remove('hidden');

      if (directToContract) {
        this.switchTab('contrato');
      } else {
        this.switchTab('links');
      }
      this.renderLinksList();
      this.renderExamsList();
    },

    exit() {
      const panel = document.getElementById('admin-panel');
      if (panel) panel.classList.add('hidden');
      app.render.all();
    },

    switchTab(tab) {
      const viewLinks = document.getElementById('admin-view-links');
      const viewContrato = document.getElementById('admin-view-contrato');
      const btnLinks = document.getElementById('admin-tab-btn-links');
      const btnContrato = document.getElementById('admin-tab-btn-contrato');

      if (!viewLinks || !viewContrato) return;

      if (tab === 'links') {
        viewLinks.classList.remove('hidden');
        viewContrato.classList.add('hidden');
        if (btnLinks) btnLinks.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600";
        if (btnContrato) btnContrato.className = "px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600";
      } else {
        viewLinks.classList.add('hidden');
        viewContrato.classList.remove('hidden');
        if (btnContrato) btnContrato.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600";
        if (btnLinks) btnLinks.className = "px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600";
      }
    },

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
      document.getElem
