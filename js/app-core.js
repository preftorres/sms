/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO CORE: Núcleo, Sessão, Roteador, Nuvem & Matriz de Permissões
 * Arquivo: js/app-core.js
 * ============================================================================
 */

window.app = window.app || {};

Object.assign(window.app, {
  state: {
    view: 'landing',
    previousView: 'landing',
    links: [],
    contracts: [],
    activeContractTab: 'Contrato_67_2026',
    exams: [],
    dotacoes: [],
    dotacoesFilter: 'TODOS',
    dotacoesUserFilter: 'TODOS',
    dotacoesSearch: '',
    pendingDotacaoTemp: null,
    deleteDotacaoTarget: null,
    panelContracts: [],
    panelContractsFilter: 'ATIVOS',
    panelFiscalFilter: 'TODOS',
    panelViewMode: 'CARDS',
    panelSearch: '',
    deletePanelTarget: null,
    users: [],
    permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)),
    auth: { isLogged: false, user: null },
    auditLogs: [],
    auditLogsFilter: { search: '', user: 'todos', modulo: 'todos', data: '' },
    clockTimer: null,
    pendingView: null,
    filters: { search: '', category: 'ALL', hideZero: false }
  },

  init() {
    if (window.app.modals && typeof window.app.modals.init === 'function') {
      window.app.modals.init();
    }

    this.data.loadLocal();
    this.auditAuth.checkSession();
    this.router.init();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        app.auditAuth.cancelLogin();
        if (app.audit) app.audit.closeNewContractModal();
        if (app.gemini) app.gemini.closeModal();
        if (app.dotacoes) {
          app.dotacoes.closeNewModal();
          app.dotacoes.closeEditModal();
          app.dotacoes.closeComplementarModal();
          app.dotacoes.closeCancelarModal();
        }
        if (app.contratos) {
          app.contratos.closeNewModal();
          app.contratos.closeEditModal();
          app.contratos.closeDeleteModal();
        }
        if (app.admin) {
          app.admin.closeResetPasswordModal();
          app.admin.closeFeedbackModal();
          app.admin.closeDeleteUserModal();
          app.admin.exit();
        }
      }
    });

    if (GOOGLE_API_URL) {
      this.data.syncFromCloud();
    }
  },

  permissions: {
    can(actionKey) {
      if (!app.state.auth.isLogged || !app.state.auth.user) return false;
      if (app.state.auth.user.perfil === 'Administrador') return true;

      const role = app.state.auth.user.perfil || 'Comprador';
      const roleMap = (app.state.permissions && app.state.permissions[role]) || DEFAULT_PERMISSIONS[role] || {};

      const getVal = (key) => {
        if (roleMap[key] !== undefined) return !!roleMap[key];
        return !!(DEFAULT_PERMISSIONS[role] && DEFAULT_PERMISSIONS[role][key]);
      };

      // Se a verificação for de auditoria e audit_access for falso, bloqueia tudo do módulo
      if (actionKey.startsWith('audit_')) {
        const canAccess = getVal('audit_access');
        if (!canAccess) return false;
        if (actionKey === 'audit_access') return true;
      }

      // Se for de dotações e dotacoes_access for falso, bloqueia tudo do módulo
      if (actionKey.startsWith('dotacoes_')) {
        const canAccess = getVal('dotacoes_access');
        if (!canAccess) return false;
        if (actionKey === 'dotacoes_access') return true;
      }

      // Se for de contratos e panel_access for falso, bloqueia tudo do módulo
      if (actionKey.startsWith('panel_')) {
        const canAccess = getVal('panel_access');
        if (!canAccess) return false;
        if (actionKey === 'panel_access') return true;
      }

      return getVal(actionKey);
    }
  },

  auditAuth: {
    checkSession() {
      const saved = sessionStorage.getItem(CONFIG.keys.auditSession);
      if (saved) {
        try {
          app.state.auth.user = JSON.parse(saved);
          app.state.auth.isLogged = true;
          this.updateBadge();
        } catch (e) {
          this.logout();
        }
      }
    },

    updateBadge() {
      const badge = document.getElementById('auth-user-badge');
      const nameEl = document.getElementById('auth-user-name');
      if (!badge || !nameEl) return;

      if (app.state.auth.isLogged && app.state.auth.user) {
        const loginUsuario = app.state.auth.user.usuario || 'admin';
        nameEl.textContent = `Usuário: ${loginUsuario}`;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    },

    promptLogin(targetView = 'auditoria_hub') {
      app.state.pendingView = targetView;
      if (!document.getElementById('modal-audit-login') && window.app.modals) {
        window.app.modals.init();
      }

      const modal = document.getElementById('modal-audit-login');
      const err = document.getElementById('login-error-msg');
      if (err) err.classList.add('hidden');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        const userEl = document.getElementById('login-user');
        const passEl = document.getElementById('login-pass');
        if (userEl) userEl.value = '';
        if (passEl) passEl.value = '';
        setTimeout(() => { if (userEl) userEl.focus(); }, 80);
      }
    },

    closeLoginModal() {
      const modal = document.getElementById('modal-audit-login');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    cancelLogin() {
      this.closeLoginModal();
      app.state.pendingView = null;
      const target = (app.state.previousView && !app.state.previousView.startsWith('auditoria') && app.state.previousView !== 'dotacoes_hub' && app.state.previousView !== 'contratos_hub')
        ? app.state.previousView
        : 'saude_links';
      window.location.hash = target;
      app.ui.navigate(target);
    },

    async handleLogin(e) {
      e.preventDefault();
      const u = document.getElementById('login-user').value.trim();
      const p = document.getElementById('login-pass').value.trim();
      const err = document.getElementById('login-error-msg');
      const btn = document.getElementById('btn-login-submit');

      if (!u || !p) return;

      try {
        btn.disabled = true;
        btn.textContent = "Verificando...";
        err.classList.add('hidden');

        app.ui.showLoading({
          icon: "🔐",
          title: "Autenticando Acesso...",
          subtitle: "Validando credenciais com a base de usuários",
          step1: "Credenciais enviadas com segurança",
          step2: "Consultando dados...",
          step3: "Liberando perfil e permissões de acesso"
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const url = `${GOOGLE_API_URL}?action=LOGIN&u=${encodeURIComponent(u)}&p=${encodeURIComponent(p)}`;
        const res = await fetch(url, { redirect: 'follow', signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();

        if (data.status === "success" && data.user) {
          app.state.auth.isLogged = true;
          app.state.auth.user = data.user;
          sessionStorage.setItem(CONFIG.keys.auditSession, JSON.stringify(data.user));

          this.updateBadge();
          this.closeLoginModal();

          const target = app.state.pendingView || 'auditoria_hub';
          app.state.pendingView = null;
          app.router.go(target);
        } else {
          err.textContent = data.message || "Usuário ou senha incorretos.";
          err.classList.remove('hidden');
        }
      } catch (error) {
        console.warn("Falha de autenticação:", error);
        // Fallback silencioso exclusivo para contingência administrativa se o servidor estiver inacessível
        if (u === "admin" && p === "admin123") {
          const fallbackUser = { id: 1, usuario: "admin", nome: "Administrador", perfil: "Administrador" };
          app.state.auth.isLogged = true;
          app.state.auth.user = fallbackUser;
          sessionStorage.setItem(CONFIG.keys.auditSession, JSON.stringify(fallbackUser));
          this.updateBadge();
          this.closeLoginModal();
          const target = app.state.pendingView || 'auditoria_hub';
          app.router.go(target);
        } else {
          // Mensagem estritamente profissional e segura, sem exibir credenciais ou detalhes internos
          err.textContent = "Não foi possível validar as credenciais no momento. Verifique sua conexão com a rede e tente novamente.";
          err.classList.remove('hidden');
        }
      } finally {
        app.ui.hideLoading();
        btn.disabled = false;
        btn.textContent = "Entrar";
      }
    },

    logout() {
      app.state.auth.isLogged = false;
      app.state.auth.user = null;
      sessionStorage.removeItem(CONFIG.keys.auditSession);
      this.updateBadge();
      app.ui.navigate('landing');
    }
  },

  data: {
    loadLocal() {
      const rawLinks = localStorage.getItem(CONFIG.keys.links);
      app.state.links = rawLinks ? JSON.parse(rawLinks) : JSON.parse(JSON.stringify(INITIAL_LINKS));

      const rawContracts = localStorage.getItem(CONFIG.keys.contractsList);
      app.state.contracts = rawContracts ? JSON.parse(rawContracts) : JSON.parse(JSON.stringify(DEFAULT_CONTRACTS));

      // Garante que o Contrato 73/2026 seja sempre o primeiro na lista
      const idx73 = app.state.contracts.findIndex(c => c.tabName === "Contrato_73_2026");
      if (idx73 > 0) {
        const c73 = app.state.contracts.splice(idx73, 1)[0];
        app.state.contracts.unshift(c73);
      } else if (idx73 === -1) {
        app.state.contracts.unshift(DEFAULT_CONTRACTS[0]);
      }
      this.saveLocalContracts();

      const rawActiveTab = localStorage.getItem(CONFIG.keys.activeContractTab);
      app.state.activeContractTab = (rawActiveTab && rawActiveTab !== "undefined") ? rawActiveTab : "Contrato_73_2026";

      const rawExamsCache = localStorage.getItem(`${CONFIG.keys.examsCache}_${app.state.activeContractTab}`);
      if (app.state.activeContractTab === "Contrato_73_2026") {
        let parsed = null;
        try { parsed = rawExamsCache ? JSON.parse(rawExamsCache) : null; } catch(e){}
        // Se a cache local estiver vazia, com menos de 70 exames ou com valores zerados (corrompida), restaura imediatamente os 76 procedimentos reais
        if (!parsed || !Array.isArray(parsed) || parsed.length < 70 || !parsed[0].vlUnit) {
          app.state.exams = JSON.parse(JSON.stringify(CONTRATO_73_EXAMS));
          this.saveLocalExams();
        } else {
          // Garante que vlUnit esteja presente em todos os 76 exames
          parsed.forEach((item, idx) => {
            if (!item.vlUnit && CONTRATO_73_EXAMS[idx] && CONTRATO_73_EXAMS[idx].vlUnit) {
              item.vlUnit = CONTRATO_73_EXAMS[idx].vlUnit;
            }
          });
          app.state.exams = parsed;
          this.saveLocalExams();
        }
      } else if (rawExamsCache) {
        try { app.state.exams = JSON.parse(rawExamsCache); } catch(e){ app.state.exams = []; }
      } else {
        app.state.exams = [];
      }

      const rawDotacoes = localStorage.getItem(CONFIG.keys.dotacoesCache);
      let parsedDot = null;
      try { parsedDot = rawDotacoes ? JSON.parse(rawDotacoes) : null; } catch(e){}
      if (!parsedDot || !Array.isArray(parsedDot) || parsedDot.length < 50) {
        app.state.dotacoes = JSON.parse(JSON.stringify(INITIAL_DOTACOES));
        this.saveLocalDotacoes();
      } else {
        app.state.dotacoes = parsedDot;
      }

      const rawPanel = localStorage.getItem(CONFIG.keys.panelContracts);
      try {
        let listP = rawPanel ? JSON.parse(rawPanel) : [];
        if (Array.isArray(listP)) {
          listP = listP.filter(c => c && c.status !== 'Disponível' && !String(c.empresa).includes('ESPAÇO VAZIO') && String(c.empresa || '').trim().length > 0);
        }
        app.state.panelContracts = listP;
      } catch(e) {
        app.state.panelContracts = [];
      }

      const rawPerms = localStorage.getItem(CONFIG.keys.permissions);
      app.state.permissions = rawPerms ? JSON.parse(rawPerms) : JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
    },

    saveLocalExams() {
      localStorage.setItem(`${CONFIG.keys.examsCache}_${app.state.activeContractTab}`, JSON.stringify(app.state.exams));
    },

    saveLocalContracts() {
      localStorage.setItem(CONFIG.keys.contractsList, JSON.stringify(app.state.contracts));
      localStorage.setItem(CONFIG.keys.activeContractTab, app.state.activeContractTab);
    },

    saveLocalPanelContracts() {
      localStorage.setItem(CONFIG.keys.panelContracts, JSON.stringify(app.state.panelContracts || []));
    },

    saveLocalDotacoes() {
      localStorage.setItem(CONFIG.keys.dotacoesCache, JSON.stringify(app.state.dotacoes));
    },

    saveLocalPermissions() {
      localStorage.setItem(CONFIG.keys.permissions, JSON.stringify(app.state.permissions));
    },

    saveLinksLocally() {
      localStorage.setItem(CONFIG.keys.links, JSON.stringify(app.state.links));
    },

    isSyncing: false,
    syncPromise: null,

    async syncFromCloud(showFeedback = false, options = {}) {
      if (!GOOGLE_API_URL) return;

      if (showFeedback || options.showModal) {
        app.ui.showLoading({
          icon: options.icon || "📊",
          title: options.title || "Sincronizando Dados...",
          subtitle: options.subtitle || "Carregando informações mais recentes do servidor",
          step1: options.step1 || "Conexão com o servidor estabelecida",
          step2: options.step2 || "Consultando dados...",
          step3: options.step3 || "Atualizando painéis e tabelas"
        });
      }

      this.isSyncing = true;
      app.ui.setSyncStatus(true, "Sincronizando com o servidor...");

      const fetchPromise = (async () => {
        try {
          const url = `${GOOGLE_API_URL}?contract=${encodeURIComponent(app.state.activeContractTab)}`;
          const response = await fetch(url, { redirect: 'follow' });
          const res = await response.json();

          if (res.status === "success") {
            if (res.permissions && typeof res.permissions === 'object') {
              app.state.permissions = res.permissions;
              this.saveLocalPermissions();
            }

            if (Array.isArray(res.shortcuts) && res.shortcuts.length > 0) {
              app.state.links = res.shortcuts;
              this.saveLinksLocally();
              if (app.state.view === 'saude_links') app.render.saudeLinks(document.getElementById('app-viewport'));
            }

            if (Array.isArray(res.contracts) && res.contracts.length > 0) {
              let list = res.contracts.map(c => {
                const local = app.state.contracts.find(l => l.tabName === c.tabName);
                return { ...c, createdAt: c.createdAt || (local ? local.createdAt : "25/09/2026 às 15:00") };
              });
              const i73 = list.findIndex(c => c.tabName === "Contrato_73_2026");
              if (i73 > 0) {
                const c73 = list.splice(i73, 1)[0];
                list.unshift(c73);
              } else if (i73 === -1) {
                list.unshift(DEFAULT_CONTRACTS[0]);
              }
              app.state.contracts = list;
              this.saveLocalContracts();
            }

            if (Array.isArray(res.exams) && res.exams.length > 0) {
              // Proteção contra sobrescrita com dados legados incompletos (< 70 exames) ou zerados
              if (app.state.activeContractTab === "Contrato_73_2026" && (res.exams.length < 70 || !res.exams[0].vlUnit)) {
                console.warn("Nuvem retornou exames legados/incompletos para o Contrato 73. Mantendo os 76 procedimentos oficiais.");
                if (!app.state.exams || app.state.exams.length < 70 || !app.state.exams[0].vlUnit) {
                  app.state.exams = JSON.parse(JSON.stringify(CONTRATO_73_EXAMS));
                  this.saveLocalExams();
                }
                // Dispara auto-reparo na nuvem em segundo plano
                fetch(`${GOOGLE_API_URL}?action=POPULAR_73`, { redirect: 'follow' }).catch(() => {});
              } else {
                if (app.state.activeContractTab === "Contrato_73_2026") {
                  res.exams.forEach((item, idx) => {
                    if (!item.vlUnit && CONTRATO_73_EXAMS[idx] && CONTRATO_73_EXAMS[idx].vlUnit) {
                      item.vlUnit = CONTRATO_73_EXAMS[idx].vlUnit;
                    }
                  });
                }
                app.state.exams = res.exams;
                this.saveLocalExams();
              }
            } else if (app.state.activeContractTab === "Contrato_73_2026" && (!app.state.exams || app.state.exams.length < 70 || !app.state.exams[0].vlUnit)) {
              app.state.exams = JSON.parse(JSON.stringify(CONTRATO_73_EXAMS));
              this.saveLocalExams();
            }

            if (Array.isArray(res.dotacoes) && res.dotacoes.length >= 50) {
              app.state.dotacoes = res.dotacoes;
              this.saveLocalDotacoes();
              if (app.state.view === 'dotacoes_hub') app.render.dotacoesHub(document.getElementById('app-viewport'));
            }

            if (Array.isArray(res.panelContracts) && res.panelContracts.length > 0) {
              app.state.panelContracts = res.panelContracts.filter(c => c && c.status !== 'Disponível' && !String(c.empresa).includes('ESPAÇO VAZIO') && String(c.empresa || '').trim().length > 0);
              this.saveLocalPanelContracts();
              if (app.state.view === 'contratos_hub' && app.render.contratosHub) {
                app.render.contratosHub(document.getElementById('app-viewport'));
              }
            }

            if (app.state.view === 'auditoria_detalhe') app.render.auditoriaDetalhe(document.getElementById('app-viewport'));
            else if (app.state.view === 'auditoria_hub') app.render.auditoriaHub(document.getElementById('app-viewport'));
            else if (app.state.view === 'dotacoes_hub' && app.render.dotacoesHub) app.render.dotacoesHub(document.getElementById('app-viewport'));
            else if (app.state.view === 'contratos_hub' && app.render.contratosHub) app.render.contratosHub(document.getElementById('app-viewport'));

            if (showFeedback) app.ui.toast("Dados sincronizados com sucesso!", "success", "✓ Sincronizado");
          }
        } catch (err) {
          console.warn("Modo Offline ativado.", err);
          if (showFeedback) app.ui.toast("Modo offline: exibindo dados salvos em cache.", "info", "Modo Offline");
        } finally {
          this.isSyncing = false;
          app.ui.setSyncStatus(false);
          if (showFeedback || options.showModal) app.ui.hideLoading();
        }
      })();

      this.syncPromise = fetchPromise;
      return fetchPromise;
    },

    async sendToCloud(payload) {
      if (!GOOGLE_API_URL) return;
      try {
        app.ui.setSyncStatus(true, "Salvando dados no servidor...");
        payload.contract = app.state.activeContractTab;

        // Injeta o usuário logado para trilha de auditoria
        if (!payload.currentUser) {
          payload.currentUser = (app.state.auth.user && (app.state.auth.user.usuario || app.state.auth.user.nome)) || 'admin';
        }
        if (!payload.currentUserName) {
          payload.currentUserName = (app.state.auth.user && app.state.auth.user.nome) || '';
        }

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

    async fetchAuditLogs(limit = 500) {
      if (!GOOGLE_API_URL) return [];
      try {
        const resp = await fetch(`${GOOGLE_API_URL}?action=GET_AUDIT_LOGS&limit=${limit}`, { redirect: 'follow' });
        if (!resp.ok) return [];
        const data = await resp.json();
        return (data && Array.isArray(data.logs)) ? data.logs : [];
      } catch (err) {
        console.error("Erro ao buscar logs de auditoria:", err);
        return [];
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

      let targetView = 'landing';
      if (hash === 'auditoria_exames' || hash === 'auditoria') {
        targetView = 'auditoria_hub';
      } else if (hash.startsWith('auditoria_contrato=')) {
        app.state.activeContractTab = hash.split('=')[1];
        if (app.audit && typeof app.audit.ensureContractExamsLoaded === 'function') {
          app.audit.ensureContractExamsLoaded(app.state.activeContractTab);
        }
        targetView = 'auditoria_detalhe';
      } else if (hash === 'dotacoes' || hash === 'dotacoes_hub') {
        targetView = 'dotacoes_hub';
      } else if (hash === 'contratos' || hash === 'painel_contratos' || hash === 'contratos_hub') {
        targetView = 'contratos_hub';
      } else if (['landing', 'saude_links'].includes(hash)) {
        targetView = hash;
      }

      this.go(targetView);
    },

    async go(view) {
      const isRestricted = (view === 'auditoria_hub' || view === 'auditoria_detalhe' || view === 'dotacoes_hub' || view === 'contratos_hub');
      if (isRestricted && !app.state.auth.isLogged) {
        app.auditAuth.promptLogin(view);
        return;
      }

      if (app.state.auth.isLogged) {
        if ((view === 'auditoria_hub' || view === 'auditoria_detalhe') && !app.permissions.can('audit_access')) {
          app.ui.toast("Seu perfil não tem permissão para acessar a área de Auditoria.", "warning", "Acesso Restrito");
          if (app.state.view !== 'saude_links') this.go('saude_links');
          return;
        }
        if (view === 'dotacoes_hub' && !app.permissions.can('dotacoes_access')) {
          app.ui.toast("Seu perfil não tem permissão para acessar o Livro Digital de Dotações.", "warning", "Acesso Restrito");
          if (app.state.view !== 'saude_links') this.go('saude_links');
          return;
        }
        if (view === 'contratos_hub' && !app.permissions.can('panel_access')) {
          app.ui.toast("Seu perfil não tem permissão para acessar o Painel de Contratos LDO.", "warning", "Acesso Restrito");
          if (app.state.view !== 'saude_links') this.go('saude_links');
          return;
        }
      }

      if (!isRestricted) {
        app.auditAuth.closeLoginModal();
        app.state.previousView = view;
      }

      // Espera visual para surgimento de dados quando necessário
      if (isRestricted) {
        const needsWait = (app.data && app.data.isSyncing) || (view === 'contratos_hub' && (!app.state.panelContracts || app.state.panelContracts.length === 0));
        if (needsWait) {
          let loadingOpts = {
            icon: "📊",
            title: "Carregando Dados...",
            subtitle: "Sincronizando registros em tempo real com o servidor",
            step1: "Conexão com a nuvem estabelecida",
            step2: "Consultando dados...",
            step3: "Preparando exibição e atualizando painel"
          };
          if (view === 'contratos_hub') {
            loadingOpts = {
              icon: "📑",
              title: "Carregando Painel de Contratos...",
              subtitle: "Sincronizando os contratos contínuos com o servidor",
              step1: "Conexão com a governança estabelecida",
              step2: "Consultando dados...",
              step3: "Atualizando mural de monitoramento"
            };
          } else if (view === 'dotacoes_hub') {
            loadingOpts = {
              icon: "📋",
              title: "Carregando Livro de Dotações...",
              subtitle: "Sincronizando pedidos e baixas contábeis com o servidor",
              step1: "Conexão com o livro contábil estabelecida",
              step2: "Consultando dados...",
              step3: "Atualizando tabela do Livro Digital"
            };
          } else if (view === 'auditoria_hub' || view === 'auditoria_detalhe') {
            loadingOpts = {
              icon: "🧪",
              title: "Carregando Auditoria de Exames...",
              subtitle: "Sincronizando contratos e procedimentos com o servidor",
              step1: "Conexão com a base de exames estabelecida",
              step2: "Consultando dados...",
              step3: "Atualizando painel de auditoria"
            };
          }

          app.ui.showLoading(loadingOpts);
          try {
            if (app.data.syncPromise) {
              await app.data.syncPromise;
            } else if (view === 'contratos_hub' && (!app.state.panelContracts || app.state.panelContracts.length === 0)) {
              await app.data.syncFromCloud(false);
            }
          } catch(e) {
            console.warn("Erro ao aguardar dados:", e);
          } finally {
            app.ui.hideLoading();
          }
        }
      }

      app.state.view = view;
      app.ui.updateActiveMenu();
      app.render.all();
    }
  },

  notifications: {
    isSupported() {
      return 'Notification' in window;
    },

    getPermission() {
      return this.isSupported() ? Notification.permission : 'denied';
    },

    async requestPermission() {
      if (!this.isSupported()) {
        app.ui.toast("Seu navegador não suporta notificações de área de trabalho.", "warning", "Notificações");
        return 'unsupported';
      }
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          app.ui.toast("Notificações no computador ativadas com sucesso! Você receberá alertas mesmo com o navegador em segundo plano.", "success", "🔔 Alertas Ativados!");
          this.send("Prefeitura de Torres • Saúde", "🔔 Alertas ativados! Você será notificado sobre novos pedidos de dotação e checks do financeiro.");
        } else {
          app.ui.toast("Permissão de notificação não concedida.", "info", "Aviso");
        }
        return perm;
      } catch (e) {
        console.error("Erro ao solicitar permissão de notificação:", e);
      }
    },

    send(title, body, icon = "Logo_Torres_100x100.webp") {
      if (this.isSupported() && Notification.permission === 'granted') {
        try {
          const n = new Notification(title, {
            body: body,
            icon: icon,
            badge: icon,
            tag: 'torres-saude-notification',
            renotify: true
          });
          n.onclick = () => {
            window.focus();
            n.close();
          };
        } catch (e) {
          console.warn("Falha ao emitir notificação nativa:", e);
        }
      }
    }
  },

  ui: {
    toast(message, type = 'success', title = '', duration = 5000) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = 'pointer-events-auto transform transition-all duration-300 ease-out translate-y-4 opacity-0 p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 text-xs';

      let icon = '✅';
      let bgBorder = 'bg-white/95 border-emerald-200 text-slate-800 shadow-emerald-500/10';
      let titleColor = 'text-emerald-900';

      if (type === 'workflow') {
        icon = '🔄';
        bgBorder = 'bg-white/95 border-blue-200 text-slate-800 shadow-blue-500/10';
        titleColor = 'text-blue-900';
      } else if (type === 'warning') {
        icon = '⚠️';
        bgBorder = 'bg-white/95 border-amber-200 text-slate-800 shadow-amber-500/10';
        titleColor = 'text-amber-900';
      } else if (type === 'error') {
        icon = '❌';
        bgBorder = 'bg-white/95 border-rose-200 text-slate-800 shadow-rose-500/10';
        titleColor = 'text-rose-900';
      } else if (type === 'info') {
        icon = 'ℹ️';
        bgBorder = 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-500/10';
        titleColor = 'text-slate-900';
      }

      toast.className += ` ${bgBorder}`;
      toast.innerHTML = `
        <span class="text-xl flex-shrink-0 mt-0.5">${icon}</span>
        <div class="flex-grow space-y-0.5">
          ${title ? `<div class="font-black ${titleColor} text-[13px] leading-tight">${title}</div>` : ''}
          <div class="text-slate-600 leading-snug font-medium">${message}</div>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm leading-none flex-shrink-0">✕</button>
      `;

      container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
      });

      const timer = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, duration);

      toast.addEventListener('mouseenter', () => clearTimeout(timer));
    },

    showLoading(options = {}) {
      const modal = document.getElementById('modal-espera-visual');
      if (!modal) return;

      const iconEl = document.getElementById('global-wait-icon');
      const titleEl = document.getElementById('global-wait-title');
      const subEl = document.getElementById('global-wait-subtitle');
      const step1El = document.getElementById('global-wait-step1');
      const step2El = document.getElementById('global-wait-step2');
      const step3El = document.getElementById('global-wait-step3');

      if (iconEl) iconEl.textContent = options.icon || "📊";
      if (titleEl) titleEl.textContent = options.title || "Carregando Dados...";
      if (subEl) subEl.textContent = options.subtitle || "Sincronizando registros em tempo real com o servidor";
      if (step1El) step1El.textContent = options.step1 || "Conexão segura com a nuvem estabelecida";
      if (step2El) step2El.textContent = options.step2 || "Consultando dados...";
      if (step3El) step3El.textContent = options.step3 || "Preparando exibição e atualizando painel";

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    },

    hideLoading() {
      const modal = document.getElementById('modal-espera-visual');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    navigate(view) {
      if (view === 'saude') view = 'saude_links';
      if (window.location.hash === '#' + view) {
        app.router.handleRoute();
      } else {
        window.location.hash = view;
      }
    },

    updateActiveMenu() {
      const nav = document.getElementById('main-nav');
      if (!nav) return;

      const isLanding = app.state.view === 'landing';
      if (isLanding) {
        nav.innerHTML = '';
        return;
      }

      const isPortal = app.state.view === 'saude_links';
      const isAuditoria = app.state.view === 'auditoria_hub' || app.state.view === 'auditoria_detalhe';
      const isDotacoes = app.state.view === 'dotacoes_hub';
      const isContratos = app.state.view === 'contratos_hub';

      const canAudit = !app.state.auth.isLogged || app.permissions.can('audit_access');
      const canDot = !app.state.auth.isLogged || app.permissions.can('dotacoes_access');
      const canPanel = !app.state.auth.isLogged || app.permissions.can('panel_access');

      const auditBtnClass = canAudit
        ? (isAuditoria ? 'bg-blue-100 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold')
        : 'text-white/30 cursor-not-allowed hover:bg-transparent';
      const auditClick = canAudit
        ? `app.ui.navigate('auditoria_exames')`
        : `app.ui.toast('Seu perfil não tem permissão para acessar a área de Auditoria.', 'warning', 'Acesso Restrito')`;

      const dotBtnClass = canDot
        ? (isDotacoes ? 'bg-emerald-100 text-emerald-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold')
        : 'text-white/30 cursor-not-allowed hover:bg-transparent';
      const dotClick = canDot
        ? `app.ui.navigate('dotacoes')`
        : `app.ui.toast('Seu perfil não tem permissão para acessar a área de Dotações.', 'warning', 'Acesso Restrito')`;

      const panelBtnClass = canPanel
        ? (isContratos ? 'bg-indigo-100 text-indigo-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold')
        : 'text-white/30 cursor-not-allowed hover:bg-transparent';
      const panelClick = canPanel
        ? `app.ui.navigate('contratos')`
        : `app.ui.toast('Seu perfil não tem permissão para acessar o Painel de Contratos LDO.', 'warning', 'Acesso Restrito')`;

      nav.innerHTML = `
        <button onclick="app.ui.navigate('landing')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 font-semibold text-[11px] sm:text-xs">
          Início
        </button>
        <button onclick="app.ui.navigate('saude_links')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${isPortal ? 'bg-blue-100 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'} text-[11px] sm:text-xs">
          Saúde
        </button>
        <button onclick="${auditClick}" title="${canAudit ? 'Auditoria de Exames' : 'Módulo desabilitado para o seu perfil'}" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${auditBtnClass} text-[11px] sm:text-xs">
          ${!canAudit ? '🔒 ' : ''}Auditoria
        </button>
        <button onclick="${dotClick}" title="${canDot ? 'Livro de Dotações' : 'Módulo desabilitado para o seu perfil'}" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${dotBtnClass} text-[11px] sm:text-xs">
          ${!canDot ? '🔒 ' : ''}Dotações
        </button>
        <button onclick="${panelClick}" title="${canPanel ? 'Painel de Contratos LDO' : 'Módulo desabilitado para o seu perfil'}" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${panelBtnClass} text-[11px] sm:text-xs">
          ${!canPanel ? '🔒 ' : ''}Contratos LDO
        </button>
      `;
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

  admin: {
    isAdminUser() {
      return app.state.auth.isLogged && app.state.auth.user && app.state.auth.user.perfil === 'Administrador';
    },

    isGestorFinanceiro() {
      return app.state.auth.isLogged && app.state.auth.user && 
             (app.state.auth.user.perfil === 'Gestor Financeiro' || app.state.auth.user.perfil === 'Administrador');
    },

    trigger(directToContract = false) {
      if (!app.state.auth.isLogged) {
        app.auditAuth.promptLogin('landing');
        return;
      }
      this.openPanel(directToContract);
    },

    openPanel(directToContract = false) {
      const panel = document.getElementById('admin-panel');
      if (!panel) return;
      panel.classList.remove('hidden');

      const isMasterAdmin = this.isAdminUser();

      const btnUsuarios = document.getElementById('admin-tab-btn-usuarios');
      const viewUsuarios = document.getElementById('admin-view-usuarios');
      const btnPermissoes = document.getElementById('admin-tab-btn-permissoes');
      const viewPermissoes = document.getElementById('admin-view-permissoes');
      const btnLogs = document.getElementById('admin-tab-btn-logs');
      const viewLogs = document.getElementById('admin-view-logs');

      if (btnUsuarios) btnUsuarios.style.display = isMasterAdmin ? 'inline-block' : 'none';
      if (btnPermissoes) btnPermissoes.style.display = isMasterAdmin ? 'inline-block' : 'none';
      if (btnLogs) btnLogs.style.display = isMasterAdmin ? 'inline-block' : 'none';

      if (!isMasterAdmin) {
        if (viewUsuarios) viewUsuarios.classList.add('hidden');
        if (viewPermissoes) viewPermissoes.classList.add('hidden');
        if (viewLogs) viewLogs.classList.add('hidden');
      }

      if (directToContract) this.switchTab('contrato');
      else this.switchTab('links');

      this.renderLinksList();
      if (app.audit) app.audit.renderExamsListAdmin();
      if (isMasterAdmin) {
        this.loadUsersList();
        this.renderPermissionsMatrix();
      }
    },

    exit() {
      const panel = document.getElementById('admin-panel');
      if (panel) panel.classList.add('hidden');
      app.render.all();
    },

    switchTab(tab) {
      if ((tab === 'usuarios' || tab === 'permissoes' || tab === 'logs') && !this.isAdminUser()) {
        this.switchTab('contrato');
        return;
      }

      const vLinks = document.getElementById('admin-view-links');
      const vContrato = document.getElementById('admin-view-contrato');
      const vUsuarios = document.getElementById('admin-view-usuarios');
      const vPerms = document.getElementById('admin-view-permissoes');
      const vLogs = document.getElementById('admin-view-logs');

      const bLinks = document.getElementById('admin-tab-btn-links');
      const bContrato = document.getElementById('admin-tab-btn-contrato');
      const bUsuarios = document.getElementById('admin-tab-btn-usuarios');
      const bPerms = document.getElementById('admin-tab-btn-permissoes');
      const bLogs = document.getElementById('admin-tab-btn-logs');

      [vLinks, vContrato, vUsuarios, vPerms, vLogs].forEach(v => v && v.classList.add('hidden'));
      [bLinks, bContrato, bUsuarios, bPerms, bLogs].forEach(b => {
        if (b) b.className = "px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600 whitespace-nowrap";
      });

      if (tab === 'links' && vLinks) {
        vLinks.classList.remove('hidden');
        bLinks.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600 whitespace-nowrap";
      } else if (tab === 'contrato' && vContrato) {
        vContrato.classList.remove('hidden');
        bContrato.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600 whitespace-nowrap";
      } else if (tab === 'usuarios' && vUsuarios) {
        vUsuarios.classList.remove('hidden');
        bUsuarios.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600 whitespace-nowrap";
        this.loadUsersList();
      } else if (tab === 'permissoes' && vPerms) {
        vPerms.classList.remove('hidden');
        bPerms.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600 whitespace-nowrap";
        this.renderPermissionsMatrix();
      } else if (tab === 'logs' && vLogs) {
        vLogs.classList.remove('hidden');
        bLogs.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600 whitespace-nowrap";
        this.loadAuditLogs();
      }
    },

    renderPermissionsMatrix() {
      const perms = app.state.permissions || DEFAULT_PERMISSIONS;
      const keys = [
        'audit_access', 'audit_edit_values', 'audit_create_contract', 'audit_manage_procedures',
        'dotacoes_access', 'dotacoes_create', 'dotacoes_check', 'dotacoes_edit', 'dotacoes_delete',
        'panel_access', 'panel_create', 'panel_edit', 'panel_archive'
      ];

      const getVal = (role, k) => {
        if (perms[role] && perms[role][k] !== undefined) return !!perms[role][k];
        return !!(DEFAULT_PERMISSIONS[role] && DEFAULT_PERMISSIONS[role][k]);
      };

      keys.forEach(k => {
        const compEl = document.getElementById(`perm-comprador-${k}`);
        const gestEl = document.getElementById(`perm-gestor-${k}`);
        const visEl = document.getElementById(`perm-visualizador-${k}`);

        if (compEl) compEl.checked = getVal('Comprador', k);
        if (gestEl) gestEl.checked = getVal('Gestor Financeiro', k);
        if (visEl) visEl.checked = getVal('Visualizador', k);
      });

      this.updatePermMatrixState();
    },

    updatePermMatrixState() {
      const profiles = ['comprador', 'gestor', 'visualizador'];
      const modules = [
        { master: 'audit_access', subs: ['audit_edit_values', 'audit_create_contract', 'audit_manage_procedures'] },
        { master: 'dotacoes_access', subs: ['dotacoes_create', 'dotacoes_check', 'dotacoes_edit', 'dotacoes_delete'] },
        { master: 'panel_access', subs: ['panel_create', 'panel_edit', 'panel_archive'] }
      ];

      profiles.forEach(prof => {
        modules.forEach(mod => {
          const masterEl = document.getElementById(`perm-${prof}-${mod.master}`);
          const isAllowed = masterEl ? masterEl.checked : false;

          mod.subs.forEach(subKey => {
            const subEl = document.getElementById(`perm-${prof}-${subKey}`);
            if (subEl) {
              subEl.disabled = !isAllowed;
              const parentTd = subEl.closest('td');
              if (parentTd) {
                if (!isAllowed) {
                  parentTd.classList.add('opacity-30', 'cursor-not-allowed');
                } else {
                  parentTd.classList.remove('opacity-30', 'cursor-not-allowed');
                }
              }
            }
          });
        });
      });
    },

    async savePermissions() {
      if (!this.isAdminUser()) {
        return app.ui.toast("Apenas o Administrador tem permissão para alterar a matriz de segurança.", "warning", "Acesso Restrito");
      }

      const keys = [
        'audit_access', 'audit_edit_values', 'audit_create_contract', 'audit_manage_procedures',
        'dotacoes_access', 'dotacoes_create', 'dotacoes_check', 'dotacoes_edit', 'dotacoes_delete',
        'panel_access', 'panel_create', 'panel_edit', 'panel_archive'
      ];

      const newPerms = { 'Comprador': {}, 'Gestor Financeiro': {}, 'Visualizador': {} };

      keys.forEach(k => {
        const compEl = document.getElementById(`perm-comprador-${k}`);
        const gestEl = document.getElementById(`perm-gestor-${k}`);
        const visEl = document.getElementById(`perm-visualizador-${k}`);

        newPerms['Comprador'][k] = compEl ? compEl.checked : false;
        newPerms['Gestor Financeiro'][k] = gestEl ? gestEl.checked : false;
        newPerms['Visualizador'][k] = visEl ? visEl.checked : false;
      });

      app.state.permissions = newPerms;
      app.data.saveLocalPermissions();
      app.ui.setSyncStatus(true, "Salvando permissões...");

      await app.data.sendToCloud({
        action: "SAVE_PERMISSIONS",
        permissions: newPerms
      });

      app.ui.toast("Matriz de Permissões salva com sucesso!", "success", "✓ Permissões Atualizadas");

      // Atualiza visualização imediatamente se o usuário estiver na tela de Saúde ou no menu
      if (app.state.view === 'saude_links') app.render.all();
      app.ui.updateActiveMenu();
    },

    renderUsersRows() {
      const tbody = document.getElementById('adm-users-list-tbody');
      if (!tbody) return;

      const users = app.state.users || [];
      if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400 text-xs">Nenhum usuário cadastrado no momento. Preencha o formulário acima para cadastrar o primeiro.</td></tr>`;
        return;
      }

      tbody.innerHTML = users.map(u => `
        <tr class="hover:bg-blue-50/60 transition cursor-pointer group" onclick="app.admin.editUser(${u.id})" title="Clique para editar este usuário">
          <td class="p-3.5 font-bold text-slate-800 group-hover:text-blue-600 transition flex items-center gap-1.5">
            <span>✏️</span>
            <span>${u.nome || u.usuario}</span>
          </td>
          <td class="p-3.5 font-mono text-blue-700 font-bold">${u.usuario}</td>
          <td class="p-3.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.perfil === 'Administrador' ? 'bg-purple-100 text-purple-800' : (u.perfil === 'Gestor Financeiro' ? 'bg-emerald-100 text-emerald-800' : (u.perfil === 'Visualizador' ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-slate-100 text-slate-700'))}">${u.perfil}</span></td>
          <td class="p-3.5 text-slate-400">${u.createdAt || "—"}</td>
          <td class="p-3.5 text-center whitespace-nowrap" onclick="event.stopPropagation()">
            <button onclick="app.admin.editUser(${u.id})" class="text-amber-600 hover:text-amber-800 font-bold mr-2 text-xs">Editar</button>
            <button onclick="app.admin.openResetPasswordModal(${u.id}, '${u.usuario}')" class="text-blue-600 hover:text-blue-800 font-bold mr-2 text-xs">🔑 Senha</button>
            <button onclick="app.admin.openDeleteUserModal(${u.id}, '${u.usuario}')" class="text-rose-500 hover:text-rose-700 font-bold text-xs">Excluir</button>
          </td>
        </tr>
      `).join('');
    },

    async loadUsersList() {
      if (!this.isAdminUser()) return;
      const tbody = document.getElementById('adm-users-list-tbody');
      if (!tbody) return;

      if (app.state.users && app.state.users.length > 0) {
        this.renderUsersRows();
      } else {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">Carregando usuários do sistema...</td></tr>`;
      }

      try {
        const res = await fetch(`${GOOGLE_API_URL}?action=GET_USERS`, { redirect: 'follow' });
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.users)) {
          app.state.users = data.users;
          this.renderUsersRows();
        } else {
          throw new Error(data.message || "Resposta inválida");
        }
      } catch (err) {
        console.error("Erro na leitura de usuários:", err);
        if (!app.state.users || app.state.users.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" class="p-4 text-center text-rose-500">
                <b>Não foi possível carregar a lista de usuários em tempo real.</b><br>
                <span class="text-slate-400 text-[11px]">Verifique a conexão com o servidor de dados e tente novamente.</span>
              </td>
            </tr>
          `;
        }
      }
    },

    openFeedbackModal(loadingTitle) {
      const modal = document.getElementById('modal-feedback-usuario');
      const loadBox = document.getElementById('user-feedback-loading');
      const succBox = document.getElementById('user-feedback-success');
      const errBox = document.getElementById('user-feedback-error');
      const loadTitle = document.getElementById('user-feedback-loading-title');

      if (!modal) return;
      if (loadTitle) loadTitle.textContent = loadingTitle || "Salvando dados do usuário...";
      if (loadBox) loadBox.classList.remove('hidden');
      if (succBox) succBox.classList.add('hidden');
      if (errBox) errBox.classList.add('hidden');

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    },

    setFeedbackSuccess(title, nome, login, perfil) {
      const loadBox = document.getElementById('user-feedback-loading');
      const succBox = document.getElementById('user-feedback-success');
      const succTitle = document.getElementById('user-feedback-success-title');
      const resNome = document.getElementById('ufb-res-nome');
      const resLogin = document.getElementById('ufb-res-login');
      const resPerfil = document.getElementById('ufb-res-perfil');

      if (loadBox) loadBox.classList.add('hidden');
      if (succTitle) succTitle.textContent = title;
      if (resNome) resNome.textContent = nome || login;
      if (resLogin) resLogin.textContent = `@${login}`;
      if (resPerfil) resPerfil.textContent = perfil;
      if (succBox) succBox.classList.remove('hidden');
    },

    setFeedbackError(errorMsg) {
      const loadBox = document.getElementById('user-feedback-loading');
      const succBox = document.getElementById('user-feedback-success');
      const errBox = document.getElementById('user-feedback-error');
      const msgEl = document.getElementById('user-feedback-error-msg');

      if (loadBox) loadBox.classList.add('hidden');
      if (succBox) succBox.classList.add('hidden');
      if (msgEl) msgEl.textContent = errorMsg || "Não foi possível sincronizar com o Google Apps Script.";
      if (errBox) errBox.classList.remove('hidden');
    },

    closeFeedbackModal() {
      const modal = document.getElementById('modal-feedback-usuario');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    finishUserModal(closeAndReset = true) {
      this.closeFeedbackModal();
      this.resetUserForm();
      if (!closeAndReset) {
        setTimeout(() => {
          const nomeField = document.getElementById('user-field-nome');
          if (nomeField) nomeField.focus();
        }, 120);
      }
    },

    editUser(id) {
      if (!this.isAdminUser()) return;
      const u = (app.state.users || []).find(x => Number(x.id) === Number(id));
      if (!u) return;

      document.getElementById('user-edit-id').value = u.id;
      document.getElementById('user-field-nome').value = u.nome || u.usuario;
      document.getElementById('user-field-login').value = u.usuario;
      document.getElementById('user-field-senha').value = '****';
      document.getElementById('user-field-perfil').value = u.perfil || 'Comprador';

      document.getElementById('user-form-title-label').textContent = `Editando Usuário: ${u.usuario}`;
      document.getElementById('btn-save-user').textContent = "Atualizar Usuário";
      document.getElementById('btn-cancel-edit-user').classList.remove('hidden');

      const nomeField = document.getElementById('user-field-nome');
      if (nomeField) {
        nomeField.focus();
        nomeField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },

    resetUserForm() {
      const editIdEl = document.getElementById('user-edit-id');
      const nomeEl = document.getElementById('user-field-nome');
      const loginEl = document.getElementById('user-field-login');
      const senhaEl = document.getElementById('user-field-senha');
      const perfilEl = document.getElementById('user-field-perfil');
      const labelEl = document.getElementById('user-form-title-label');
      const btnSave = document.getElementById('btn-save-user');
      const btnCancel = document.getElementById('btn-cancel-edit-user');

      if (editIdEl) editIdEl.value = '';
      if (nomeEl) nomeEl.value = '';
      if (loginEl) loginEl.value = '';
      if (senhaEl) senhaEl.value = '';
      if (perfilEl) perfilEl.value = 'Comprador';
      if (labelEl) labelEl.textContent = "Cadastrar Novo Usuário";
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.textContent = "Cadastrar Usuário";
      }
      if (btnCancel) btnCancel.classList.add('hidden');
    },

    async saveUser() {
      if (!this.isAdminUser()) {
        return app.ui.toast("Apenas Administrador pode cadastrar ou alterar usuários.", "warning", "Acesso Restrito");
      }

      const editId = (document.getElementById('user-edit-id')?.value || '').trim();
      const nome = (document.getElementById('user-field-nome')?.value || '').trim();
      const usuario = (document.getElementById('user-field-login')?.value || '').trim().toLowerCase();
      const senha = (document.getElementById('user-field-senha')?.value || '').trim();
      const perfil = document.getElementById('user-field-perfil')?.value || 'Comprador';
      const btnSave = document.getElementById('btn-save-user');

      if (!usuario) {
        return app.ui.toast("Preencha o nome de usuário (login).", "warning", "Campo Obrigatório");
      }

      if (!editId && !senha) {
        return app.ui.toast("Preencha uma senha inicial para o novo usuário.", "warning", "Campo Obrigatório");
      }

      const isEdit = !!editId;

      // Feedback IMEDIATO no botão
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = `<span class="inline-block animate-spin mr-1.5">⏳</span> ${isEdit ? 'Atualizando...' : 'Gravando...'}`;
      }

      // Abre IMEDIATAMENTE o modal de progresso
      const modalTitle = isEdit 
        ? `Atualizando "${usuario}" no sistema...`
        : `Gravando "${usuario}" no sistema...`;
      this.openFeedbackModal(modalTitle);

      try {
        const now = new Date();
        const createdAt = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

        // Atualização Otimista no estado local e tabela imediata
        if (isEdit) {
          const uIdx = (app.state.users || []).findIndex(u => Number(u.id) === Number(editId));
          if (uIdx !== -1) {
            app.state.users[uIdx].usuario = usuario;
            app.state.users[uIdx].nome = nome || usuario;
            app.state.users[uIdx].perfil = perfil;
          }
        } else {
          app.state.users = app.state.users || [];
          app.state.users.unshift({
            id: Date.now(),
            usuario,
            nome: nome || usuario,
            perfil,
            createdAt
          });
        }
        this.renderUsersRows();

        // Envia para o servidor em nuvem em segundo plano
        await app.data.sendToCloud({
          action: isEdit ? "UPDATE_USER" : "CREATE_USER",
          id: isEdit ? Number(editId) : undefined,
          usuario,
          senha,
          nome: nome || usuario,
          perfil,
          createdAt
        });

        // Transiciona o modal para o estado de SUCESSO!
        this.setFeedbackSuccess(
          isEdit ? "Usuário Atualizado com Sucesso!" : "Usuário Cadastrado com Sucesso!",
          nome || usuario,
          usuario,
          perfil
        );

        app.ui.toast(`Usuário "${usuario}" (${perfil}) salvo com sucesso!`, "success", "✓ Pronto");

      } catch (err) {
        console.error("Erro ao salvar usuário:", err);
        this.setFeedbackError("Ocorreu um erro ao sincronizar com o servidor. Verifique sua conexão e tente novamente.");
        app.ui.toast("Erro ao salvar usuário no servidor.", "error", "Falha de Conexão");
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.textContent = isEdit ? "Atualizar Usuário" : "Cadastrar Usuário";
        }
      }
    },

    openDeleteUserModal(id, usuario) {
      if (!this.isAdminUser()) {
        return app.ui.toast("Apenas Administrador pode excluir usuários.", "warning", "Acesso Restrito");
      }

      const modal = document.getElementById('modal-confirm-delete-user');
      const targetUser = (app.state.users || []).find(u => Number(u.id) === Number(id));

      const idEl = document.getElementById('del-user-target-id');
      const nameEl = document.getElementById('del-user-name');
      const loginEl = document.getElementById('del-user-login');

      if (idEl) idEl.value = id;
      if (nameEl) nameEl.textContent = targetUser?.nome || usuario;
      if (loginEl) loginEl.textContent = `@${usuario}`;

      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    },

    closeDeleteUserModal() {
      const modal = document.getElementById('modal-confirm-delete-user');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    async confirmDeleteUser() {
      const id = Number(document.getElementById('del-user-target-id')?.value);
      this.closeDeleteUserModal();

      const targetUser = (app.state.users || []).find(u => Number(u.id) === id);
      const usuario = targetUser?.usuario || 'usuário';

      // Atualização otimista imediata na tabela
      app.state.users = (app.state.users || []).filter(u => Number(u.id) !== id);
      this.renderUsersRows();

      app.ui.toast(`Usuário "${usuario}" removido do sistema.`, "info", "✓ Usuário Excluído");

      await app.data.sendToCloud({
        action: "DELETE_USER",
        id: id
      });
    },

    openResetPasswordModal(id, usuario) {
      if (!this.isAdminUser()) {
        return app.ui.toast("Apenas Administrador pode alterar senhas.", "warning", "Acesso Restrito");
      }

      const modal = document.getElementById('modal-reset-password');
      const targetUserEl = document.getElementById('reset-pass-target-user');
      const targetIdEl = document.getElementById('reset-pass-target-id');
      const inputEl = document.getElementById('reset-pass-new-password');

      if (targetUserEl) targetUserEl.textContent = usuario;
      if (targetIdEl) targetIdEl.value = id;
      if (inputEl) inputEl.value = '';

      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => { if (inputEl) inputEl.focus(); }, 80);
      }
    },

    closeResetPasswordModal() {
      const modal = document.getElementById('modal-reset-password');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    async confirmResetPassword(e) {
      e.preventDefault();
      if (!this.isAdminUser()) {
        return app.ui.toast("Apenas Administrador pode alterar senhas.", "warning", "Acesso Restrito");
      }

      const id = Number(document.getElementById('reset-pass-target-id').value);
      const newPassword = document.getElementById('reset-pass-new-password').value.trim();
      const usuario = document.getElementById('reset-pass-target-user').textContent;

      if (!newPassword || newPassword.length < 4) {
        return app.ui.toast("A senha deve ter pelo menos 4 caracteres.", "warning", "Senha Curta");
      }

      this.closeResetPasswordModal();
      app.ui.toast(`Atualizando senha do usuário "${usuario}" na nuvem...`, "info", "Gravando");

      await app.data.sendToCloud({
        action: "UPDATE_USER_PASSWORD",
        id: id,
        newPassword: newPassword
      });

      app.ui.toast(`Senha do usuário "${usuario}" alterada com sucesso!`, "success", "✓ Senha Atualizada");
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
        item.addEventListener('dragstart', () => { startIndex = +item.dataset.index; item.classList.add('dragging'); });
        item.addEventListener('dragover', (e) => { e.preventDefault(); item.classList.add('drag-over'); });
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.addEventListener('drop', async () => {
          const endIndex = +item.dataset.index;
          const moving = app.state.links.splice(startIndex, 1)[0];
          app.state.links.splice(endIndex, 0, moving);
          app.data.saveLinksLocally();
          app.admin.renderLinksList();
          await app.data.sendToCloud({ action: "SAVE_SHORTCUTS", shortcuts: app.state.links });
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
      });
    },

    async saveLink() {
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

      app.data.saveLinksLocally();
      this.resetForm();
      this.renderLinksList();
      await app.data.sendToCloud({ action: "SAVE_SHORTCUTS", shortcuts: app.state.links });
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

    async removeLink(id) {
      if (confirm("Excluir este atalho permanentemente?")) {
        app.state.links = app.state.links.filter(l => l.id !== id);
        app.data.saveLinksLocally();
        this.renderLinksList();
        await app.data.sendToCloud({ action: "SAVE_SHORTCUTS", shortcuts: app.state.links });
      }
    },

    // ------------------------------------------------------------------------
    // TRILHA DE AUDITORIA & GESTÃO DE LOGS INSTITUCIONAIS
    // ------------------------------------------------------------------------
    async loadAuditLogs(forceRefresh = false) {
      const tbody = document.getElementById('adm-logs-list-tbody');
      if (!tbody) return;

      if (!forceRefresh && app.state.auditLogs && app.state.auditLogs.length > 0) {
        this.populateUsersFilterLogs();
        this.renderAuditLogsTable();
        return;
      }

      if (app.ui && app.ui.showLoading) {
        app.ui.showLoading({
          title: "Carregando Trilha de Auditoria",
          subtitle: "Consultando dados do sistema",
          step1: "Conectando à base de logs de auditoria",
          step2: "Recuperando histórico de ações e usuários",
          step3: "Formatando linha do tempo institucional",
          icon: "📜"
        });
      }

      try {
        const logs = await app.data.fetchAuditLogs(500);
        app.state.auditLogs = logs || [];
        this.populateUsersFilterLogs();
        this.renderAuditLogsTable();
      } catch (err) {
        console.error("Erro ao carregar logs:", err);
        app.ui.toast("Não foi possível carregar os logs da nuvem.", "danger", "Erro");
      } finally {
        if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
      }
    },

    populateUsersFilterLogs() {
      const selectUser = document.getElementById('adm-logs-filter-user');
      if (!selectUser) return;
      const currentVal = selectUser.value || 'todos';

      const setUsers = new Set();
      (app.state.auditLogs || []).forEach(l => { if (l.usuario) setUsers.add(l.usuario); });
      (app.state.users || []).forEach(u => { if (u.usuario) setUsers.add(u.usuario); });

      const sortedUsers = Array.from(setUsers).sort();
      selectUser.innerHTML = '<option value="todos">Todos os Usuários</option>' + 
        sortedUsers.map(u => `<option value="${u}" ${u === currentVal ? 'selected' : ''}>${u}</option>`).join('');
    },

    setAuditLogsFilter(key, val) {
      if (!app.state.auditLogsFilter) {
        app.state.auditLogsFilter = { search: '', user: 'todos', modulo: 'todos', data: '' };
      }
      app.state.auditLogsFilter[key] = val;
      this.renderAuditLogsTable();
    },

    renderAuditLogsTable() {
      const tbody = document.getElementById('adm-logs-list-tbody');
      const emptyEl = document.getElementById('adm-logs-empty');
      const countEl = document.getElementById('adm-logs-count-info');
      if (!tbody) return;

      const f = app.state.auditLogsFilter || { search: '', user: 'todos', modulo: 'todos', data: '' };
      const s = (f.search || '').trim().toLowerCase();
      const u = (f.user || 'todos').toLowerCase();
      const m = (f.modulo || 'todos').toLowerCase();
      const d = (f.data || '').trim();

      const filtered = (app.state.auditLogs || []).filter(log => {
        if (u !== 'todos' && String(log.usuario || '').toLowerCase() !== u) return false;
        if (m !== 'todos' && String(log.modulo || '').toLowerCase() !== m) return false;
        if (d) {
          const [ano, mes, dia] = d.split('-');
          const dataBr = `${dia}/${mes}/${ano}`;
          if (!String(log.dataHora || '').includes(dataBr)) return false;
        }
        if (s) {
          const searchable = `${log.dataHora} ${log.usuario} ${log.modulo} ${log.acao} ${log.detalhes} ${log.registroId}`.toLowerCase();
          if (!searchable.includes(s)) return false;
        }
        return true;
      });

      if (countEl) {
        countEl.textContent = `Exibindo ${filtered.length} de ${(app.state.auditLogs || []).length} registros`;
      }

      if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
      }

      if (emptyEl) emptyEl.classList.add('hidden');

      const moduloBadgeClass = (mod) => {
        const modNorm = String(mod || '').toLowerCase();
        if (modNorm.includes('dota')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (modNorm.includes('contrato')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        if (modNorm.includes('audit') || modNorm.includes('exame')) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (modNorm.includes('usuár') || modNorm.includes('permis')) return 'bg-purple-100 text-purple-800 border-purple-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
      };

      const acaoColorClass = (acao) => {
        const a = String(acao || '').toLowerCase();
        if (a.includes('excluir') || a.includes('cancelar')) return 'text-rose-600 font-black';
        if (a.includes('criar') || a.includes('cadastrar') || a.includes('validar') || a.includes('dotar')) return 'text-emerald-700 font-bold';
        if (a.includes('editar') || a.includes('redefinir') || a.includes('atualizar')) return 'text-amber-700 font-bold';
        if (a.includes('rebalancear')) return 'text-blue-700 font-black';
        return 'text-slate-800 font-semibold';
      };

      tbody.innerHTML = filtered.map(log => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
          <td class="p-3 font-mono font-medium text-slate-600 whitespace-nowrap text-[11px]">${log.dataHora || '—'}</td>
          <td class="p-3 font-bold text-slate-900 whitespace-nowrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]">
              👤 ${log.usuario || 'sistema'}
            </span>
          </td>
          <td class="p-3 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${moduloBadgeClass(log.modulo)}">
              ${log.modulo || 'Geral'}
            </span>
          </td>
          <td class="p-3 ${acaoColorClass(log.acao)} whitespace-nowrap">${log.acao || '—'}</td>
          <td class="p-3 text-slate-700 leading-snug max-w-md break-words">${log.detalhes || '—'}</td>
          <td class="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">${log.registroId || '—'}</td>
        </tr>
      `).join('');
    },

    exportAuditLogsReport() {
      const f = app.state.auditLogsFilter || { search: '', user: 'todos', modulo: 'todos', data: '' };
      const s = (f.search || '').trim().toLowerCase();
      const u = (f.user || 'todos').toLowerCase();
      const m = (f.modulo || 'todos').toLowerCase();
      const d = (f.data || '').trim();

      const filtered = (app.state.auditLogs || []).filter(log => {
        if (u !== 'todos' && String(log.usuario || '').toLowerCase() !== u) return false;
        if (m !== 'todos' && String(log.modulo || '').toLowerCase() !== m) return false;
        if (d) {
          const [ano, mes, dia] = d.split('-');
          const dataBr = `${dia}/${mes}/${ano}`;
          if (!String(log.dataHora || '').includes(dataBr)) return false;
        }
        if (s) {
          const searchable = `${log.dataHora} ${log.usuario} ${log.modulo} ${log.acao} ${log.detalhes} ${log.registroId}`.toLowerCase();
          if (!searchable.includes(s)) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        return app.ui.toast("Nenhum registro encontrado para exportar com os filtros atuais.", "warning", "Relatório Vazio");
      }

      const now = new Date();
      const emissao = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      const adminName = (app.state.auth.user && (app.state.auth.user.nome || app.state.auth.user.usuario)) || 'Administrador';

      const win = window.open('', '_blank');
      if (!win) return app.ui.toast("Permita pop-ups no seu navegador para imprimir o relatório.", "warning", "Pop-up Bloqueado");

      const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Relatório Oficial de Auditoria e Logs - Prefeitura de Torres</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 10px; color: #1e293b; margin: 0; padding: 8px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px; }
            .header-title h1 { margin: 0; font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
            .header-title p { margin: 2px 0 0; font-size: 10px; color: #64748b; font-weight: bold; }
            .header-meta { text-align: right; font-size: 9px; color: #475569; }
            .kpis { display: flex; gap: 15px; margin-bottom: 10px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 9px; }
            .kpis span { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            th { background: #0f172a; color: white; text-align: left; padding: 5px 6px; font-weight: 800; text-transform: uppercase; font-size: 8px; }
            td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            tr:nth-child(even) td { background: #f8fafc; }
            .footer { margin-top: 15px; border-top: 1px solid #cbd5e1; padding-top: 6px; font-size: 8px; color: #64748b; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-title">
              <h1>Prefeitura Municipal de Torres • Secretaria Municipal de Saúde</h1>
              <p>Relatório de Trilha de Auditoria & Registro de Logs Institucionais</p>
            </div>
            <div class="header-meta">
              <div>Emitido em: <strong>${emissao}</strong></div>
              <div>Solicitado por: <strong>${adminName}</strong></div>
            </div>
          </div>

          <div class="kpis">
            <div>Total de Registros Impressos: <span>${filtered.length}</span></div>
            <div>Filtro Usuário: <span>${u === 'todos' ? 'Todos' : u}</span></div>
            <div>Filtro Módulo: <span>${m === 'todos' ? 'Todos' : m}</span></div>
            <div>Período: <span>${d ? d : 'Histórico Completo'}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 130px;">Data / Hora</th>
                <th style="width: 90px;">Usuário</th>
                <th style="width: 90px;">Módulo</th>
                <th style="width: 120px;">Ação</th>
                <th>Detalhes da Operação Realizada</th>
                <th style="width: 75px;">Ref / ID</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(l => `
                <tr>
                  <td style="font-family: monospace;">${l.dataHora}</td>
                  <td><strong>${l.usuario}</strong></td>
                  <td>${l.modulo}</td>
                  <td>${l.acao}</td>
                  <td>${l.detalhes}</td>
                  <td style="font-family: monospace;">${l.registroId || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <span>Sistema Integrado de Gestão da Saúde - Prefeitura de Torres</span>
            <span>Documento Oficial de Controle Interno e Auditoria</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;
      win.document.open();
      win.document.write(html);
      win.document.close();
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

      if (app.state.view === 'landing') this.landing(vp);
      else if (app.state.view === 'saude_links') this.saudeLinks(vp);
      else if (app.state.view === 'auditoria_hub' && app.render.auditoriaHub) app.render.auditoriaHub(vp);
      else if (app.state.view === 'auditoria_detalhe' && app.render.auditoriaDetalhe) app.render.auditoriaDetalhe(vp);
      else if (app.state.view === 'dotacoes_hub' && app.render.dotacoesHub) app.render.dotacoesHub(vp);
      else if (app.state.view === 'contratos_hub' && app.render.contratosHub) app.render.contratosHub(vp);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    landing(el) {
      el.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 fade-in">
            <div class="mb-10 text-center max-w-2xl">
                <div class="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full shadow-2xl flex items-center justify-center p-3 mb-6 mx-auto border-4 border-slate-100">
                    <img src="Logo_Torres_100x100.webp" 
                         alt="Prefeitura de Torres" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" 
                         class="max-w-full h-auto object-contain">
                    <svg class="w-14 h-14 text-blue-800 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h1 class="text-2xl md:text-4xl font-black text-torres-dark uppercase tracking-tight">Prefeitura Municipal de Torres</h1>
                <p class="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">Portal Interno de Serviços</p>
                <div class="h-1 w-20 bg-blue-600 mx-auto mt-3 rounded-full"></div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full">
                <!-- 1. SAÚDE -->
                <button onclick="app.ui.navigate('saude_links')" class="card-landing text-left bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-blue-500 flex flex-col justify-between group">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Disponível</span>
                        </div>
                        <h2 class="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition">Saúde</h2>
                        <p class="text-slate-500 font-medium text-xs leading-relaxed">Central de sistemas, ferramentas institucionais, livro de dotações e auditoria de contratos.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-blue-600">
                        <span>Acessar Saúde</span>
                        <span class="group-hover:translate-x-1.5 transition">→</span>
                    </div>
                </button>

                <!-- 2. PESQUISA DE ATAS & LICITAÇÕES (EM BREVE) -->
                <div class="bg-white/80 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between opacity-85 select-none">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">EM BREVE</span>
                        </div>
                        <h2 class="text-xl font-bold text-slate-700 mb-2">Pesquisa de Atas & Licitações</h2>
                        <p class="text-slate-400 font-medium text-xs leading-relaxed">Mural unificado para consulta de atas vigentes e processos em andamento entre todas as secretarias.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">Módulo Municipal em Implantação</div>
                </div>

                <!-- 3. EDUCAÇÃO (EM BREVE) -->
                <div class="bg-white/80 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between opacity-85 select-none">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">EM BREVE</span>
                        </div>
                        <h2 class="text-xl font-bold text-slate-700 mb-2">Educação</h2>
                        <p class="text-slate-400 font-medium text-xs leading-relaxed">Gestão escolar, transporte de alunos, alimentação e vagas da rede municipal.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">Ambiente em Implantação</div>
                </div>

                <!-- 4. TURISMO E CULTURA (EM BREVE) -->
                <div class="bg-white/80 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between opacity-85 select-none">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">EM BREVE</span>
                        </div>
                        <h2 class="text-xl font-bold text-slate-700 mb-2">Turismo e Cultura</h2>
                        <p class="text-slate-400 font-medium text-xs leading-relaxed">Calendário oficial de eventos, patrimônio histórico e cadastro turístico de Torres.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">Ambiente em Implantação</div>
                </div>

                <!-- 5. ADMINISTRAÇÃO GERAL (EM BREVE) -->
                <div class="bg-white/80 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between opacity-85 select-none">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">EM BREVE</span>
                        </div>
                        <h2 class="text-xl font-bold text-slate-700 mb-2">Administração Geral</h2>
                        <p class="text-slate-400 font-medium text-xs leading-relaxed">Protocolo municipal, transparência pública, certidões e processos eletrônicos.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">Ambiente em Implantação</div>
                </div>
            </div>
        </div>
      `;
    },

    saudeLinks(el) {
      const canAudit = !app.state.auth.isLogged || app.permissions.can('audit_access');
      const canDotacoes = !app.state.auth.isLogged || app.permissions.can('dotacoes_access');
      const canContratos = !app.state.auth.isLogged || app.permissions.can('panel_access');

      el.innerHTML = `
        <div class="bg-torres-dark py-8 px-6 shadow-xl">
            <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="app.ui.navigate('landing')" class="p-2 hover:bg-white/10 rounded-full text-white transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h2 class="text-xl font-black text-white leading-none">SAÚDE</h2>
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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- CARD 1: AUDITORIA -->
                ${canAudit ? `
                <button onclick="app.ui.navigate('auditoria_exames')" 
                   class="text-left bg-white p-8 rounded-[2.5rem] border-2 border-blue-500 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between relative overflow-hidden ring-4 ring-blue-50/60">
                    <div class="absolute top-4 right-5">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">Gestão & Auditoria</span>
                    </div>
                    <div>
                        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        </div>
                        <h3 class="font-black text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition">Auditoria de Cotas de Exames</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">Acesso protegido para conferência de contratos de laboratório e execução.</p>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                        <span>Acessar Auditoria</span>
                        <span class="group-hover:translate-x-1 transition">→</span>
                    </div>
                </button>
                ` : `
                <button onclick="app.ui.toast('Seu perfil não possui permissão para acessar a área de Auditoria.', 'warning', 'Acesso Restrito')" 
                   class="text-left bg-slate-100/90 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-300 shadow-none cursor-not-allowed opacity-45 grayscale transition-all flex flex-col justify-between relative overflow-hidden" title="Área Inacessível para o seu perfil">
                    <div class="absolute top-4 right-5">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 border border-slate-300 flex items-center gap-1">🔒 Inacessível</span>
                    </div>
                    <div>
                        <div class="w-12 h-12 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <h3 class="font-black text-slate-500 text-lg mb-1">Auditoria de Cotas de Exames</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">Módulo desabilitado pelo Administrador para o seu perfil de usuário.</p>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>🔒 Acesso Bloqueado</span>
                        <span>✕</span>
                    </div>
                </button>
                `}

                <!-- CARD 2: DOTAÇÕES -->
                ${canDotacoes ? `
                <button onclick="app.ui.navigate('dotacoes')" 
                   class="text-left bg-white p-8 rounded-[2.5rem] border-2 border-emerald-500 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between relative overflow-hidden ring-4 ring-emerald-50/60">
                    <div class="absolute top-4 right-5">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Livro Digital</span>
                    </div>
                    <div>
                        <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <h3 class="font-black text-slate-800 text-lg mb-1 group-hover:text-emerald-600 transition">Controle de Dotações (Pedidos)</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">Registro digital de pedidos de compras e baixa contábil pelo setor financeiro.</p>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                        <span>Abrir Livro Digital</span>
                        <span class="group-hover:translate-x-1 transition">→</span>
                    </div>
                </button>
                ` : `
                <button onclick="app.ui.toast('Seu perfil não possui permissão para acessar a área de Dotações.', 'warning', 'Acesso Restrito')" 
                   class="text-left bg-slate-100/90 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-300 shadow-none cursor-not-allowed opacity-45 grayscale transition-all flex flex-col justify-between relative overflow-hidden" title="Área Inacessível para o seu perfil">
                    <div class="absolute top-4 right-5">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 border border-slate-300 flex items-center gap-1">🔒 Inacessível</span>
                    </div>
                    <div>
                        <div class="w-12 h-12 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <h3 class="font-black text-slate-500 text-lg mb-1">Controle de Dotações (Pedidos)</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">Módulo desabilitado pelo Administrador para o seu perfil de usuário.</p>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>🔒 Acesso Bloqueado</span>
                        <span>✕</span>
                    </div>
                </button>
                `}

                <!-- CARD 3: CONTRATOS GERAIS LDO -->
                ${canContratos ? `
                <button onclick="app.ui.navigate('contratos')" 
                   class="text-left bg-white p-8 rounded-[2.5rem] border-2 border-indigo-500 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between relative overflow-hidden ring-4 ring-indigo-50/60">
                    <div class="absolute top-4 right-5">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-200">Governança LDO</span>
                    </div>
                    <div>
                        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <h3 class="font-black text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition">Painel de Contratos (LDO)</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">Mural inteligente dos 42 contratos contínuos (R$ 14,2M), semáforo de alerta e apoio à LOA.</p>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                        <span>Acessar Mural Geral</span>
                        <span class="group-hover:translate-x-1 transition">→</span>
                    </div>
                </button>
                ` : `
                <button onclick="app.ui.toast('Seu perfil não possui permissão para acessar a área de Contratos.', 'warning', 'Acesso Restrito')" 
                   class="text-left bg-slate-100/90 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-300 shadow-none cursor-not-allowed opacity-45 grayscale transition-all flex flex-col justify-between relative overflow-hidden" title="Área Inacessível para o seu perfil">
                    <div class="absolute top-4 right-5">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 border border-slate-300 flex items-center gap-1">🔒 Inacessível</span>
                    </div>
                    <div>
                        <div class="w-12 h-12 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <h3 class="font-black text-slate-500 text-lg mb-1">Painel de Contratos (LDO)</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">Módulo desabilitado pelo Administrador para o seu perfil de usuário.</p>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>🔒 Acesso Bloqueado</span>
                        <span>✕</span>
                    </div>
                </button>
                `}

                <!-- LINKS SALVOS -->
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
    }
  }
});

window.addEventListener('DOMContentLoaded', () => app.init());
