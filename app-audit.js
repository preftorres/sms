/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DE AUDITORIA: Contratos de Exames, Cotas e Gemini IA
 * Arquivo: app-audit.js
 * ============================================================================
 */

// PROCEDIMENTOS MODELO (COM SEQUENCIAL AUTOMÁTICO 01, 02...)
const TEMPLATE_EXAMS = [
  { id: 1, item: "01", cat: 'Laboratorial', descEmpenho: 'Ácido Fólico (Vitamina B9)', descPrestador: '1 - AFOLI - ACIDO FOLICO', qtdEmpenho: 150, saldoAnterior: 150, faturado: 7 },
  { id: 2, item: "02", cat: 'Laboratorial', descEmpenho: 'Ácido Úrico', descPrestador: '1 - AUS - ACIDO URICO', qtdEmpenho: 400, saldoAnterior: 400, faturado: 8 },
  { id: 3, item: "03", cat: 'Laboratorial', descEmpenho: 'Ácido Valproico', descPrestador: '1 - ACVAL - ACIDO VALPROICO', qtdEmpenho: 150, saldoAnterior: 150, faturado: 1 },
  { id: 4, item: "04", cat: 'Laboratorial', descEmpenho: 'Albumina', descPrestador: 'ALBUMINA', qtdEmpenho: 150, saldoAnterior: 150, faturado: 0 },
  { id: 5, item: "05", cat: 'Laboratorial', descEmpenho: 'Amilase', descPrestador: '1 - AMI - AMILASE', qtdEmpenho: 350, saldoAnterior: 350, faturado: 1 },
  { id: 6, item: "06", cat: 'Laboratorial', descEmpenho: 'Analise de caracteres físicos, elemento e sedimentos na urina (EQU)', descPrestador: '1 - EQU - EXAME QUALITATIVO DE URINA', qtdEmpenho: 600, saldoAnterior: 600, faturado: 34 },
  { id: 16, item: "16", cat: 'Laboratorial', descEmpenho: 'Colesterol HDL', descPrestador: '1 - HDL - COLESTEROL HDL', qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 37 },
  { id: 17, item: "17", cat: 'Laboratorial', descEmpenho: 'Colesterol LDL', descPrestador: '1 - LDL - COLESTEROL LDL', qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 28 },
  { id: 18, item: "18", cat: 'Laboratorial', descEmpenho: 'Colesterol Total', descPrestador: '1 - C - COLESTEROL TOTAL', qtdEmpenho: 600, saldoAnterior: 600, faturado: 38 },
  { id: 19, item: "19", cat: 'Laboratorial', descEmpenho: 'Creatinina', descPrestador: '1 - CRE - CREATININA', qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 34 },
  { id: 27, item: "27", cat: 'Laboratorial', descEmpenho: 'Dosagem Creatinofosfoquinase (CPK)', descPrestador: 'CPK', qtdEmpenho: 200, saldoAnterior: 200, faturado: 0 },
  { id: 28, item: "28", cat: 'Laboratorial', descEmpenho: 'EPF-Exame Parasitológico de fezes', descPrestador: '1 - EPF - EXAME PARASITOLOGICO DE FEZES', qtdEmpenho: 600, saldoAnterior: 600, faturado: 8 },
  { id: 41, item: "41", cat: 'Laboratorial', descEmpenho: 'Hemograma Completo', descPrestador: '1 - H - HEMOGRAMA', qtdEmpenho: 2000, saldoAnterior: 2000, faturado: 51 }
];

