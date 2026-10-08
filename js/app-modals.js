/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DE MODAIS E PAINEL ADMINISTRATIVO (INJEÇÃO DINÂMICA)
 * Arquivo: js/app-modals.js
 * ============================================================================
 */

window.app = window.app || {};

window.app.modals = {
  init() {
    const host = document.getElementById('modal-host');
    if (!host) {
      console.warn("Elemento #modal-host não encontrado.");
      return;
    }

    host.innerHTML = `
      <!-- ================================================================= -->
      <!-- 1. MODAL DE AUTENTICAÇÃO / LOGIN GERAL                            -->
      <!-- ================================================================= -->
      <div id="modal-audit-login" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 fade-in">
          <div class="text-center mb-6">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <h3 class="text-lg font-black text-slate-800">Acesso Restrito</h3>
            <p class="text-xs text-slate-400 mt-0.5">Identifique-se para acessar os módulos internos</p>
          </div>

          <div id="login-error-msg" class="hidden mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center"></div>

          <form onsubmit="app.auditAuth.handleLogin(event)" class="space-y-4">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Usuário / Login</label>
              <input type="text" id="login-user" required autocomplete="username" class="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:border-blue-600">
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Senha de Acesso</label>
              <input type="password" id="login-pass" required autocomplete="current-password" class="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:border-blue-600">
            </div>
            <div class="pt-2 flex items-center gap-2">
              <button type="button" onclick="app.auditAuth.cancelLogin()" class="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition">Cancelar</button>
              <button type="submit" id="btn-login-submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition">Entrar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 2. AUDITORIA: NOVO CONTRATO DE EXAMES                             -->
      <!-- ================================================================= -->
      <div id="modal-new-contract" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 fade-in">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-black text-slate-900">Cadastrar Novo Contrato de Exames</h3>
            <button onclick="app.audit.closeNewContractModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <div class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Número do Contrato (Ex: 67/2026)</label>
              <input type="text" id="new-contract-num" placeholder="Ex: 67/2026" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Empenhos Associados</label>
              <input type="text" id="new-contract-empenhos" placeholder="Ex: 3406/2026 e 3407/2026" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Razão Social / Prestador</label>
              <input type="text" id="new-contract-prestador" placeholder="Ex: Laboratório Biomédico Ltda" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500">
            </div>
            <label class="flex items-center gap-2 pt-2 cursor-pointer select-none">
              <input type="checkbox" id="new-contract-copy-template" checked class="w-4 h-4 rounded text-blue-600 border-slate-300">
              <span class="text-slate-600 font-semibold">Iniciar com lista padrão de procedimentos laboratoriais</span>
            </label>
            <div class="pt-3 flex gap-2">
              <button onclick="app.audit.closeNewContractModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button onclick="app.audit.confirmCreateContract()" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md">Criar Contrato</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 3. AUDITORIA: IMPORTAÇÃO & RECONCILIAÇÃO COM GEMINI IA            -->
      <!-- ================================================================= -->
      <div id="modal-gemini-import" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-100 fade-in flex flex-col max-h-[92vh]">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="text-xl">🤖</span>
              <div>
                <h3 class="text-base font-black text-slate-900">Atualização & Reconciliação com Gemini IA</h3>
                <p class="text-[11px] text-slate-400">Atualize faturamentos mensais, cotas e procedimentos via Inteligência Artificial</p>
              </div>
            </div>
            <button onclick="app.gemini.closeModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>

          <div class="flex gap-2 my-3">
            <button id="btn-tab-gemini-paste" onclick="app.gemini.switchTab('paste')" class="px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl bg-blue-100 text-blue-900">Colar Faturamento</button>
            <button id="btn-tab-gemini-guide" onclick="app.gemini.switchTab('guide')" class="px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl text-slate-500 hover:bg-slate-100 flex items-center gap-1.5">Instruções & Prompts</button>
          </div>

          <div id="view-gemini-paste" class="flex-grow flex flex-col overflow-y-auto space-y-3">
            <!-- SELETOR DE MODO -->
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <span class="block font-bold text-slate-700">Selecione o tipo de processamento:</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label class="flex items-start gap-2 p-2.5 rounded-xl border bg-white border-blue-200 cursor-pointer hover:border-blue-400 transition">
                  <input type="radio" name="gemini-mode" id="gemini-mode-update" value="update" checked class="mt-0.5 text-blue-600">
                  <div>
                    <strong class="text-slate-800 block">Atualizar Faturamento do Mês</strong>
                    <span class="text-[11px] text-slate-500 leading-tight block">Localiza cada exame por Item/Código e atualiza o quantitativo faturado, preservando as cotas.</span>
                  </div>
                </label>
                <label class="flex items-start gap-2 p-2.5 rounded-xl border bg-white border-slate-200 cursor-pointer hover:border-slate-300 transition">
                  <input type="radio" name="gemini-mode" id="gemini-mode-replace" value="replace" class="mt-0.5 text-blue-600">
                  <div>
                    <strong class="text-slate-800 block">Substituir Lista Completa</strong>
                    <span class="text-[11px] text-slate-500 leading-tight block">Substitui toda a tabela deste contrato com os dados colados (para novos contratos).</span>
                  </div>
                </label>
              </div>

              <!-- Opção de acúmulo no faturamento -->
              <div id="gemini-accumulate-box" class="pt-1.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="gemini-acc" id="gemini-acc-replace" value="replace" checked class="text-blue-600">
                  <span>Definir novo faturado do período</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="gemini-acc" id="gemini-acc-add" value="add" class="text-blue-600">
                  <span>Somar ao faturado existente (+ acumular)</span>
                </label>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="font-bold text-xs text-slate-700">Dados Extraídos pelo Gemini:</label>
                <span class="text-[10px] text-slate-400">Aceita formato: Item; Descrição; Faturado</span>
              </div>
              <textarea id="gemini-paste-area" rows="6" placeholder="Exemplos aceitos:
1; Ácido Fólico; 20
2; Ácido Úrico; 144
18; Colesterol Total; 422
41; Hemograma Completo; 474
...ou cole diretamente a tabela do Gemini / Excel" class="w-full p-3 text-xs font-mono bg-slate-50 border rounded-2xl outline-none focus:border-blue-500"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onclick="app.gemini.closeModal()" class="px-4 py-2 text-xs font-bold border rounded-xl text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button onclick="app.gemini.processPaste()" class="px-5 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-1.5">
                <span>⚡</span> Processar e Atualizar Planilha
              </button>
            </div>
          </div>

          <div id="view-gemini-guide" class="hidden overflow-y-auto space-y-3 text-xs text-slate-600 p-1">
            <div class="p-3 bg-blue-50 rounded-2xl border border-blue-100">
              <p class="font-bold text-blue-900 mb-1">Como atualizar o faturamento mensal com o Gemini:</p>
              <ol class="list-decimal list-inside space-y-1 text-slate-700">
                <li>Abra o <strong>Google Gemini</strong> (<a href="https://gemini.google.com" target="_blank" class="text-blue-600 underline font-bold">gemini.google.com</a>).</li>
                <li>Anexe o <strong>PDF</strong> ou a <strong>foto/imagem</strong> da fatura ou relatório do laboratório.</li>
                <li>Copie e cole o comando (prompt) abaixo e envie para o Gemini:</li>
              </ol>
            </div>

            <div class="p-3 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] relative">
              <p class="text-slate-400 text-[10px] uppercase font-bold mb-1">// PROMPT RECOMENDADO PARA O FATURAMENTO:</p>
              <span id="gemini-prompt-text">Atue como auditor do SUS. Analise este relatório/fatura médica do laboratório e extraia todos os procedimentos executados no período. Gere uma tabela sem formatação extra, separada por ponto e vírgula (;), no seguinte formato:
Item; Descricao; Faturado

Exemplo do formato:
1; Ácido Fólico; 20
2; Ácido Úrico; 144
18; Colesterol Total; 422
41; Hemograma Completo; 474</span>
              <button id="btn-copy-prompt" onclick="app.gemini.copyField('gemini-prompt-text', 'btn-copy-prompt')" class="btn-copy absolute top-3 right-3 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shadow">Copiar Prompt</button>
            </div>

            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <p class="font-bold text-slate-800 mb-1">Como o sistema processa:</p>
              <p class="text-slate-600">O sistema localiza cada linha pelo número do <strong>Item</strong> (ex: Item 1, Item 18, Item 41) ou pelo código/nome do exame. As cotas empenhadas originais são mantidas e os saldos e percentuais de consumo são recalculados e salvos automaticamente no Google Sheets.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 4. DOTAÇÕES: NOVO PEDIDO (ENTRADA RÁPIDA DO COMPRADOR)             -->
      <!-- ================================================================= -->
      <div id="modal-nova-dotacao" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 fade-in max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <span class="p-2 bg-amber-50 text-amber-600 rounded-xl text-lg">📝</span>
              <div>
                <h3 class="text-base font-black text-slate-900">Novo Pedido de Dotação</h3>
                <p class="text-[11px] text-slate-500">Lançamento rápido do Comprador para envio ao Financeiro</p>
              </div>
            </div>
            <button onclick="app.dotacoes.closeNewModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <form onsubmit="app.dotacoes.saveNewDotacao(event)" class="space-y-3.5 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nº da Solicitação (SF) *</label>
                <input type="text" id="dot-field-sf" required placeholder="Ex: 18306" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-amber-500">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Protocolo 1Doc</label>
                <input type="text" id="dot-field-1doc" placeholder="Ex: 20490" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 outline-none focus:border-amber-500">
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Objeto / Descrição & Destinação *</label>
              <textarea id="dot-field-objeto" required rows="2" placeholder="Ex: 2 Detector fetal C.E E.I: 212 - Posto Central..." class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-amber-500"></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nº Ata RP</label>
                <input type="text" id="dot-field-ata" placeholder="Ex: 301/2025" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 outline-none focus:border-amber-500">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nº Processo</label>
                <input type="text" id="dot-field-processo" placeholder="Ex: 306/2025" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 outline-none focus:border-amber-500">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Valor Estimado (R$)</label>
                <input type="text" id="dot-field-valor" placeholder="Ex: 639,98" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold outline-none focus:border-amber-500">
              </div>
            </div>

            <!-- EMPENHO & SITUAÇÃO (OPCIONAIS NA CRIAÇÃO) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block font-bold text-slate-700">Nº do Empenho</label>
                  <span class="text-[10px] text-slate-400 font-bold uppercase">Betha Cloud</span>
                </div>
                <input type="text" id="dot-field-empenho" placeholder="Ex: 15471 (ou gerado pós-dotação)" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 outline-none focus:border-amber-500">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Situação / Acompanhamento</label>
                <input type="text" id="dot-field-situacao" placeholder="Ex: Aguardando dotação, proc. adm..." class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-amber-500">
              </div>
            </div>

            <!-- EMENDA PARLAMENTAR (CHECKBOX COM ATIVAÇÃO DINÂMICA) -->
            <div class="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl transition">
              <label class="flex items-center gap-2.5 cursor-pointer font-bold text-purple-950 text-xs select-none">
                <input type="checkbox" id="dot-field-check-emenda" onchange="app.dotacoes.toggleEmendaField('nova')" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-300 accent-purple-600">
                <span>🏛️ Recurso de Emenda Parlamentar</span>
              </label>
              <div id="dot-wrap-emenda-nova" class="hidden mt-2 pt-2 border-t border-purple-200/60">
                <label class="block font-bold text-purple-900 text-[11px] mb-1">Nº / Identificação da Emenda *</label>
                <input type="text" id="dot-field-emenda" placeholder="Ex: Emenda nº 1234/2026 - Dep. Fulano de Tal" class="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-slate-900 font-medium outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600">
              </div>
            </div>

            <div class="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 flex items-center gap-2">
              <span>👉</span>
              <span>Ao salvar, o pedido entrará automaticamente na fila <strong>"Aguardando Dotação"</strong> (ou <strong>"Dotado"</strong> se o empenho já foi informado) para o acompanhamento contábil.</span>
            </div>

            <div class="pt-2 flex gap-2">
              <button type="button" onclick="app.dotacoes.closeNewModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black rounded-xl shadow-md transition">Enviar Pedido →</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 5. DOTAÇÕES: EDITAR / CORRIGIR PEDIDO (COMPRADOR)                  -->
      <!-- ================================================================= -->
      <div id="modal-editar-dotacao" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 fade-in max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <span class="p-2 bg-blue-50 text-blue-600 rounded-xl text-lg">✏️</span>
              <div>
                <h3 class="text-base font-black text-slate-900">Corrigir / Editar Pedido</h3>
                <p class="text-[11px] text-slate-500">Ajuste qualquer dado inserido incorretamente pelo Comprador</p>
              </div>
            </div>
            <button onclick="app.dotacoes.closeEditModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <form onsubmit="app.dotacoes.saveEditDotacao(event)" class="space-y-3.5 text-xs">
            <input type="hidden" id="edit-dot-id">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nº da Solicitação (SF) *</label>
                <input type="text" id="edit-dot-sf" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-blue-500">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Protocolo 1Doc</label>
                <input type="text" id="edit-dot-1doc" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 outline-none focus:border-blue-500">
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Objeto / Descrição & Destinação *</label>
              <textarea id="edit-dot-objeto" required rows="2" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500"></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nº Ata RP</label>
                <input type="text" id="edit-dot-ata" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 outline-none focus:border-blue-500">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nº Processo</label>
                <input type="text" id="edit-dot-processo" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 outline-none focus:border-blue-500">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Valor Estimado (R$)</label>
                <input type="text" id="edit-dot-valor" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold outline-none focus:border-blue-500">
              </div>
            </div>

            <!-- EMPENHO & SITUAÇÃO -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block font-bold text-slate-700">Nº do Empenho</label>
                  <span class="text-[10px] text-slate-400 font-bold uppercase">Betha Cloud</span>
                </div>
                <input type="text" id="edit-dot-empenho" placeholder="Ex: 15471" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-900 outline-none focus:border-blue-500">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Situação / Acompanhamento</label>
                <input type="text" id="edit-dot-situacao" placeholder="Ex: NF emitida, aguardando entrega..." class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500">
              </div>
            </div>

            <!-- EMENDA PARLAMENTAR (CHECKBOX COM ATIVAÇÃO DINÂMICA) -->
            <div class="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl transition">
              <label class="flex items-center gap-2.5 cursor-pointer font-bold text-purple-950 text-xs select-none">
                <input type="checkbox" id="edit-dot-check-emenda" onchange="app.dotacoes.toggleEmendaField('edit')" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-300 accent-purple-600">
                <span>🏛️ Recurso de Emenda Parlamentar</span>
              </label>
              <div id="edit-wrap-emenda" class="hidden mt-2 pt-2 border-t border-purple-200/60">
                <label class="block font-bold text-purple-900 text-[11px] mb-1">Nº / Identificação da Emenda *</label>
                <input type="text" id="edit-dot-emenda" placeholder="Ex: Emenda nº 1234/2026 - Dep. Fulano de Tal" class="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-slate-900 font-medium outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600">
              </div>
            </div>

            <div class="pt-2 flex gap-2">
              <button type="button" onclick="app.dotacoes.closeEditModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition">Salvar Correção</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 6. DOTAÇÕES: COMPLEMENTAR PEDIDO APÓS DOTAÇÃO (COMPRADOR)         -->
      <!-- ================================================================= -->
      <div id="modal-complementar-dotacao" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-emerald-200 fade-in max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <span class="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-lg">📦</span>
              <div>
                <h3 class="text-base font-black text-slate-900">Complementar Dados do Pedido</h3>
                <p id="comp-info-pedido" class="text-[11px] text-slate-500">Vinculação de Empenho, Situação e Patrimônio</p>
              </div>
            </div>
            <button onclick="app.dotacoes.closeComplementarModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <form onsubmit="app.dotacoes.saveComplementarDotacao(event)" class="space-y-3.5 text-xs">
            <input type="hidden" id="comp-dot-id">

            <div>
              <label class="block font-bold text-slate-700 mb-1">Nº do Empenho (Betha)</label>
              <input type="text" id="comp-field-empenho" placeholder="Ex: 15471 ou 15471 / 15472" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-black text-blue-900 outline-none focus:border-emerald-500">
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Situação / Acompanhamento de Entrega</label>
              <input type="text" id="comp-field-situacao" placeholder="Ex: email enviado em 28/09, aguardando entrega, NF em 30/09..." class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-emerald-500">
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="font-bold text-slate-700">Tombamento de Patrimônio</label>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Opcional (Bens Permanentes)</span>
              </div>
              <input type="text" id="comp-field-patrimonio" placeholder="Ex: 47783 (TV) ou deixe em branco se for consumo" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono outline-none focus:border-emerald-500">
              <span class="text-[10px] text-slate-400 block mt-1">Preencha apenas para bens duráveis que recebem plaqueta de patrimônio. Para materiais de consumo, deixe em branco.</span>
            </div>

            <!-- EMENDA PARLAMENTAR (CHECKBOX COM ATIVAÇÃO DINÂMICA) -->
            <div class="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl transition">
              <label class="flex items-center gap-2.5 cursor-pointer font-bold text-purple-950 text-xs select-none">
                <input type="checkbox" id="comp-dot-check-emenda" onchange="app.dotacoes.toggleEmendaField('comp')" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-300 accent-purple-600">
                <span>🏛️ Recurso de Emenda Parlamentar</span>
              </label>
              <div id="comp-wrap-emenda" class="hidden mt-2 pt-2 border-t border-purple-200/60">
                <label class="block font-bold text-purple-900 text-[11px] mb-1">Nº / Identificação da Emenda *</label>
                <input type="text" id="comp-dot-emenda" placeholder="Ex: Emenda nº 1234/2026 - Dep. Fulano de Tal" class="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-slate-900 font-medium outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600">
              </div>
            </div>

            <div class="pt-2 flex gap-2">
              <button type="button" onclick="app.dotacoes.closeComplementarModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md transition">Salvar Dados</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 7. DOTAÇÕES: CANCELAR PEDIDO COM JUSTIFICATIVA                    -->
      <!-- ================================================================= -->
      <div id="modal-cancelar-dotacao" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-rose-200 fade-in">
          <div class="text-center mb-4">
            <span class="inline-block p-3 bg-rose-50 text-rose-600 rounded-2xl mb-2 text-xl">🚫</span>
            <h3 class="text-base font-black text-slate-900">Cancelar Pedido de Dotação</h3>
            <p id="cancel-info-pedido" class="text-xs text-slate-500 mt-1"></p>
          </div>
          <form onsubmit="app.dotacoes.confirmCancelarDotacao(event)" class="space-y-3.5 text-xs">
            <input type="hidden" id="cancel-dot-id">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Motivo do Cancelamento</label>
              <textarea id="cancel-field-motivo" required rows="2" placeholder="Ex: Pedido duplicado, cancelado pelo setor solicitante ou processo não prosseguiu..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-rose-500"></textarea>
            </div>
            <div class="pt-2 flex gap-2">
              <button type="button" onclick="app.dotacoes.closeCancelarModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Voltar</button>
              <button type="submit" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md transition">Confirmar Cancelamento</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 9. PAINEL DE CONTRATOS LDO: NOVO CONTRATO                         -->
      <!-- ================================================================= -->
      <div id="modal-novo-painel-contrato" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 fade-in">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-black text-slate-900">Novo Contrato no Mural Geral (LDO)</h3>
              <p class="text-[11px] text-slate-500">Cadastrar novo ajuste formal de despesa continuada</p>
            </div>
            <button onclick="app.contratos.closeNewModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <form onsubmit="app.contratos.saveNewContract(event)" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Empresa / Razão Social</label>
              <input type="text" id="panel-new-empresa" required placeholder="Ex: ECOPOÁ COMÉRCIO DE RESÍDUOS LTDA" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Nº do Contrato (Nº / Ano)</label>
                <div class="flex items-center gap-1.5">
                  <input type="text" id="panel-new-ctt-num" required maxlength="5" pattern="\d*" placeholder="Ex: 014" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 5)" class="w-24 px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-mono font-bold text-center">
                  <span class="text-slate-400 font-black text-sm">/</span>
                  <select id="panel-new-ctt-ano" class="flex-1 px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-mono font-bold">
                    <!-- Preenchido via script até o ano atual -->
                  </select>
                </div>
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Valor Anual (R$)</label>
                <input type="number" step="0.01" id="panel-new-valor" required placeholder="Ex: 48900.00" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Vencimento do Contrato</label>
                <input type="date" id="panel-new-venc-iso" required onchange="app.contratos.onDateChange('new')" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-semibold">
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block font-bold text-slate-600">Fiscal Responsável</label>
                  <button type="button" onclick="app.contratos.openAddFiscalModal('panel-new-fiscal')" class="text-[10px] font-black text-blue-600 hover:text-blue-800 transition">+ Fiscal</button>
                </div>
                <div class="flex items-center gap-1.5">
                  <select id="panel-new-fiscal" class="flex-1 px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold uppercase">
                    <!-- Fiscais dinâmicos -->
                  </select>
                  <button type="button" onclick="app.contratos.deleteSelectedFiscal('panel-new-fiscal')" class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs" title="Excluir Fiscal Selecionado (Apenas Administrador)">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            <div class="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-2">
              <div class="flex items-center justify-between">
                <label class="block font-black text-slate-700 text-xs">Prazo / Informação de Vencimento</label>
                <span class="text-[10px] text-blue-600 font-bold">Sobrescreve a bandeira/cor se preenchido</span>
              </div>
              
              <!-- Seletor exclusivo: Não informado | Período em Meses | Data Específica -->
              <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-xl text-center font-bold text-[11px]">
                <label id="lbl-new-prazo-none" onclick="app.contratos.onPrazoTypeChange('new', 'NONE')" class="cursor-pointer py-1.5 rounded-lg transition bg-white text-blue-700 shadow-xs">
                  <input type="radio" name="panel-new-prazo-type" value="NONE" class="sr-only" checked>
                  <span>Não Informado</span>
                </label>
                <label id="lbl-new-prazo-meses" onclick="app.contratos.onPrazoTypeChange('new', 'MESES')" class="cursor-pointer py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900">
                  <input type="radio" name="panel-new-prazo-type" value="MESES" class="sr-only">
                  <span>Período (Meses)</span>
                </label>
                <label id="lbl-new-prazo-data" onclick="app.contratos.onPrazoTypeChange('new', 'DATA')" class="cursor-pointer py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900">
                  <input type="radio" name="panel-new-prazo-type" value="DATA" class="sr-only">
                  <span>Data Específica</span>
                </label>
              </div>

              <!-- Opção 1: Período em Meses (Sem campo livre) -->
              <div id="panel-new-prazo-meses-wrap" class="hidden pt-1">
                <div class="flex items-center gap-2">
                  <select id="panel-new-prazo-meses-select" onchange="app.contratos.onPrazoMesesSelectChange('new')" class="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs outline-none focus:border-blue-500">
                    <option value="6">6 Meses</option>
                    <option value="12" selected>12 Meses</option>
                    <option value="24">24 Meses</option>
                    <option value="36">36 Meses</option>
                    <option value="48">48 Meses</option>
                    <option value="60">60 Meses</option>
                    <option value="OUTRO">Outro número de meses...</option>
                  </select>
                  <div id="panel-new-prazo-meses-custom-wrap" class="hidden flex items-center gap-1">
                    <input type="number" id="panel-new-prazo-meses-custom" min="1" max="120" placeholder="Qtd" class="w-16 px-2 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-center outline-none focus:border-blue-500" oninput="app.contratos.onPrazoCustomMonthsInput('new')">
                    <span class="text-xs font-bold text-slate-500">meses</span>
                  </div>
                </div>
                <div id="panel-new-prazo-meses-preview" class="text-[10px] text-blue-700 font-semibold mt-1"></div>
              </div>

              <!-- Opção 2: Data Específica (Campo date restrito) -->
              <div id="panel-new-prazo-data-wrap" class="hidden pt-1">
                <input type="date" id="panel-new-prazo-data-input" onchange="app.contratos.onPrazoDateInputChange('new')" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-xs outline-none focus:border-blue-500">
                <div id="panel-new-prazo-data-preview" class="text-[10px] text-blue-700 font-semibold mt-1"></div>
              </div>

              <!-- Info quando não informado -->
              <div id="panel-new-prazo-none-info" class="text-[10px] text-slate-500 italic">
                ℹ️ A notificação e a cor da bandeira utilizarão o campo <strong>Vencimento do Contrato</strong> acima.
              </div>

              <!-- Campo oculto com o valor final estruturado -->
              <input type="hidden" id="panel-new-prazo-txt" value="">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Objeto do Contrato</label>
              <textarea id="panel-new-objeto" rows="2" placeholder="Ex: Coleta, transporte e incineração de resíduos de saúde..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"></textarea>
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Observação Institucional (Opcional)</label>
              <textarea id="panel-new-observacao" rows="2" placeholder="Observações, ressalvas ou histórico administrativo (assinatura/rubrica automática ao gravar)..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"></textarea>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-slate-600">Link Oficial do Contrato (Portal / Betha Cloud)</label>
                <a id="panel-new-link-preview" href="#" target="_blank" rel="noopener noreferrer" class="hidden text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <span>↗ Abrir Link</span>
                </a>
              </div>
              <div class="relative flex items-center">
                <span class="absolute left-3 text-slate-400 text-xs">🔗</span>
                <input type="url" id="panel-new-link" placeholder="Ex: https://transparencia.betha.cloud/#/... ou link do 1Doc" class="w-full pl-8 pr-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-medium text-slate-700" oninput="app.contratos.onLinkInput('new')">
              </div>
              <p class="text-[10px] text-slate-400 mt-1">Direciona para a página oficial do contrato na prefeitura, arquivos e anexos.</p>
            </div>
            <div class="pt-3 flex gap-2">
              <button type="button" onclick="app.contratos.closeNewModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md">Salvar no Mural</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 10. PAINEL DE CONTRATOS LDO: EDITAR CONTRATO                      -->
      <!-- ================================================================= -->
      <div id="modal-editar-painel-contrato" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 fade-in">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-black text-slate-900">Editar Contrato no Mural (LDO)</h3>
              <p class="text-[11px] text-slate-500">Atualizar vigência, valores, fiscal e apontamentos</p>
            </div>
            <button onclick="app.contratos.closeEditModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <form onsubmit="app.contratos.confirmEdit(event)" class="space-y-3 text-xs">
            <input type="hidden" id="panel-edit-id">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Empresa / Razão Social</label>
              <input type="text" id="panel-edit-empresa" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-bold">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Nº do Contrato (Nº / Ano)</label>
                <div class="flex items-center gap-1.5">
                  <input type="text" id="panel-edit-ctt-num" required maxlength="5" pattern="\d*" placeholder="Ex: 014" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 5)" class="w-24 px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-mono font-bold text-center">
                  <span class="text-slate-400 font-black text-sm">/</span>
                  <select id="panel-edit-ctt-ano" class="flex-1 px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-mono font-bold">
                    <!-- Preenchido via script até o ano atual -->
                  </select>
                </div>
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Valor Anual (R$)</label>
                <input type="number" step="0.01" id="panel-edit-valor" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-bold">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Vencimento do Contrato</label>
                <input type="date" id="panel-edit-venc-iso" required onchange="app.contratos.onDateChange('edit')" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-semibold">
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block font-bold text-slate-600">Fiscal Responsável</label>
                  <button type="button" onclick="app.contratos.openAddFiscalModal('panel-edit-fiscal')" class="text-[10px] font-black text-amber-700 hover:text-amber-900 transition">+ Fiscal</button>
                </div>
                <div class="flex items-center gap-1.5">
                  <select id="panel-edit-fiscal" class="flex-1 px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-bold uppercase">
                    <!-- Fiscais dinâmicos -->
                  </select>
                  <button type="button" onclick="app.contratos.deleteSelectedFiscal('panel-edit-fiscal')" class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs" title="Excluir Fiscal Selecionado (Apenas Administrador)">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            <div class="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
              <div class="flex items-center justify-between">
                <label class="block font-black text-slate-800 text-xs">Prazo / Informação de Vencimento</label>
                <span class="text-[10px] text-amber-800 font-bold">Sobrescreve a bandeira/cor se preenchido</span>
              </div>
              
              <!-- Seletor exclusivo: Não informado | Período em Meses | Data Específica -->
              <div class="grid grid-cols-3 gap-1.5 p-1 bg-amber-100/70 rounded-xl text-center font-bold text-[11px]">
                <label id="lbl-edit-prazo-none" onclick="app.contratos.onPrazoTypeChange('edit', 'NONE')" class="cursor-pointer py-1.5 rounded-lg transition bg-white text-amber-800 shadow-xs">
                  <input type="radio" name="panel-edit-prazo-type" value="NONE" class="sr-only" checked>
                  <span>Não Informado</span>
                </label>
                <label id="lbl-edit-prazo-meses" onclick="app.contratos.onPrazoTypeChange('edit', 'MESES')" class="cursor-pointer py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900">
                  <input type="radio" name="panel-edit-prazo-type" value="MESES" class="sr-only">
                  <span>Período (Meses)</span>
                </label>
                <label id="lbl-edit-prazo-data" onclick="app.contratos.onPrazoTypeChange('edit', 'DATA')" class="cursor-pointer py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900">
                  <input type="radio" name="panel-edit-prazo-type" value="DATA" class="sr-only">
                  <span>Data Específica</span>
                </label>
              </div>

              <!-- Opção 1: Período em Meses (Sem campo livre) -->
              <div id="panel-edit-prazo-meses-wrap" class="hidden pt-1">
                <div class="flex items-center gap-2">
                  <select id="panel-edit-prazo-meses-select" onchange="app.contratos.onPrazoMesesSelectChange('edit')" class="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs outline-none focus:border-amber-500">
                    <option value="6">6 Meses</option>
                    <option value="12" selected>12 Meses</option>
                    <option value="24">24 Meses</option>
                    <option value="36">36 Meses</option>
                    <option value="48">48 Meses</option>
                    <option value="60">60 Meses</option>
                    <option value="OUTRO">Outro número de meses...</option>
                  </select>
                  <div id="panel-edit-prazo-meses-custom-wrap" class="hidden flex items-center gap-1">
                    <input type="number" id="panel-edit-prazo-meses-custom" min="1" max="120" placeholder="Qtd" class="w-16 px-2 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-center outline-none focus:border-amber-500" oninput="app.contratos.onPrazoCustomMonthsInput('edit')">
                    <span class="text-xs font-bold text-slate-500">meses</span>
                  </div>
                </div>
                <div id="panel-edit-prazo-meses-preview" class="text-[10px] text-amber-900 font-semibold mt-1"></div>
              </div>

              <!-- Opção 2: Data Específica (Campo date restrito) -->
              <div id="panel-edit-prazo-data-wrap" class="hidden pt-1">
                <input type="date" id="panel-edit-prazo-data-input" onchange="app.contratos.onPrazoDateInputChange('edit')" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-xs outline-none focus:border-amber-500">
                <div id="panel-edit-prazo-data-preview" class="text-[10px] text-amber-900 font-semibold mt-1"></div>
              </div>

              <!-- Info quando não informado -->
              <div id="panel-edit-prazo-none-info" class="text-[10px] text-slate-500 italic">
                ℹ️ A notificação e a cor da bandeira utilizarão o campo <strong>Vencimento do Contrato</strong> acima.
              </div>

              <!-- Campo oculto com o valor final estruturado -->
              <input type="hidden" id="panel-edit-prazo-txt" value="">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Objeto do Contrato</label>
              <textarea id="panel-edit-objeto" rows="2" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500"></textarea>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-slate-600">Observação Institucional (Opcional)</label>
                <span id="panel-edit-obs-rubrica-badge" class="text-[10px] text-amber-700 font-bold truncate max-w-[240px]"></span>
              </div>
              <textarea id="panel-edit-observacao" rows="2" placeholder="Observações, ressalvas ou histórico administrativo..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500"></textarea>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-slate-600">Link Oficial do Contrato (Portal / Betha Cloud)</label>
                <a id="panel-edit-link-preview" href="#" target="_blank" rel="noopener noreferrer" class="hidden text-[10px] font-black text-amber-700 hover:text-amber-900 flex items-center gap-1">
                  <span>↗ Abrir Link</span>
                </a>
              </div>
              <div class="relative flex items-center">
                <span class="absolute left-3 text-slate-400 text-xs">🔗</span>
                <input type="url" id="panel-edit-link" placeholder="Ex: https://transparencia.betha.cloud/#/... ou link do 1Doc" class="w-full pl-8 pr-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-medium text-slate-700" oninput="app.contratos.onLinkInput('edit')">
              </div>
              <p class="text-[10px] text-slate-400 mt-1">Direciona para a página oficial do contrato na prefeitura, arquivos e anexos.</p>
            </div>
            <div class="pt-3 flex gap-2">
              <button type="button" onclick="app.contratos.closeEditModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md">Atualizar Contrato</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- MODAL AUXILIAR: ADICIONAR NOVO FISCAL                             -->
      <!-- ================================================================= -->
      <div id="modal-adicionar-fiscal" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 fade-in">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-black text-slate-900">Cadastrar Novo Fiscal</h4>
            <button onclick="app.contratos.closeAddFiscalModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <p class="text-xs text-slate-500 mb-3">Digite o nome ou sigla do servidor responsável. O sistema formatará automaticamente em maiúsculas.</p>
          <div class="space-y-3">
            <div>
              <label class="block font-bold text-slate-600 text-xs mb-1">Nome do Fiscal</label>
              <input type="text" id="input-novo-fiscal" placeholder="Ex: MARCOS" oninput="this.value = this.value.toUpperCase()" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold uppercase text-xs">
            </div>
            <div class="flex gap-2 pt-1">
              <button type="button" onclick="app.contratos.closeAddFiscalModal()" class="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-xs">Cancelar</button>
              <button type="button" onclick="app.contratos.saveNewFiscalFromModal()" class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md text-xs">Adicionar Fiscal</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 11. PAINEL DE CONTRATOS LDO: EXCLUIR DEFINITIVO                   -->
      <!-- ================================================================= -->
      <div id="modal-excluir-painel-contrato" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-rose-200 fade-in">
          <div class="text-center mb-4">
            <span class="inline-block p-3 bg-rose-50 text-rose-600 rounded-2xl mb-2">🗑️</span>
            <h3 class="text-base font-black text-slate-900">Excluir Contrato do Mural</h3>
            <p class="text-xs text-slate-500 mt-1">Ação restrita ao Administrador</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border text-xs space-y-1 mb-4">
            <div class="flex justify-between"><span class="text-slate-400 font-bold">Empresa:</span><span id="panel-delete-preview-empresa" class="font-bold"></span></div>
            <div class="flex justify-between"><span class="text-slate-400 font-bold">Valor Anual:</span><span id="panel-delete-preview-valor" class="font-black text-rose-700"></span></div>
            <div class="flex justify-between"><span class="text-slate-400 font-bold">Fiscal:</span><span id="panel-delete-preview-fiscal" class="font-bold"></span></div>
          </div>
          <form onsubmit="app.contratos.confirmDelete(event)" class="space-y-3 text-xs">
            <input type="hidden" id="panel-delete-target-id">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Digite o número do contrato (<span id="panel-delete-expected-ctt" class="font-mono text-rose-600 font-black"></span>) para confirmar:</label>
              <input type="text" id="panel-delete-typed-ctt" onpaste="app.contratos.blockPaste(event)" autocomplete="off" placeholder="Digite exatamente o número CTT..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-rose-500 font-mono font-bold text-center">
            </div>
            <div id="panel-delete-error-msg" class="hidden text-rose-600 font-bold text-[11px] text-center"></div>
            <div class="pt-2 flex gap-2">
              <button type="button" onclick="app.contratos.closeDeleteModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md">Excluir Contrato</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 12. PAINEL ADMINISTRATIVO MASTER (LINKS, EXAMES, USUÁRIOS, PERMS) -->
      <!-- ================================================================= -->
      <div id="admin-panel" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden fade-in">
          
          <!-- TOPO DO PAINEL ADMIN -->
          <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2.5">
              <span class="p-2 bg-blue-600 text-white rounded-xl shadow-sm">⚙️</span>
              <div>
                <h3 class="font-black text-slate-900 text-base">Painel de Controle Municipal</h3>
                <p class="text-[11px] text-slate-400">Configurações globais, atalhos, usuários e permissões</p>
              </div>
            </div>
            <button onclick="app.admin.exit()" class="px-3.5 py-1.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 rounded-xl transition text-slate-700">Fechar ✕</button>
          </div>

          <!-- NAVEGAÇÃO DE ABAS DO ADMIN -->
          <div class="flex border-b border-slate-200 overflow-x-auto bg-white px-2">
            <button id="admin-tab-btn-links" onclick="app.admin.switchTab('links')" class="px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600 whitespace-nowrap">Links & Atalhos</button>
            <button id="admin-tab-btn-contrato" onclick="app.admin.switchTab('contrato')" class="px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600 whitespace-nowrap">Exames & Procedimentos</button>
            <button id="admin-tab-btn-usuarios" onclick="app.admin.switchTab('usuarios')" class="px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600 whitespace-nowrap">Usuários & Acessos</button>
            <button id="admin-tab-btn-permissoes" onclick="app.admin.switchTab('permissoes')" class="px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600 whitespace-nowrap">Matriz de Permissões</button>
            <button id="admin-tab-btn-logs" onclick="app.admin.switchTab('logs')" class="px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600 whitespace-nowrap">📜 Trilha de Auditoria (Logs)</button>
          </div>

          <!-- CORPO DAS ABAS DO ADMIN -->
          <div class="flex-grow overflow-y-auto p-4 sm:p-6 custom-scroll">
            
            <!-- ABA 1: LINKS & ATALHOS -->
            <div id="admin-view-links" class="space-y-6">
              <div class="bg-slate-50 p-4 rounded-2xl border space-y-3">
                <span id="form-title-label" class="font-bold text-xs text-slate-700 uppercase">Novo Atalho</span>
                <input type="hidden" id="edit-id">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input type="text" id="field-title" placeholder="Nome do Sistema (Ex: Betha Cloud)" class="p-2.5 bg-white border rounded-xl outline-none font-bold">
                  <input type="url" id="field-url" placeholder="https://..." class="p-2.5 bg-white border rounded-xl outline-none">
                </div>
                <input type="text" id="field-desc" placeholder="Breve descrição do sistema..." class="w-full p-2.5 bg-white border rounded-xl text-xs outline-none">
                <div class="flex gap-2 justify-end pt-1">
                  <button id="btn-cancel-edit" onclick="app.admin.resetForm()" class="hidden px-3.5 py-1.5 text-xs font-bold border rounded-xl text-slate-500">Cancelar</button>
                  <button id="btn-save" onclick="app.admin.saveLink()" class="px-4 py-2 text-xs font-black bg-blue-600 text-white rounded-xl shadow">Salvar Sistema</button>
                </div>
              </div>

              <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Arraste para reordenar os atalhos:</span>
                <div id="admin-list-draggable" class="space-y-2"></div>
              </div>
            </div>

            <!-- ABA 2: PROCEDIMENTOS DO CONTRATO DE EXAMES -->
            <div id="admin-view-contrato" class="hidden space-y-6">
              <div class="bg-slate-50 p-4 rounded-2xl border space-y-3">
                <span id="adm-exam-form-title" class="font-bold text-xs text-slate-700 uppercase">Adicionar / Editar Exame no Contrato Ativo</span>
                <input type="hidden" id="adm-exam-id">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <input type="text" id="adm-exam-item" placeholder="Nº Item (Ex: 01)" class="p-2.5 bg-white border rounded-xl outline-none font-bold">
                  <select id="adm-exam-cat" class="p-2.5 bg-white border rounded-xl outline-none font-bold">
                    <option value="Laboratorial">Laboratorial</option>
                    <option value="Imagem">Imagem</option>
                  </select>
                  <input type="number" id="adm-exam-qtd" placeholder="Qtd. Empenhada" class="p-2.5 bg-white border rounded-xl outline-none font-bold">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input type="text" id="adm-exam-desc-emp" placeholder="Descrição no Empenho..." class="p-2.5 bg-white border rounded-xl outline-none font-semibold">
                  <input type="text" id="adm-exam-desc-prest" placeholder="Descrição / Cód. no Prestador..." class="p-2.5 bg-white border rounded-xl outline-none">
                </div>
                <input type="number" id="adm-exam-saldo-ant" placeholder="Saldo Anterior Inicial..." class="w-full p-2.5 bg-white border rounded-xl text-xs outline-none">
                <div class="flex gap-2 justify-end pt-1">
                  <button id="btn-adm-cancel-exam" onclick="app.audit.resetExamForm()" class="hidden px-3.5 py-1.5 text-xs font-bold border rounded-xl text-slate-500">Cancelar</button>
                  <button id="btn-adm-save-exam" onclick="app.audit.saveExam()" class="px-4 py-2 text-xs font-black bg-blue-600 text-white rounded-xl shadow">Salvar Procedimento</button>
                </div>
              </div>

              <div class="border rounded-2xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 font-black text-[10px] uppercase text-slate-600">
                    <tr>
                      <th class="p-3 text-center">Item</th>
                      <th class="p-3">Categoria</th>
                      <th class="p-3">Descrição</th>
                      <th class="p-3 text-right">Qtd Emp.</th>
                      <th class="p-3 text-right">Saldo Ant.</th>
                      <th class="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody id="adm-exams-list-tbody" class="divide-y divide-slate-200"></tbody>
                </table>
              </div>
            </div>

            <!-- ABA 3: USUÁRIOS & ACESSOS -->
            <div id="admin-view-usuarios" class="hidden space-y-6">
              <div class="bg-slate-50 p-4 rounded-2xl border space-y-3">
                <div class="flex items-center justify-between">
                  <span id="user-form-title-label" class="font-bold text-xs text-slate-700 uppercase">Cadastrar Novo Usuário</span>
                  <span class="text-[10px] text-slate-400 italic">Dica: clique em um usuário da tabela abaixo para editá-lo</span>
                </div>
                <input type="hidden" id="user-edit-id">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input type="text" id="user-field-nome" placeholder="Nome Completo do Servidor" class="p-2.5 bg-white border rounded-xl outline-none font-bold">
                  <input type="text" id="user-field-login" placeholder="Nome de Usuário (login)" class="p-2.5 bg-white border rounded-xl outline-none font-mono">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input type="password" id="user-field-senha" placeholder="Senha inicial" class="p-2.5 bg-white border rounded-xl outline-none">
                  <select id="user-field-perfil" class="p-2.5 bg-white border rounded-xl outline-none font-bold">
                    <option value="Comprador">Comprador (Lança Dotações)</option>
                    <option value="Gestor Financeiro">Gestor Financeiro (Audita & Dá Baixa)</option>
                    <option value="Visualizador">Visualizador (Somente Consulta)</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
                <div class="flex justify-end gap-2 pt-1">
                  <button id="btn-cancel-edit-user" onclick="app.admin.resetUserForm()" class="hidden px-3.5 py-1.5 text-xs font-bold border rounded-xl text-slate-500 hover:bg-slate-200 transition">Cancelar</button>
                  <button id="btn-save-user" onclick="app.admin.saveUser()" class="px-4 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition">Cadastrar Usuário</button>
                </div>
              </div>

              <div class="border rounded-2xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 font-black text-[10px] uppercase text-slate-600">
                    <tr>
                      <th class="p-3">Nome</th>
                      <th class="p-3">Login</th>
                      <th class="p-3">Perfil</th>
                      <th class="p-3">Criado em</th>
                      <th class="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody id="adm-users-list-tbody" class="divide-y divide-slate-200"></tbody>
                </table>
              </div>
            </div>

            <!-- ABA 4: MATRIZ DE PERMISSÕES -->
            <div id="admin-view-permissoes" class="hidden space-y-4">
              <div class="flex items-center justify-between pb-2 border-b">
                <span class="text-xs font-bold text-slate-500 uppercase">Defina o que cada perfil pode executar no portal:</span>
                <button onclick="app.admin.savePermissions()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition">Salvar Matriz de Permissões</button>
              </div>

              <div class="border rounded-2xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 font-black text-[10px] uppercase text-slate-600">
                    <tr>
                      <th class="p-3">Módulo & Ação Institucional</th>
                      <th class="p-3 text-center w-32">Comprador</th>
                      <th class="p-3 text-center w-36">Gestor Financeiro</th>
                      <th class="p-3 text-center w-32">Visualizador</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <!-- AUDITORIA DE EXAMES -->
                    <tr class="bg-blue-50/80 font-bold text-blue-900 border-b border-blue-200">
                      <td class="p-2.5 font-black text-xs flex items-center gap-2">
                         <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Acessar Área de Auditoria
                      </td>
                      <td class="p-2.5 text-center bg-blue-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-blue-950">
                          <input type="checkbox" id="perm-comprador-audit_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-blue-600 rounded"> Acesso
                        </label>
                      </td>
                      <td class="p-2.5 text-center bg-blue-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-blue-950">
                          <input type="checkbox" id="perm-gestor-audit_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-blue-600 rounded"> Acesso
                        </label>
                      </td>
                      <td class="p-2.5 text-center bg-blue-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-blue-950">
                          <input type="checkbox" id="perm-visualizador-audit_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-blue-600 rounded"> Acesso
                        </label>
                      </td>
                    </tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Editar Saldos e Faturamento</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-audit_edit_values" class="w-4 h-4 accent-blue-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-audit_edit_values" class="w-4 h-4 accent-blue-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-audit_edit_values" class="w-4 h-4 accent-blue-600"></td></tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Criar Novos Contratos de Exames</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-audit_create_contract" class="w-4 h-4 accent-blue-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-audit_create_contract" class="w-4 h-4 accent-blue-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-audit_create_contract" class="w-4 h-4 accent-blue-600"></td></tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Gerenciar Procedimentos (Adicionar/Excluir)</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-audit_manage_procedures" class="w-4 h-4 accent-blue-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-audit_manage_procedures" class="w-4 h-4 accent-blue-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-audit_manage_procedures" class="w-4 h-4 accent-blue-600"></td></tr>

                    <!-- LIVRO DIGITAL DE DOTAÇÕES -->
                    <tr class="bg-emerald-50/80 font-bold text-emerald-900 border-b border-emerald-200">
                      <td class="p-2.5 font-black text-xs flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Acessar Área de Dotações
                      </td>
                      <td class="p-2.5 text-center bg-emerald-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-emerald-950">
                          <input type="checkbox" id="perm-comprador-dotacoes_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-emerald-600 rounded"> Acesso
                        </label>
                      </td>
                      <td class="p-2.5 text-center bg-emerald-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-emerald-950">
                          <input type="checkbox" id="perm-gestor-dotacoes_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-emerald-600 rounded"> Acesso
                        </label>
                      </td>
                      <td class="p-2.5 text-center bg-emerald-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-emerald-950">
                          <input type="checkbox" id="perm-visualizador-dotacoes_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-emerald-600 rounded"> Acesso
                        </label>
                      </td>
                    </tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Cadastrar Pedido de Dotação</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-dotacoes_create" class="w-4 h-4 accent-emerald-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-dotacoes_create" class="w-4 h-4 accent-emerald-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-dotacoes_create" class="w-4 h-4 accent-emerald-600"></td></tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Dar Baixa Contábil (Confirmar Empenho)</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-dotacoes_check" class="w-4 h-4 accent-emerald-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-dotacoes_check" class="w-4 h-4 accent-emerald-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-dotacoes_check" class="w-4 h-4 accent-emerald-600"></td></tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Editar Lançamento de Dotação</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-dotacoes_edit" class="w-4 h-4 accent-emerald-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-dotacoes_edit" class="w-4 h-4 accent-emerald-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-dotacoes_edit" class="w-4 h-4 accent-emerald-600"></td></tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Excluir Pedido de Dotação</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-dotacoes_delete" class="w-4 h-4 accent-emerald-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-dotacoes_delete" class="w-4 h-4 accent-emerald-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-dotacoes_delete" class="w-4 h-4 accent-emerald-600"></td></tr>

                    <!-- PAINEL GERAL DE CONTRATOS LDO -->
                    <tr class="bg-indigo-50/80 font-bold text-indigo-900 border-b border-indigo-200">
                      <td class="p-2.5 font-black text-xs flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Acessar Área de Contratos
                      </td>
                      <td class="p-2.5 text-center bg-indigo-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-indigo-950">
                          <input type="checkbox" id="perm-comprador-panel_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-indigo-600 rounded"> Acesso
                        </label>
                      </td>
                      <td class="p-2.5 text-center bg-indigo-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-indigo-950">
                          <input type="checkbox" id="perm-gestor-panel_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-indigo-600 rounded"> Acesso
                        </label>
                      </td>
                      <td class="p-2.5 text-center bg-indigo-100/50">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer font-black text-[11px] text-indigo-950">
                          <input type="checkbox" id="perm-visualizador-panel_access" onchange="app.admin.updatePermMatrixState()" class="w-4 h-4 accent-indigo-600 rounded"> Acesso
                        </label>
                      </td>
                    </tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Adicionar Novo Contrato no Mural</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-panel_create" class="w-4 h-4 accent-indigo-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-panel_create" class="w-4 h-4 accent-indigo-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-panel_create" class="w-4 h-4 accent-indigo-600"></td></tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Editar Dados do Contrato no Mural</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-panel_edit" class="w-4 h-4 accent-indigo-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-panel_edit" class="w-4 h-4 accent-indigo-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-panel_edit" class="w-4 h-4 accent-indigo-600"></td></tr>
                    <tr><td class="p-3 pl-6 text-slate-700">Arquivar / Desarquivar Contrato</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-panel_archive" class="w-4 h-4 accent-indigo-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-panel_archive" class="w-4 h-4 accent-indigo-600"></td><td class="p-3 text-center"><input type="checkbox" id="perm-visualizador-panel_archive" class="w-4 h-4 accent-indigo-600"></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ABA 5: TRILHA DE AUDITORIA & REGISTRO DE LOGS -->
            <div id="admin-view-logs" class="hidden space-y-4">
              <!-- BARRA SUPERIOR DE CONTROLE E FILTROS -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span class="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📜</span> Trilha de Auditoria Institucional
                    </span>
                    <p class="text-[11px] text-slate-500">Histórico de ações, alterações e usuários gravado no Google Sheets</p>
                  </div>
                  <div class="flex items-center gap-2 self-end sm:self-auto">
                    <button onclick="app.admin.loadAuditLogs(true)" title="Recarregar dados da nuvem" class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
                      <span>🔄</span> Atualizar Logs
                    </button>
                    <button onclick="app.admin.exportAuditLogsReport()" title="Imprimir Relatório Oficial" class="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs">
                      <span>🖨️</span> Imprimir Relatório A4
                    </button>
                  </div>
                </div>

                <!-- FILTROS AVANÇADOS -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                  <div class="sm:col-span-1">
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Buscar por Palavra-Chave</label>
                    <input type="text" id="adm-logs-filter-search" oninput="app.admin.setAuditLogsFilter('search', this.value)" placeholder="Buscar qualquer termo..." class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Filtrar por Usuário</label>
                    <select id="adm-logs-filter-user" onchange="app.admin.setAuditLogsFilter('user', this.value)" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl outline-none font-bold text-slate-800">
                      <option value="todos">Todos os Usuários</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Filtrar por Módulo</label>
                    <select id="adm-logs-filter-modulo" onchange="app.admin.setAuditLogsFilter('modulo', this.value)" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl outline-none font-bold text-slate-800">
                      <option value="todos">Todos os Módulos</option>
                      <option value="Dotações">Dotações</option>
                      <option value="Contratos LDO">Contratos LDO</option>
                      <option value="Auditoria de Exames">Auditoria de Exames</option>
                      <option value="Gestão de Usuários">Gestão de Usuários</option>
                      <option value="Permissões">Permissões</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Data Específica</label>
                    <input type="date" id="adm-logs-filter-date" onchange="app.admin.setAuditLogsFilter('data', this.value)" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800">
                  </div>
                </div>

                <div class="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                  <span id="adm-logs-count-info" class="font-bold">Carregando registros...</span>
                  <button onclick="document.getElementById('adm-logs-filter-search').value=''; document.getElementById('adm-logs-filter-user').value='todos'; document.getElementById('adm-logs-filter-modulo').value='todos'; document.getElementById('adm-logs-filter-date').value=''; app.admin.setAuditLogsFilter('search',''); app.admin.setAuditLogsFilter('user','todos'); app.admin.setAuditLogsFilter('modulo','todos'); app.admin.setAuditLogsFilter('data','');" class="text-blue-600 hover:underline font-bold text-[10px]">Limpar Filtros</button>
                </div>
              </div>

              <!-- TABELA DE REGISTROS -->
              <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div class="max-h-[460px] overflow-y-auto custom-scroll relative">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="sticky top-0 bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300 z-10">
                      <tr>
                        <th class="p-3 w-36">Data / Hora</th>
                        <th class="p-3 w-28">Usuário</th>
                        <th class="p-3 w-32">Módulo</th>
                        <th class="p-3 w-36">Ação</th>
                        <th class="p-3">Detalhes da Operação</th>
                        <th class="p-3 w-24">Ref / ID</th>
                      </tr>
                    </thead>
                    <tbody id="adm-logs-list-tbody" class="divide-y divide-slate-100">
                      <!-- Linhas geradas via JavaScript -->
                    </tbody>
                  </table>
                  <div id="adm-logs-empty" class="hidden p-10 text-center text-slate-400 font-medium text-xs">
                    <span class="block text-2xl mb-1">🔍</span>
                    Nenhum log de auditoria encontrado para os filtros selecionados.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 13. REDEFINIR SENHA DE USUÁRIO                                    -->
      <!-- ================================================================= -->
      <div id="modal-reset-password" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 fade-in">
          <div class="text-center mb-4">
            <span class="inline-block p-3 bg-blue-50 text-blue-600 rounded-2xl mb-2">🔑</span>
            <h3 class="text-base font-black text-slate-900">Redefinir Senha</h3>
            <p class="text-xs text-slate-500 mt-1">Alterando senha de <b id="reset-pass-target-user" class="text-blue-700"></b></p>
          </div>
          <form onsubmit="app.admin.confirmResetPassword(event)" class="space-y-3 text-xs">
            <input type="hidden" id="reset-pass-target-id">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Nova Senha</label>
              <input type="password" id="reset-pass-new-password" required minlength="4" placeholder="Digite a nova senha..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-600 font-bold">
            </div>
            <div class="pt-2 flex gap-2">
              <button type="button" onclick="app.admin.closeResetPasswordModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md">Salvar Nova Senha</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 14. BALANCEADOR E REDISTRIBUIDOR DE COTAS ORÇAMENTÁRIAS           -->
      <!-- ================================================================= -->
      <div id="modal-balanceador-cotas" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-2 sm:p-4">
        <div class="bg-white rounded-3xl p-5 sm:p-7 max-w-6xl w-full shadow-2xl border border-slate-100 fade-in flex flex-col max-h-[95vh]">
          <!-- CABEÇALHO DO MODAL -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
            <div class="flex items-center gap-3">
              <span class="p-2.5 bg-amber-50 text-amber-600 rounded-2xl text-xl shadow-inner">⚖️</span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-black text-slate-900">Simulador & Balanceador de Cotas Orçamentárias</h3>
                  <span class="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 uppercase">Base: Histórico Faturado Real</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">Redistribuição matemática de quantitativos para o próximo empenho, eliminando déficits e estrita observância ao teto contratual.</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="app.audit.imprimirCotasBalanceadas()" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition" title="Imprimir Relatório Oficial de Cotas Balanceadas (A4 Paisagem)">
                <span>🖨️</span> Imprimir Cotas (A4)
              </button>
              <button onclick="app.audit.closeBalanceadorModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1 text-lg">✕</button>
            </div>
          </div>

          <!-- PARÂMETROS DA SIMULAÇÃO (CONTROLES INTERATIVOS) -->
          <div class="my-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 flex-shrink-0">
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Meses no Histórico</label>
                <input type="number" id="bal-meses-hist" min="1" max="24" value="4" oninput="app.audit.calcularBalanceamento()" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-center outline-none focus:border-amber-500" title="Quantidade de meses auditados na fatura real">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Período Projetado</label>
                <select id="bal-meses-proj" onchange="app.audit.calcularBalanceamento()" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-500">
                  <option value="12" selected>12 Meses (Anual)</option>
                  <option value="6">6 Meses (Semestral)</option>
                  <option value="4">4 Meses (Quadrimestral)</option>
                  <option value="3">3 Meses (Trimestral)</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Margem Segurança</label>
                <select id="bal-margem" onchange="app.audit.calcularBalanceamento()" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-500">
                  <option value="0">0% (Demanda Estrita)</option>
                  <option value="0.05">+5% (Sazonalidade Leve)</option>
                  <option value="0.10">+10% (Moderada)</option>
                  <option value="0.15" selected>+15% (Recomendada SUS)</option>
                  <option value="0.20">+20% (Alta Margem)</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Reserva Mínima (un)</label>
                <select id="bal-reserva-min" onchange="app.audit.calcularBalanceamento()" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-500" title="Cota mínima técnica para exames sem demanda no período, evitando desassistência">
                  <option value="5">5 unidades</option>
                  <option value="10" selected>10 unidades (Padrão)</option>
                  <option value="15">15 unidades</option>
                  <option value="20">20 unidades</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Teto Alvo Empenho (R$)</label>
                <input type="number" step="0.01" id="bal-teto-alvo" value="129163.00" oninput="app.audit.calcularBalanceamento()" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-black text-blue-900 text-right outline-none focus:border-amber-500" title="Valor teto financeiro limite que não pode ser ultrapassado">
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/60">
              <label class="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 font-semibold">
                <input type="checkbox" id="bal-preservar-nf" checked onchange="app.audit.calcularBalanceamento()" class="w-4 h-4 rounded text-amber-600 border-slate-300">
                <span>Preservar Reserva Fiscal/NFS-e (Item NF: R$ 4.291,20)</span>
              </label>
              <div class="text-[11px] text-slate-500 italic">
                * O algoritmo garante por convergência matemática que a soma total seja estritamente ≤ ao Teto Financeiro.
              </div>
            </div>
          </div>

          <!-- CARDS DE RESUMO / KPIS DA SIMULAÇÃO -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3 flex-shrink-0">
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-center">
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Teto Alvo Limite</div>
              <div id="bal-kpi-teto" class="text-sm sm:text-base font-black text-slate-900 mt-0.5">R$ 129.163,00</div>
              <div class="text-[9px] text-slate-500">Limite Inviolável</div>
            </div>
            <div class="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-2.5 text-center">
              <div class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Custo Projetado</div>
              <div id="bal-kpi-custo-novo" class="text-sm sm:text-base font-black text-emerald-700 mt-0.5">R$ 0,00</div>
              <div id="bal-kpi-badge-teto" class="text-[9px] font-bold text-emerald-600">✓ 100% Dentro do Teto</div>
            </div>
            <div class="bg-blue-50/50 border border-blue-200 rounded-2xl p-2.5 text-center">
              <div class="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Folga Residual</div>
              <div id="bal-kpi-folga" class="text-sm sm:text-base font-black text-blue-700 mt-0.5">R$ 0,00</div>
              <div class="text-[9px] text-blue-600">Margem Orçamentária</div>
            </div>
            <div class="bg-purple-50/50 border border-purple-200 rounded-2xl p-2.5 text-center">
              <div class="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Itens Reforçados</div>
              <div id="bal-kpi-reforcados" class="text-sm sm:text-base font-black text-purple-700 mt-0.5">0</div>
              <div class="text-[9px] text-purple-600">Déficits Eliminados</div>
            </div>
            <div class="bg-amber-50/50 border border-amber-200 rounded-2xl p-2.5 text-center">
              <div class="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Itens Otimizados</div>
              <div id="bal-kpi-otimizados" class="text-sm sm:text-base font-black text-amber-700 mt-0.5">0</div>
              <div class="text-[9px] text-amber-600">Ociosidade Reduzida</div>
            </div>
          </div>

          <!-- BARRA DE FILTROS DA TABELA DE SIMULAÇÃO -->
          <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2 flex-shrink-0 text-xs">
            <div class="flex-1 w-full sm:w-auto flex gap-2">
              <input type="text" id="bal-filter-search" oninput="app.audit.filterBalanceamento()" placeholder="Filtrar por item ou descrição..." class="flex-1 px-3 py-1.5 bg-slate-50 border rounded-xl outline-none focus:border-amber-500">
              <select id="bal-filter-status" onchange="app.audit.filterBalanceamento()" class="px-2.5 py-1.5 bg-slate-50 border rounded-xl font-semibold outline-none focus:border-amber-500">
                <option value="ALL">Todos os 76 Procedimentos</option>
                <option value="UP">Apenas Reforçados (+ Demanda)</option>
                <option value="DOWN">Apenas Otimizados (- Ociosos)</option>
                <option value="RESERVE">Apenas Reserva Técnica (Sem Fatura)</option>
              </select>
            </div>
            <div class="text-[11px] text-slate-500 font-semibold" id="bal-row-counter">
              Exibindo 76 itens
            </div>
          </div>

          <!-- TABELA COMPARATIVA DINÂMICA (ROLA COM CABEÇALHO FIXO) -->
          <div class="flex-grow overflow-x-auto overflow-y-auto border border-slate-200 rounded-2xl custom-scroll relative">
            <table class="w-full text-left border-collapse text-[11px]">
              <thead class="sticky top-0 bg-slate-100 text-slate-700 font-bold uppercase text-[10px] shadow-sm z-10">
                <tr class="border-b border-slate-200">
                  <th class="py-2.5 px-2 text-center w-12">Item</th>
                  <th class="py-2.5 px-3">Procedimento Laboratorial</th>
                  <th class="py-2.5 px-2 text-right">Vl. Unit.</th>
                  <th class="py-2.5 px-2 text-right bg-slate-200/50">Cota Atual</th>
                  <th class="py-2.5 px-2 text-center">Faturado Real (4m)</th>
                  <th class="py-2.5 px-2 text-right">Média/Mês</th>
                  <th class="py-2.5 px-2.5 text-right bg-amber-50 font-black text-amber-900">Cota Sugerida</th>
                  <th class="py-2.5 px-2 text-center">Variação (Δ)</th>
                  <th class="py-2.5 px-2.5 text-right font-black">Novo Total</th>
                  <th class="py-2.5 px-3">Justificativa Técnica do Ajuste</th>
                </tr>
              </thead>
              <tbody id="table-balanceador-body" class="divide-y divide-slate-100">
                <!-- Linhas inseridas dinamicamente -->
              </tbody>
            </table>
          </div>

          <!-- RODAPÉ COM AÇÕES -->
          <div class="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 flex-shrink-0">
            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button onclick="app.audit.closeBalanceadorModal()" class="px-3.5 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">
                Fechar
              </button>
              <button onclick="app.audit.imprimirCotasBalanceadas()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5" title="Imprimir Relatório Oficial de Cotas Balanceadas formatado para caber em folha A4 Paisagem">
                <span>🖨️</span> Imprimir Cotas (A4)
              </button>
              <button onclick="app.audit.exportarCSVBalanceamento()" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5" title="Baixar planilha de simulação comparativa em Excel/CSV">
                <span>📥</span> Exportar Planilha (.CSV)
              </button>
              <button onclick="app.audit.abrirMemorandoTecnico()" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5" title="Gerar e imprimir memorando oficial com fundamentação técnica para instrução de processo de compra">
                <span>📄</span> Emitir Memorando
              </button>
            </div>
            <div class="w-full sm:w-auto">
              <button onclick="app.audit.confirmarAplicacaoCotas()" class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2" title="Substitui os quantitativos empenhados do contrato atual com as cotas sugeridas">
                <span>⚡</span> Aplicar Novas Cotas ao Contrato
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 15. MODAL DE MEMORANDO TÉCNICO OFICIAL (PRONTO PARA IMPRESSÃO A4) -->
      <!-- ================================================================= -->
      <div id="modal-memorando-tecnico" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-2 sm:p-4">
        <div class="bg-white rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl border border-slate-100 fade-in flex flex-col max-h-[95vh]">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-xl">📄</span>
              <h3 class="text-base font-black text-slate-900">Memorando de Justificativa Técnica de Rebalanceamento</h3>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="app.audit.imprimirMemorando()" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1">
                <span>🖨️</span> Imprimir / Salvar PDF
              </button>
              <button onclick="app.audit.fecharMemorandoTecnico()" class="text-slate-400 hover:text-slate-600 font-bold p-1 text-lg">✕</button>
            </div>
          </div>

          <div id="conteudo-memorando-tecnico" class="flex-grow overflow-y-auto custom-scroll p-4 my-2 border border-slate-200 rounded-2xl bg-white text-slate-900 text-xs space-y-4">
            <!-- Conteúdo montado dinamicamente -->
          </div>

          <div class="pt-2 flex justify-end flex-shrink-0">
            <button onclick="app.audit.fecharMemorandoTecnico()" class="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Fechar Visualização
            </button>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 16. MODAL DE PROCESSAMENTO & FEEDBACK DE USUÁRIO (ZERO ALERT)     -->
      <!-- ================================================================= -->
      <div id="modal-feedback-usuario" class="hidden fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 fade-in text-center relative overflow-hidden">
          
          <!-- ETAPA: TRABALHANDO / PROCESSANDO -->
          <div id="user-feedback-loading" class="space-y-4">
            <div class="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div class="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
              <span class="absolute text-xl">👤</span>
            </div>
            <div>
              <h3 id="user-feedback-loading-title" class="text-base sm:text-lg font-black text-slate-900">Gravando Usuário no Sistema...</h3>
              <p class="text-xs text-slate-500 mt-1">Sincronizando credenciais e permissões com o servidor</p>
            </div>

            <!-- Passos Visuais de Progresso -->
            <div class="p-3.5 bg-slate-50 rounded-2xl border text-left text-xs space-y-2.5">
              <div class="flex items-center gap-2 text-emerald-700 font-bold">
                <span class="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
                <span>Validação dos dados e credenciais</span>
              </div>
              <div class="flex items-center gap-2 text-blue-700 font-bold animate-pulse">
                <span class="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">⏳</span>
                <span>Gravando credenciais no servidor em nuvem...</span>
              </div>
              <div class="flex items-center gap-2 text-slate-400">
                <span class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">○</span>
                <span>Atualizando matriz e tabela de acessos</span>
              </div>
            </div>

            <p class="text-[11px] text-slate-400 italic">Por favor, aguarde alguns instantes enquanto a nuvem conclui o registro com segurança.</p>
          </div>

          <!-- ETAPA: SUCESSO -->
          <div id="user-feedback-success" class="hidden space-y-4">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-inner font-bold">
              ✓
            </div>
            <div>
              <h3 id="user-feedback-success-title" class="text-base sm:text-lg font-black text-slate-900">Usuário Cadastrado com Sucesso!</h3>
              <p class="text-xs text-slate-500 mt-1">As credenciais foram salvas e sincronizadas com sucesso.</p>
            </div>

            <div class="p-3.5 bg-slate-50 rounded-2xl border text-left text-xs space-y-1.5">
              <div class="flex justify-between"><span class="text-slate-500">Nome:</span> <strong id="ufb-res-nome" class="text-slate-800 font-bold"></strong></div>
              <div class="flex justify-between"><span class="text-slate-500">Login:</span> <strong id="ufb-res-login" class="font-mono text-blue-700 font-black"></strong></div>
              <div class="flex justify-between"><span class="text-slate-500">Perfil:</span> <span id="ufb-res-perfil" class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800"></span></div>
              <div class="flex justify-between"><span class="text-slate-500">Status:</span> <span class="text-emerald-700 font-bold">✓ Ativo e Liberado</span></div>
            </div>

            <div class="pt-2 flex gap-2">
              <button onclick="app.admin.finishUserModal(false)" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition">
                + Cadastrar Outro
              </button>
              <button onclick="app.admin.finishUserModal(true)" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition">
                ✓ Concluir
              </button>
            </div>
          </div>

          <!-- ETAPA: ERRO -->
          <div id="user-feedback-error" class="hidden space-y-4">
            <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-inner font-bold">
              ✕
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black text-slate-900">Falha na Sincronização</h3>
              <p id="user-feedback-error-msg" class="text-xs text-rose-600 mt-1"></p>
            </div>
            <div class="pt-2">
              <button onclick="app.admin.closeFeedbackModal()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition">
                Fechar e Tentar Novamente
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 17. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE USUÁRIO (ZERO ALERT)       -->
      <!-- ================================================================= -->
      <div id="modal-confirm-delete-user" class="hidden fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-rose-200 fade-in text-center">
          <div class="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
            🗑️
          </div>
          <h3 class="text-base font-black text-slate-900">Excluir Usuário</h3>
          <p class="text-xs text-slate-500 mt-1">Deseja realmente remover o acesso deste servidor?</p>
          
          <div class="my-4 p-3 bg-slate-50 rounded-2xl border text-xs">
            <div class="font-bold text-slate-800" id="del-user-name"></div>
            <div class="font-mono text-blue-700 font-bold text-[11px] mt-0.5" id="del-user-login"></div>
          </div>

          <input type="hidden" id="del-user-target-id">
          <div class="flex gap-2">
            <button onclick="app.admin.closeDeleteUserModal()" class="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">Cancelar</button>
            <button onclick="app.admin.confirmDeleteUser()" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md transition">Sim, Excluir</button>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 18. MODAL DE ESPERA VISUAL & SINCRONIZAÇÃO DA PLANILHA            -->
      <!-- ================================================================= -->
      <div id="modal-espera-visual" class="hidden fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 fade-in text-center relative overflow-hidden">
          <div class="space-y-4">
            <div class="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div class="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
              <span id="global-wait-icon" class="absolute text-xl">📊</span>
            </div>
            <div>
              <h3 id="global-wait-title" class="text-base sm:text-lg font-black text-slate-900">Carregando Dados da Planilha...</h3>
              <p id="global-wait-subtitle" class="text-xs text-slate-500 mt-1">Sincronizando registros em tempo real com o servidor</p>
            </div>

            <!-- Passos Visuais de Progresso -->
            <div class="p-3.5 bg-slate-50 rounded-2xl border text-left text-xs space-y-2.5">
              <div class="flex items-center gap-2 text-emerald-700 font-bold">
                <span class="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
                <span id="global-wait-step1">Conexão segura com a nuvem estabelecida</span>
              </div>
              <div class="flex items-center gap-2 text-blue-700 font-bold animate-pulse">
                <span class="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">⏳</span>
                <span id="global-wait-step2">Consultando registros na planilha do Google...</span>
              </div>
              <div class="flex items-center gap-2 text-slate-400">
                <span class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">○</span>
                <span id="global-wait-step3">Preparando exibição e atualizando painel</span>
              </div>
            </div>

            <p class="text-[11px] text-slate-400 italic">Por favor, aguarde alguns instantes enquanto os dados da planilha são processados.</p>
          </div>
        </div>
      </div>
    `;
  }
};

