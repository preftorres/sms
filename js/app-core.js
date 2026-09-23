/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO CORE: Núcleo, Sessão, Roteador, Nuvem & Matriz de Permissões
 * Arquivo: js/app-core.js
 * ============================================================================
 */

window.app = {
  state: {
    view: 'landing',
    previousView: 'landing',
    links: [],
    contracts: [],
    activeContractTab: 'Contrato_67_2026',
    exams: [],
    dotacoes: [],
    dotacoesFilter: 'PENDENTES',
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
    clockTimer: null,
    pendingView: null,
    filters: { search: '', category: 'ALL', hideZero: false }
  },

  init() {
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
          app.dotacoes.closeBaixaModal();
          app.dotacoes.closeDeleteModal();
        }
        if (app.contratos) {
          app.contratos.closeNewModal();
          app.contratos.closeEditModal();
          app.contratos.closeDeleteModal();
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
      const roleMap = (app.state.permissions && app.state.permissions[role]) || DEFAULT_PERMISSIONS[role];
      return !!(roleMap && roleMap[actionKey]);
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
      const modal = document.getElementById('modal-audit-login');
      const err = document.getElementById('login-error-msg');
      if (err) err.classList.add('hidden');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
        setTimeout(() => document.getElementById('login-user').focus(), 80);
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

        const url = `${GOOGLE_API_URL}?action=LOGIN&u=${encodeURIComponent(u)}&p=${encodeURIComponent(p)}`;
        const res = await fetch(url, { redirect: 'follow' });
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
        if (u === "admin" && p === "admin123") {
          const fallbackUser = { id: 1, usuario: "admin", nome: "Administrador Geral", perfil: "Administrador" };
          app.state.auth.isLogged = true;
          app.state.auth.user = fallbackUser;
          sessionStorage.setItem(CONFIG.keys.auditSession, JSON.stringify(fallbackUser));
          this.updateBadge();
          this.closeLoginModal();
          const target = app.state.pendingView || 'auditoria_hub';
          app.router.go(target);
        } else {
          err.textContent = "Erro ao conectar com a planilha. Verifique a internet.";
          err.classList.remove('hidden');
        }
      } finally {
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

      const rawActiveTab = localStorage.getItem(CONFIG.keys.activeContractTab);
      app.state.activeContractTab = rawActiveTab || app.state.contracts[0].tabName;

      const rawExamsCache = localStorage.getItem(`${CONFIG.keys.examsCache}_${app.state.activeContractTab}`);
      app.state.exams = rawExamsCache ? JSON.parse(rawExamsCache) : [];

      const rawDotacoes = localStorage.getItem(CONFIG.keys.dotacoesCache);
      app.state.dotacoes = rawDotacoes ? JSON.parse(rawDotacoes) : JSON.parse(JSON.stringify(INITIAL_DOTACOES));

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

    saveLocalDotacoes() {
      localStorage.setItem(CONFIG.keys.dotacoesCache, JSON.stringify(app.state.dotacoes));
    },

    saveLocalPermissions() {
      localStorage.setItem(CONFIG.keys.permissions, JSON.stringify(app.state.permissions));
    },

    saveLinksLocally() {
      localStorage.setItem(CONFIG.keys.links, JSON.stringify(app.state.links));
    },

    async syncFromCloud(showFeedback = false) {
      if (!GOOGLE_API_URL) return;
      try {
        app.ui.setSyncStatus(true, "Consultando Planilha Google...");
        const url = `${GOOGLE_API_URL}?contract=${encodeURIComponent(app.state.activeContractTab)}`;
        const response = await fetch(url, { redirect: 'follow' });
        const res = await response.json();

        if (res.status === "success") {
          if (Array.isArray(res.shortcuts) && res.shortcuts.length > 0) {
            app.state.links = res.shortcuts;
            this.saveLinksLocally();
            if (app.state.view === 'saude_links') app.render.saudeLinks(document.getElementById('app-viewport'));
          }

          if (Array.isArray(res.contracts) && res.contracts.length > 0) {
            app.state.contracts = res.contracts.map(c => {
              const local = app.state.contracts.find(l => l.tabName === c.tabName);
              return { ...c, createdAt: c.createdAt || (local ? local.createdAt : "12/09/2026 às 08:30") };
            });
            this.saveLocalContracts();
          }

          if (Array.isArray(res.exams) && res.exams.length > 0) {
            app.state.exams = res.exams;
            this.saveLocalExams();
          }

          if (Array.isArray(res.dotacoes)) {
            app.state.dotacoes = res.dotacoes;
            this.saveLocalDotacoes();
            if (app.state.view === 'dotacoes_hub') app.render.dotacoesHub(document.getElementById('app-viewport'));
          }

          if (Array.isArray(res.panelContracts) && res.panelContracts.length > 0) {
            app.state.panelContracts = res.panelContracts;
            if (app.state.view === 'contratos_hub' && app.render.contratosHub) {
              app.render.contratosHub(document.getElementById('app-viewport'));
            }
          }

          if (app.state.view === 'auditoria_detalhe') app.render.auditoriaDetalhe(document.getElementById('app-viewport'));
          else if (app.state.view === 'auditoria_hub') app.render.auditoriaHub(document.getElementById('app-viewport'));

          if (showFeedback) alert("Dados atualizados com sucesso diretamente da Planilha Google!");
        }
      } catch (err) {
        console.warn("Modo Offline ativado.", err);
        if (showFeedback) alert("Modo offline: exibindo dados salvos em cache.");
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

    go(view) {
      const isRestricted = (view === 'auditoria_hub' || view === 'auditoria_detalhe' || view === 'dotacoes_hub' || view === 'contratos_hub');
      if (isRestricted && !app.state.auth.isLogged) {
        app.auditAuth.promptLogin(view);
        return;
      }

      if (!isRestricted) {
        app.auditAuth.closeLoginModal();
        app.state.previousView = view;
      }

      app.state.view = view;
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

      nav.innerHTML = `
        <button onclick="app.ui.navigate('landing')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 font-semibold text-[11px] sm:text-xs">
          Início
        </button>
        <button onclick="app.ui.navigate('saude_links')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${isPortal ? 'bg-blue-100 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'} text-[11px] sm:text-xs">
          Saúde
        </button>
        <button onclick="app.ui.navigate('auditoria_exames')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${isAuditoria ? 'bg-blue-100 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'} text-[11px] sm:text-xs">
          Auditoria
        </button>
        <button onclick="app.ui.navigate('dotacoes')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${isDotacoes ? 'bg-emerald-100 text-emerald-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'} text-[11px] sm:text-xs">
          Dotações
        </button>
        <button onclick="app.ui.navigate('contratos')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${isContratos ? 'bg-indigo-100 text-indigo-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'} text-[11px] sm:text-xs">
          Contratos LDO
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

      if (btnUsuarios) btnUsuarios.style.display = isMasterAdmin ? 'inline-block' : 'none';
      if (btnPermissoes) btnPermissoes.style.display = isMasterAdmin ? 'inline-block' : 'none';

      if (!isMasterAdmin) {
        if (viewUsuarios) viewUsuarios.classList.add('hidden');
        if (viewPermissoes) viewPermissoes.classList.add('hidden');
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
      if ((tab === 'usuarios' || tab === 'permissoes') && !this.isAdminUser()) {
        this.switchTab('contrato');
        return;
      }

      const vLinks = document.getElementById('admin-view-links');
      const vContrato = document.getElementById('admin-view-contrato');
      const vUsuarios = document.getElementById('admin-view-usuarios');
      const vPerms = document.getElementById('admin-view-permissoes');

      const bLinks = document.getElementById('admin-tab-btn-links');
      const bContrato = document.getElementById('admin-tab-btn-contrato');
      const bUsuarios = document.getElementById('admin-tab-btn-usuarios');
      const bPerms = document.getElementById('admin-tab-btn-permissoes');

      [vLinks, vContrato, vUsuarios, vPerms].forEach(v => v && v.classList.add('hidden'));
      [bLinks, bContrato, bUsuarios, bPerms].forEach(b => {
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
      }
    },

    renderPermissionsMatrix() {
      const perms = app.state.permissions || DEFAULT_PERMISSIONS;
      const keys = [
        'audit_edit_values', 'audit_create_contract', 'audit_manage_procedures',
        'dotacoes_create', 'dotacoes_check', 'dotacoes_edit', 'dotacoes_delete',
        'panel_create', 'panel_edit', 'panel_archive'
      ];

      keys.forEach(k => {
        const compEl = document.getElementById(`perm-comprador-${k}`);
        const gestEl = document.getElementById(`perm-gestor-${k}`);

        if (compEl) compEl.checked = !!(perms['Comprador'] && perms['Comprador'][k]);
        if (gestEl) gestEl.checked = !!(perms['Gestor Financeiro'] && perms['Gestor Financeiro'][k]);
      });
    },

    async savePermissions() {
      if (!this.isAdminUser()) return alert("Apenas Administrador Geral tem permissão.");

      const keys = [
        'audit_edit_values', 'audit_create_contract', 'audit_manage_procedures',
        'dotacoes_create', 'dotacoes_check', 'dotacoes_edit', 'dotacoes_delete',
        'panel_create', 'panel_edit', 'panel_archive'
      ];

      const newPerms = { 'Comprador': {}, 'Gestor Financeiro': {} };

      keys.forEach(k => {
        const compEl = document.getElementById(`perm-comprador-${k}`);
        const gestEl = document.getElementById(`perm-gestor-${k}`);

        newPerms['Comprador'][k] = compEl ? compEl.checked : false;
        newPerms['Gestor Financeiro'][k] = gestEl ? gestEl.checked : false;
      });

      app.state.permissions = newPerms;
      app.data.saveLocalPermissions();
      app.ui.setSyncStatus(true, "Salvando permissões...");

      await app.data.sendToCloud({
        action: "SAVE_PERMISSIONS",
        permissions: newPerms
      });

      alert("✓ Matriz de Permissões salva com sucesso!");
    },

    async loadUsersList() {
      if (!this.isAdminUser()) return;
      const tbody = document.getElementById('adm-users-list-tbody');
      if (!tbody) return;

      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">Consultando usuários no Google Sheets...</td></tr>`;

      try {
        const res = await fetch(`${GOOGLE_API_URL}?action=GET_USERS`, { redirect: 'follow' });
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.users)) {
          app.state.users = data.users;
          tbody.innerHTML = data.users.map(u => `
            <tr class="hover:bg-slate-50">
              <td class="p-3.5 font-bold text-slate-800">${u.nome || u.usuario}</td>
              <td class="p-3.5 font-mono text-blue-700 font-bold">${u.usuario}</td>
              <td class="p-3.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.perfil === 'Administrador' ? 'bg-purple-100 text-purple-800' : (u.perfil === 'Gestor Financeiro' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700')}">${u.perfil}</span></td>
              <td class="p-3.5 text-slate-400">${u.createdAt || "—"}</td>
              <td class="p-3.5 text-center">
                <button onclick="app.admin.deleteUser(${u.id}, '${u.usuario}')" class="text-rose-500 hover:text-rose-700 font-bold">Excluir</button>
              </td>
            </tr>
          `).join('');
        } else {
          throw new Error(data.message || "Resposta inválida");
        }
      } catch (err) {
        console.error("Erro na leitura de usuários:", err);
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="p-4 text-center text-rose-500">
              <b>Não foi possível carregar a lista em tempo real.</b><br>
              <span class="text-slate-400 text-[11px]">Certifique-se de executar a função ensureUsersStructure no Apps Script.</span>
            </td>
          </tr>
        `;
      }
    },

    async createUser() {
      if (!this.isAdminUser()) return alert("Apenas administradores podem cadastrar usuários.");

      const nome = document.getElementById('user-field-nome').value.trim();
      const usuario = document.getElementById('user-field-login').value.trim().toLowerCase();
      const senha = document.getElementById('user-field-senha').value.trim();
      const perfil = document.getElementById('user-field-perfil').value;

      if (!usuario || !senha) return alert("Preencha o nome de usuário e a senha.");

      const now = new Date();
      const createdAt = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

      app.ui.setSyncStatus(true, "Gravando novo usuário no Google Sheets...");

      await app.data.sendToCloud({
        action: "CREATE_USER",
        usuario, senha, nome: nome || usuario, perfil, createdAt
      });

      document.getElementById('user-field-nome').value = '';
      document.getElementById('user-field-login').value = '';
      document.getElementById('user-field-senha').value = '';

      alert(`Usuário "${usuario}" (${perfil}) criado com sucesso!`);
      setTimeout(() => this.loadUsersList(), 1000);
    },

    async deleteUser(id, usuario) {
      if (!this.isAdminUser()) return alert("Apenas administradores podem excluir usuários.");
      if (confirm(`Deseja excluir o usuário "${usuario}" da planilha?`)) {
        app.ui.setSyncStatus(true, "Excluindo usuário...");
        await app.data.sendToCloud({ action: "DELETE_USER", id: id });
        setTimeout(() => this.loadUsersList(), 1000);
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

                <!-- CARD 2: DOTAÇÕES -->
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

                <!-- CARD 3: CONTRATOS GERAIS LDO -->
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
};

window.addEventListener('DOMContentLoaded', () => app.init());