app.audit = {
  openContractDetail(tabName) {
    app.state.activeContractTab = tabName;
    app.data.saveLocalContracts();

    const rawExams = localStorage.getItem(`${CONFIG.keys.examsCache}_${tabName}`);
    app.state.exams = rawExams ? JSON.parse(rawExams) : [];

    window.location.hash = `auditoria_contrato=${tabName}`;
  },

  openNewContractModal() {
    const m = document.getElementById('modal-new-contract');
    if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
  },

  closeNewContractModal() {
    const m = document.getElementById('modal-new-contract');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  },

  async confirmCreateContract() {
    const num = document.getElementById('new-contract-num').value.trim();
    const empenhos = document.getElementById('new-contract-empenhos').value.trim();
    const prestador = document.getElementById('new-contract-prestador').value.trim();
    const copyTemplate = document.getElementById('new-contract-copy-template').checked;

    if (!num || !prestador) return alert("Preencha o número do contrato e o prestador.");

    const safeTabName = `Contrato_${num.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const now = new Date();
    const createdAtStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const newContractObj = {
      tabName: safeTabName,
      num: num,
      empenhos: empenhos || 'A definir',
      prestador: prestador,
      createdAt: createdAtStr
    };

    const initialExams = copyTemplate ? TEMPLATE_EXAMS.map(item => ({ ...item, faturado: 0 })) : [];

    app.state.contracts.push(newContractObj);
    app.state.activeContractTab = safeTabName;
    app.state.exams = initialExams;

    app.data.saveLocalContracts();
    app.data.saveLocalExams();
    this.closeNewContractModal();
    this.openContractDetail(safeTabName);

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

    let style = { rowClass: 'bg-white hover:bg-slate-50', badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300', label: 'Seguro' };

    if (faturado === 0) {
      style = { rowClass: 'bg-slate-50 text-slate-500', badgeClass: 'bg-slate-200 text-slate-600 border border-slate-300', label: 'Sem Movimento' };
    } else if (percConsumo >= 100 || saldoAtual <= 0) {
      style = { rowClass: 'bg-purple-100 text-purple-950 font-bold hover:bg-purple-200/70', badgeClass: 'bg-purple-200 text-purple-900 border border-purple-400 font-extrabold', label: 'Esgotado' };
    } else if (percConsumo >= 50) {
      style = { rowClass: 'bg-red-50 text-red-950 font-semibold hover:bg-red-100/70', badgeClass: 'bg-red-100 text-red-800 border border-red-300 font-bold', label: 'Crítico (≥50%)' };
    } else if (percConsumo >= 30) {
      style = { rowClass: 'bg-yellow-50 text-yellow-950 hover:bg-yellow-100/70', badgeClass: 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold', label: 'Alerta (≥30%)' };
    }

    return { saldoAtual, percConsumo, percRestante, style };
  },

  updateVal(id, field, val) {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    const target = app.state.exams.find(x => x.id === id);
    if (!target) return;

    target[field] = parsed;
    if (field === 'qtdEmpenho' && target.saldoAnterior === 0) {
      target.saldoAnterior = parsed;
    }

    app.data.saveLocalExams();
    this.renderTable();

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
    let totalEmp = 0, totalFat = 0, countEsg = 0, countCrit = 0;

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

    if (filtered.length === 0) empty.classList.remove('hidden');
    else empty.classList.add('hidden');

    filtered.forEach(item => {
      const c = this.calculate(item);
      const tr = document.createElement('tr');
      tr.className = `border-b border-slate-200 transition-colors ${c.style.rowClass}`;

      tr.innerHTML = `
        <td class="py-2.5 px-3 text-center font-bold font-mono">${item.item}</td>
        <td class="py-2.5 px-3"><span class="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">${item.cat}</span></td>
        <td class="py-2.5 px-3 font-semibold text-slate-900">${item.descEmpenho}</td>
        <td class="py-2.5 px-3 text-slate-600 font-mono text-[11px]">${item.descPrestador}</td>
        <td class="py-2.5 px-3 text-right bg-slate-100/90 border-x border-slate-200">
          <input type="number" min="0" value="${item.qtdEmpenho}" onchange="app.audit.updateVal(${item.id}, 'qtdEmpenho', this.value)" class="table-num w-20 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white shadow-xs focus:border-slate-600 font-bold text-slate-800">
        </td>
        <td class="py-2.5 px-3 text-right">
          <input type="number" min="0" value="${item.saldoAnterior}" onchange="app.audit.updateVal(${item.id}, 'saldoAnterior', this.value)" class="table-num w-20 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white shadow-xs focus:border-blue-500 font-semibold">
        </td>
        <td class="py-2.5 px-3 text-right bg-blue-50/70 border-x border-blue-100">
          <input type="number" min="0" value="${item.faturado}" onchange="app.audit.updateVal(${item.id}, 'faturado', this.value)" class="table-num w-20 text-right px-2 py-1 text-xs border border-blue-300 rounded bg-white shadow-xs focus:border-blue-600 font-bold text-blue-950">
        </td>
        <td class="py-2.5 px-3 text-right font-bold ${c.saldoAtual <= 0 ? 'text-red-700 font-black' : ''}">${c.saldoAtual.toLocaleString('pt-BR')}</td>
        <td class="py-2.5 px-3 text-right font-mono font-bold">${c.percConsumo.toFixed(1)}%</td>
        <td class="py-2.5 px-3 text-right font-mono">${c.percRestante.toFixed(1)}%</td>
        <td class="py-2.5 px-3 text-center"><span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.style.badgeClass}">${c.style.label}</span></td>
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
        i.item, `"${i.cat}"`, `"${i.descEmpenho.replace(/"/g, '""')}"`, `"${i.descPrestador.replace(/"/g, '""')}"`,
        i.qtdEmpenho, i.saldoAnterior, i.faturado, c.saldoAtual, `"${c.percConsumo.toFixed(2)}%"`, `"${c.percRestante.toFixed(2)}%"`, `"${c.style.label}"`
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
  },

  renderExamsListAdmin() {
    const tbody = document.getElementById('adm-exams-list-tbody');
    if (!tbody) return;

    tbody.innerHTML = app.state.exams.map(e => `
      <tr class="hover:bg-slate-50">
        <td class="p-3 text-center font-bold font-mono">${e.item}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold">${e.cat}</span></td>
        <td class="p-3 font-semibold text-slate-800">${e.descEmpenho}</td>
        <td class="p-3 text-right font-bold text-slate-700 bg-slate-100/60">${e.qtdEmpenho}</td>
        <td class="p-3 text-right">${e.saldoAnterior}</td>
        <td class="p-3 text-center">
          <button onclick="app.audit.editExam(${e.id})" class="text-blue-600 hover:text-blue-800 font-bold mr-2">Editar</button>
          <button onclick="app.audit.removeExam(${e.id})" class="text-red-500 hover:text-red-700 font-bold">Excluir</button>
        </td>
      </tr>
    `).join('');
  },

  saveExam() {
    const id = document.getElementById('adm-exam-id').value;
    const item = document.getElementById('adm-exam-item').value.trim();
    const cat = document.getElementById('adm-exam-cat').value;
    const descEmpenho = document.getElementById('adm-exam-desc-emp').value.trim();
    const descPrestador = document.getElementById('adm-exam-desc-prest').value.trim();
    const qtdEmpenho = parseInt(document.getElementById('adm-exam-qtd').value, 10) || 0;
    const saldoAnterior = parseInt(document.getElementById('adm-exam-saldo-ant').value, 10) || 0;

    if (!item || !descEmpenho) return alert("Preencha o número do item e a descrição do empenho.");

    let examObj = {
      id: id ? Number(id) : Date.now(),
      item, cat, descEmpenho,
      descPrestador: descPrestador || descEmpenho,
      qtdEmpenho, saldoAnterior, faturado: 0
    };

    if (id) {
      const idx = app.state.exams.findIndex(x => x.id == id);
      if (idx !== -1) {
        examObj.faturado = app.state.exams[idx].faturado || 0;
        app.state.exams[idx] = examObj;
      }
    } else {
      app.state.exams.push(examObj);
    }

    app.state.exams.sort((a, b) => a.item.localeCompare(b.item, undefined, { numeric: true }));
    app.data.saveLocalExams();
    this.resetExamForm();
    this.renderExamsListAdmin();

    app.data.sendToCloud({
      action: "SAVE_EXAM",
      contract: app.state.activeContractTab,
      ...examObj
    });
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

    document.getElementById('adm-exam-form-title').textContent = `Editando Item ${e.item} (${app.state.activeContractTab})`;
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
    document.getElementById('adm-exam-form-title').textContent = "Adicionar / Editar Exame no Contrato Ativo";
    document.getElementById('btn-adm-save-exam').textContent = "Salvar Procedimento";
    document.getElementById('btn-adm-cancel-exam').classList.add('hidden');
  },

  removeExam(id) {
    if (confirm("Excluir este exame deste contrato?")) {
      app.state.exams = app.state.exams.filter(x => x.id !== id);
      app.data.saveLocalExams();
      this.renderExamsListAdmin();

      app.data.sendToCloud({
        action: "DELETE_EXAM",
        contract: app.state.activeContractTab,
        id: id
      });
    }
  }
};

