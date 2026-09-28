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
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 fade-in">
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

            <div class="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 flex items-center gap-2">
              <span>👉</span>
              <span>Ao salvar, o pedido entrará automaticamente na fila <strong>"Aguardando Dotação"</strong> para o <strong>Rafa (Financeiro)</strong> dar o Check.</span>
            </div>

            <div class="pt-2 flex gap-2">
              <button type="button" onclick="app.dotacoes.closeNewModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black rounded-xl shadow-md transition">Enviar para Dotação →</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 5. DOTAÇÕES: EDITAR / CORRIGIR PEDIDO (COMPRADOR)                  -->
      <!-- ================================================================= -->
      <div id="modal-editar-dotacao" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 fade-in">
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
                <label class="block font-bold text-slate-700 mb-1">Valor / Emenda</label>
                <input type="text" id="edit-dot-valor" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold outline-none focus:border-blue-500">
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
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-emerald-200 fade-in">
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
            <h3 class="text-base font-black text-slate-900">Novo Contrato no Mural Geral (LDO)</h3>
            <button onclick="app.contratos.closeNewModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <form onsubmit="app.contratos.saveNewContract(event)" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Empresa / Razão Social</label>
              <input type="text" id="panel-new-empresa" required placeholder="Ex: ECOPOÁ COMÉRCIO DE RESÍDUOS LTDA" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Nº do Contrato (CTT)</label>
                <input type="text" id="panel-new-ctt" required placeholder="Ex: 014/2022" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-mono font-bold">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Valor Anual (R$)</label>
                <input type="number" step="0.01" id="panel-new-valor" required placeholder="Ex: 48900.00" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Data Vencimento (ISO)</label>
                <input type="date" id="panel-new-venc-iso" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-semibold">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Fiscal Responsável</label>
                <select id="panel-new-fiscal" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold">
                  <option value="NAIARA">NAIARA</option>
                  <option value="SANDRO">SANDRO</option>
                  <option value="FRAN">FRAN</option>
                  <option value="LASIER">LASIER</option>
                  <option value="ADRI">ADRI</option>
                  <option value="PREFEITURA">PREFEITURA GERAL</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Prazo / Informação de Vencimento (Texto)</label>
              <input type="text" id="panel-new-prazo-txt" placeholder="Ex: 11/02/2027 (Renovável até 2027)" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Objeto do Contrato</label>
              <textarea id="panel-new-objeto" rows="2" placeholder="Ex: Coleta, transporte e incineração de resíduos de saúde..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"></textarea>
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
            <h3 class="text-base font-black text-slate-900">Editar Contrato no Mural (LDO)</h3>
            <button onclick="app.contratos.closeEditModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
          </div>
          <form onsubmit="app.contratos.confirmEdit(event)" class="space-y-3 text-xs">
            <input type="hidden" id="panel-edit-id">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Empresa / Razão Social</label>
              <input type="text" id="panel-edit-empresa" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-bold">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Nº do Contrato (CTT)</label>
                <input type="text" id="panel-edit-ctt" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-mono font-bold">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Valor Anual (R$)</label>
                <input type="number" step="0.01" id="panel-edit-valor" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-bold">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Data Vencimento (ISO)</label>
                <input type="date" id="panel-edit-venc-iso" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-semibold">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Fiscal Responsável</label>
                <select id="panel-edit-fiscal" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500 font-bold">
                  <option value="NAIARA">NAIARA</option>
                  <option value="SANDRO">SANDRO</option>
                  <option value="FRAN">FRAN</option>
                  <option value="LASIER">LASIER</option>
                  <option value="ADRI">ADRI</option>
                  <option value="PREFEITURA">PREFEITURA GERAL</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Prazo / Informação de Vencimento</label>
              <input type="text" id="panel-edit-prazo-txt" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Objeto do Contrato</label>
              <textarea id="panel-edit-objeto" rows="2" class="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:border-amber-500"></textarea>
            </div>
            <div class="pt-3 flex gap-2">
              <button type="button" onclick="app.contratos.closeEditModal()" class="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md">Atualizar Contrato</button>
            </div>
          </form>
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
            <p class="text-xs text-slate-500 mt-1">Ação restrita ao Administrador Geral</p>
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
                    <option value="Administrador">Administrador Geral</option>
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
                      <th class="p-3 text-center w-36">Comprador</th>
                      <th class="p-3 text-center w-36">Gestor Financeiro</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr class="bg-slate-50 font-bold text-slate-700"><td colspan="3" class="p-2.5">Auditoria de Exames</td></tr>
                    <tr><td class="p-3">Editar Saldos e Faturamento</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-audit_edit_values" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-audit_edit_values" class="w-4 h-4"></td></tr>
                    <tr><td class="p-3">Criar Novos Contratos de Exames</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-audit_create_contract" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-audit_create_contract" class="w-4 h-4"></td></tr>
                    <tr><td class="p-3">Gerenciar Procedimentos (Adicionar/Excluir)</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-audit_manage_procedures" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-audit_manage_procedures" class="w-4 h-4"></td></tr>

                    <tr class="bg-slate-50 font-bold text-slate-700"><td colspan="3" class="p-2.5">Livro Digital de Dotações</td></tr>
                    <tr><td class="p-3">Cadastrar Pedido de Dotação</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-dotacoes_create" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-dotacoes_create" class="w-4 h-4"></td></tr>
                    <tr><td class="p-3">Dar Baixa Contábil (Confirmar Empenho)</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-dotacoes_check" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-dotacoes_check" class="w-4 h-4"></td></tr>
                    <tr><td class="p-3">Editar Lançamento de Dotação</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-dotacoes_edit" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-dotacoes_edit" class="w-4 h-4"></td></tr>
                    <tr><td class="p-3">Excluir Pedido de Dotação</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-dotacoes_delete" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-dotacoes_delete" class="w-4 h-4"></td></tr>

                    <tr class="bg-slate-50 font-bold text-slate-700"><td colspan="3" class="p-2.5">Painel Geral de Contratos LDO</td></tr>
                    <tr><td class="p-3">Adicionar Novo Contrato no Mural</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-panel_create" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-panel_create" class="w-4 h-4"></td></tr>
                    <tr><td class="p-3">Editar Dados do Contrato no Mural</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-panel_edit" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-panel_edit" class="w-4 h-4"></td></tr>
                    <tr><td class="p-3">Arquivar / Desarquivar Contrato</td><td class="p-3 text-center"><input type="checkbox" id="perm-comprador-panel_archive" class="w-4 h-4"></td><td class="p-3 text-center"><input type="checkbox" id="perm-gestor-panel_archive" class="w-4 h-4"></td></tr>
                  </tbody>
                </table>
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
            <button onclick="app.audit.closeBalanceadorModal()" class="text-slate-400 hover:text-slate-600 font-bold p-1 text-lg">✕</button>
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
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button onclick="app.audit.closeBalanceadorModal()" class="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">
                Fechar
              </button>
              <button onclick="app.audit.exportarCSVBalanceamento()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5" title="Baixar planilha de simulação comparativa em Excel/CSV">
                <span>📥</span> Exportar Planilha (.CSV)
              </button>
              <button onclick="app.audit.abrirMemorandoTecnico()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5" title="Gerar e imprimir memorando oficial com fundamentação técnica para instrução de processo de compra">
                <span>📄</span> Emitir Memorando Técnico
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
    `;
  }
};