// GEMINI IA
app.gemini = {
  openModal() {
    const modal = document.getElementById('modal-gemini-import');
    if (modal) {
      modal.classList.remove('hidden'); modal.classList.add('flex');
      this.switchTab('paste');
      document.getElementById('gemini-paste-area').value = '';
      setTimeout(() => document.getElementById('gemini-paste-area').focus(), 80);
    }
  },

  closeModal() {
    const modal = document.getElementById('modal-gemini-import');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  },

  switchTab(tab) {
    const vPaste = document.getElementById('view-gemini-paste');
    const vGuide = document.getElementById('view-gemini-guide');
    const bPaste = document.getElementById('btn-tab-gemini-paste');
    const bGuide = document.getElementById('btn-tab-gemini-guide');

    if (tab === 'paste') {
      vPaste.classList.remove('hidden'); vGuide.classList.add('hidden');
      bPaste.className = "px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl bg-blue-100 text-blue-900";
      bGuide.className = "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl text-slate-500 hover:bg-slate-100 flex items-center gap-1.5";
    } else {
      vPaste.classList.add('hidden'); vGuide.classList.remove('hidden');
      bGuide.className = "px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl bg-blue-100 text-blue-900 flex items-center gap-1.5";
      bPaste.className = "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl text-slate-500 hover:bg-slate-100";
    }
  },

  copyField(textElementId, buttonElementId) {
    const textEl = document.getElementById(textElementId);
    const btnEl = document.getElementById(buttonElementId);
    if (!textEl || !btnEl) return;

    navigator.clipboard.writeText(textEl.textContent.trim()).then(() => {
      const originalHtml = btnEl.innerHTML;
      btnEl.innerHTML = "<span>✓</span> Copiado!";
      btnEl.classList.add('copied');
      setTimeout(() => { btnEl.innerHTML = originalHtml; btnEl.classList.remove('copied'); }, 2000);
    });
  },

  processPaste() {
    const rawText = document.getElementById('gemini-paste-area').value.trim();
    if (!rawText) return alert("Cole o texto extraído pelo Gemini na caixa.");

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const newExams = [];
    let counter = 1;

    lines.forEach(line => {
      let clean = line;
      if (clean.startsWith('|') && clean.endsWith('|')) clean = clean.slice(1, -1).trim();
      let parts = clean.includes(';') ? clean.split(';') : (clean.includes('|') ? clean.split('|') : clean.split('\t'));
      parts = parts.map(p => p.trim());

      const first = parts[0] ? parts[0].toLowerCase() : "";
      if (first.includes('item') || first.includes('---') || first.includes('categoria')) return;

      if (parts.length >= 3) {
        const itemSeq = String(counter).padStart(2, '0');
        const cat = parts[1] ? (parts[1].toLowerCase().includes('imag') ? 'Imagem' : 'Laboratorial') : 'Laboratorial';
        const descEmp = parts[2] || `Procedimento ${itemSeq}`;
        const descPrest = parts[3] || descEmp;
        const qtd = parts[4] ? Math.max(0, parseInt(parts[4].replace(/\D/g, ''), 10) || 0) : 0;
        const saldoAnt = parts[5] ? Math.max(0, parseInt(parts[5].replace(/\D/g, ''), 10) || 0) : qtd;
        const fat = parts[6] ? Math.max(0, parseInt(parts[6].replace(/\D/g, ''), 10) || 0) : 0;

        newExams.push({
          id: Date.now() + counter,
          item: itemSeq, cat, descEmpenho: descEmp, descPrestador: descPrest,
          qtdEmpenho: qtd, saldoAnterior: saldoAnt, faturado: fat
        });
        counter++;
      }
    });

    if (newExams.length === 0) return alert("Não conseguimos identificar os dados. Formato esperado: Item;Categoria;Descricao;Prestador;Qtd;Saldo;Faturado");

    app.state.exams = newExams;
    app.data.saveLocalExams();
    this.closeModal();
    app.render.auditoriaDetalhe(document.getElementById('app-viewport'));

    app.data.sendToCloud({
      action: "INITIAL_SEED",
      contract: app.state.activeContractTab,
      exams: app.state.exams
    });

    alert(`Sucesso! ${newExams.length} procedimentos importados e salvos no Google Sheets!`);
  }
};

// TELAS DE AUDITORIA
app.render.auditoriaHub = function(el) {
  el.innerHTML = `
    <div class="container mx-auto px-6 py-6 sm:py-8 fade-in">
        <div class="mb-4">
            <button onclick="app.ui.navigate('saude_links')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
                <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Voltar para o Portal de Acessos</span>
            </button>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
            <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Auditoria & Fiscalização da Saúde</span>
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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${app.state.contracts.map(c => `
                <div class="bg-white rounded-[2.5rem] p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <span class="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase border border-blue-100">Aba: ${c.tabName}</span>
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
                        <button onclick="app.audit.openContractDetail('${c.tabName}')" class="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2">
                            <span>Abrir Auditoria deste Contrato</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            `).join('')}

            <button onclick="app.audit.openNewContractModal()" class="bg-white/60 hover:bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center group min-h-[280px]">
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
};

app.render.auditoriaDetalhe = function(el) {
  const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];

  el.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 fade-in">
      <div class="mb-4">
          <button onclick="app.ui.navigate('auditoria_exames')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
              <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>Voltar para a Lista de Contratos</span>
          </button>
      </div>

      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6 print:border-none print:shadow-none print:p-0">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 uppercase">Aba: ${currentContract.tabName}</span>
              <span id="cloud-sync-status" class="hidden text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold"></span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900">Auditoria de Cotas — Contrato nº ${currentContract.num}</h2>
            <div class="mt-1 text-xs text-slate-600 flex flex-wrap gap-x-5 gap-y-1">
              <span><strong>Empenhos:</strong> ${currentContract.empenhos}</span>
              <span><strong>Prestador:</strong> ${currentContract.prestador}</span>
              <span><strong>Cadastrado em:</strong> ${currentContract.createdAt || "12/09/2026"}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 print:hidden">
            <button onclick="app.gemini.openModal()" class="px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition flex items-center gap-1.5">
              <span>🤖</span> Importar com Gemini IA
            </button>
            <button onclick="app.data.syncFromCloud(true)" class="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1">
              <span>🔄</span> Sincronizar
            </button>
            <button onclick="app.audit.exportCSV()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition">Exportar (.CSV)</button>
            <button onclick="window.print()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition">Imprimir / PDF</button>
            ${app.admin.isAdminUser() ? `
              <button onclick="app.admin.trigger(true)" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 shadow transition">⚙️ Procedimentos</button>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Empenhado</span>
          <p id="kpi-empenhado" class="text-2xl font-black text-slate-800 mt-1">0</p>
          <span class="text-[10px] text-slate-400">Soma das cotas deste contrato</span>
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
          <span class="text-[10px] text-red-600">Requer atenção orçamentária</span>
        </div>
      </div>

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

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="custom-scroll overflow-y-auto max-h-[600px] relative">
          <table id="table-audit" class="w-full text-left border-collapse text-xs">
            <thead class="sticky-thead bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
              <tr>
                <th class="py-3 px-3 text-center w-12">Item</th>
                <th class="py-3 px-3 w-28">Categoria</th>
                <th class="py-3 px-3 min-w-[200px]">Descrição no Empenho</th>
                <th class="py-3 px-3 min-w-[200px]">Descrição / Cód. (Prestador)</th>
                <th class="py-3 px-3 text-right w-28 bg-slate-200/70 border-x border-slate-300">Qtd. Empenhada</th>
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
        <div id="table-empty" class="hidden p-8 text-center text-slate-400 text-xs font-medium">Nenhum exame cadastrado para este contrato.</div>
      </div>
    </div>
  `;

  app.audit.renderTable();
};
