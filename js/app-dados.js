/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DE DADOS & CONFIGURAÇÕES: Constantes, Matrizes e Bases Iniciais
 * Arquivo: js/app-dados.js
 * ============================================================================
 */

const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbzB_7aIOl2t5Pq3nVBHJ7TyPd2vJsXBJ5HZ0mkg7Xn2mzewLPZ0brFBJB_rp5NfPkjwrw/exec";

const CONFIG = {
  keys: {
    links: 'torres_links_v6',
    contractsList: 'torres_contracts_hub_v1',
    activeContractTab: 'torres_active_tab_v1',
    examsCache: 'torres_exams_cache_v1',
    dotacoesCache: 'torres_dotacoes_cache_v1',
    permissions: 'torres_permissions_matrix_v1',
    auditSession: 'torres_audit_logged_user'
  }
};

const INITIAL_LINKS = [
  { id: 2, title: 'ETP/TR', url: 'https://etp-tr.torres.rs.gov.br/', desc: 'Termos de Referência' },
  { id: 3, title: 'Betha Cloud', url: 'http://betha.cloud/', desc: 'Sistemas ERP' },
  { id: 4, title: '1Doc', url: 'http://torres.1doc.com.br/', desc: 'Processos Digitais' },
  { id: 5, title: 'Webmail', url: 'http://webmail.torres.rs.gov.br/', desc: 'E-mail Institucional' },
  { id: 1, title: 'Vacinas', url: 'https://vacinastorres.dpdns.org/', desc: 'Controle de Imunização' }
];

const DEFAULT_CONTRACTS = [
  {
    tabName: "Contrato_73_2026",
    num: "73/2026",
    empenhos: "3173/2026 (Global)",
    prestador: "LABORATORIO DE ANALISES CLINICAS FONTANA LTDA",
    createdAt: "25/09/2026 às 15:00"
  },
  {
    tabName: "Contrato_67_2026",
    num: "67/2026",
    empenhos: "3406/2026 e 3407/2026",
    prestador: "LABORATORIO BIOMEDICO LTDA - ME",
    createdAt: "12/09/2026 às 08:30"
  }
];

// BASE COMPLETA RECONCILIADA - CONTRATO Nº 73/2026 (75 ITENS + AJUSTE FISCAL)
const CONTRATO_73_EXAMS = [
  { id: 1, item: "1", cat: "Laboratorial", descEmpenho: "ÁCIDO FÓLICO (VITAMINA B9)", descPrestador: "0202010406 - ACIDO FOLICO", vlUnit: 15.65, qtdEmpenho: 150, saldoAnterior: 150, faturado: 20 },
  { id: 2, item: "2", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS ÁCIDO ÚRICO", descPrestador: "0202010120 - ACIDO URICO [SORO]", vlUnit: 1.85, qtdEmpenho: 400, saldoAnterior: 400, faturado: 144 },
  { id: 3, item: "3", cat: "Laboratorial", descEmpenho: "EXAME ÁCIDO VALPROICO", descPrestador: "0202070050 - ACIDO VALPROICO [SORO]", vlUnit: 15.65, qtdEmpenho: 150, saldoAnterior: 150, faturado: 1 },
  { id: 4, item: "4", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS DE ALBUMINA", descPrestador: "Não Consta na Fatura", vlUnit: 8.12, qtdEmpenho: 150, saldoAnterior: 150, faturado: 0 },
  { id: 5, item: "5", cat: "Laboratorial", descEmpenho: "EXAME AMILASE", descPrestador: "0202010180 - AMILASE [SORO]", vlUnit: 2.25, qtdEmpenho: 350, saldoAnterior: 350, faturado: 7 },
  { id: 6, item: "6", cat: "Laboratorial", descEmpenho: "ANALISE DE CARACTERES FISICOS, URINA (EQU)", descPrestador: "0202050017 - EQU EXAME QUALITATIVO DE URINA", vlUnit: 3.70, qtdEmpenho: 600, saldoAnterior: 600, faturado: 338 },
  { id: 7, item: "7", cat: "Laboratorial", descEmpenho: "ANTI HBC IgG", descPrestador: "Não Consta na Fatura", vlUnit: 18.55, qtdEmpenho: 100, saldoAnterior: 100, faturado: 0 },
  { id: 8, item: "8", cat: "Laboratorial", descEmpenho: "ANTI HBC IGM", descPrestador: "Não Consta na Fatura", vlUnit: 18.55, qtdEmpenho: 100, saldoAnterior: 100, faturado: 0 },
  { id: 9, item: "9", cat: "Laboratorial", descEmpenho: "EXAME ANTIHCV", descPrestador: "0202030679 - HEPATITE C, ANTICORPOS (ANTI-HCV)", vlUnit: 18.55, qtdEmpenho: 100, saldoAnterior: 100, faturado: 4 },
  { id: 10, item: "10", cat: "Laboratorial", descEmpenho: "ANTICORPOS ANTI TIREOGLOBULINA", descPrestador: "0202030628 - TIREOGLOBULINA ANTICORPOS ANTI", vlUnit: 13.35, qtdEmpenho: 200, saldoAnterior: 200, faturado: 3 },
  { id: 11, item: "11", cat: "Laboratorial", descEmpenho: "EXAME ANTIESTREPTOLISINA O", descPrestador: "0202030474 - ANTIESTREPTOLISINA O", vlUnit: 2.83, qtdEmpenho: 100, saldoAnterior: 100, faturado: 2 },
  { id: 12, item: "12", cat: "Laboratorial", descEmpenho: "B-HCG", descPrestador: "0202060217 - BETA HCG [IMUNOCROMATOGRAFICO]", vlUnit: 7.85, qtdEmpenho: 200, saldoAnterior: 200, faturado: 6 },
  { id: 13, item: "13", cat: "Laboratorial", descEmpenho: "BACTEROSCOPIA (GRAM)", descPrestador: "Não Consta na Fatura", vlUnit: 2.80, qtdEmpenho: 100, saldoAnterior: 100, faturado: 0 },
  { id: 14, item: "14", cat: "Laboratorial", descEmpenho: "BILIRRUBINAS T e F", descPrestador: "0202010201 - BILIRRUBINA TOTAL E FRACOES", vlUnit: 2.01, qtdEmpenho: 100, saldoAnterior: 100, faturado: 27 },
  { id: 15, item: "15", cat: "Laboratorial", descEmpenho: "EXAME CÁLCIO", descPrestador: "0202010210 - CALCIO [SORO]", vlUnit: 1.85, qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 18 },
  { id: 16, item: "16", cat: "Laboratorial", descEmpenho: "EXAME COLESTEROL HDL", descPrestador: "0202010279 - COLESTEROL HDL", vlUnit: 3.51, qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 421 },
  { id: 17, item: "17", cat: "Laboratorial", descEmpenho: "EXAME COLESTEROL LDL", descPrestador: "0202010287 - COLESTEROL LDL", vlUnit: 3.51, qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 357 },
  { id: 18, item: "18", cat: "Laboratorial", descEmpenho: "EXAME COLESTEROL TOTAL", descPrestador: "0202010295 - COLESTEROL TOTAL [SORO]", vlUnit: 1.85, qtdEmpenho: 600, saldoAnterior: 600, faturado: 422 },
  { id: 19, item: "19", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS CREATININA", descPrestador: "0202010317 - CREATININA [SORO]", vlUnit: 1.85, qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 414 },
  { id: 20, item: "20", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS CREATINURIA EM AMOSTRA", descPrestador: "Não Consta na Fatura", vlUnit: 1.85, qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 0 },
  { id: 21, item: "21", cat: "Laboratorial", descEmpenho: "EXAME CULTURA DE BACTERIAS PARA IDENTIFICAÇÃO", descPrestador: "0202080080 - CULTURA [URINA SIMPLES]", vlUnit: 5.62, qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 156 },
  { id: 22, item: "22", cat: "Laboratorial", descEmpenho: "CURVA GLICÊMICA (2 DOSAGENS)", descPrestador: "Não Consta na Fatura", vlUnit: 3.63, qtdEmpenho: 600, saldoAnterior: 600, faturado: 0 },
  { id: 23, item: "23", cat: "Laboratorial", descEmpenho: "Depuração da creatinina endógena", descPrestador: "0202050025 - CLEARANCE DE CREATININA", vlUnit: 3.51, qtdEmpenho: 200, saldoAnterior: 200, faturado: 3 },
  { id: 24, item: "24", cat: "Laboratorial", descEmpenho: "DESIDROGENASE LÁCTICA", descPrestador: "0202010368 - DESIDROGENASE LACTICA [SORO]", vlUnit: 3.68, qtdEmpenho: 200, saldoAnterior: 200, faturado: 4 },
  { id: 25, item: "25", cat: "Laboratorial", descEmpenho: "EXAME DOSAGEM DE PROTEÍNAS TOTAIS", descPrestador: "Não Consta na Fatura", vlUnit: 1.40, qtdEmpenho: 200, saldoAnterior: 200, faturado: 0 },
  { id: 26, item: "26", cat: "Laboratorial", descEmpenho: "EXAME DOSAGEM DE MICROALBUMINA NA URINA", descPrestador: "0202050092 - MICROALBUMINURIA", vlUnit: 8.12, qtdEmpenho: 200, saldoAnterior: 200, faturado: 184 },
  { id: 27, item: "27", cat: "Laboratorial", descEmpenho: "DOSAGEM CREATINOFOSFOQUINASE (CPK)", descPrestador: "0202010325 - CREATINOFOSFOQUINASE (CPK)", vlUnit: 3.68, qtdEmpenho: 200, saldoAnterior: 200, faturado: 4 },
  { id: 28, item: "28", cat: "Laboratorial", descEmpenho: "EPF - EXAME PARASITOLÓGICO DE FEZES", descPrestador: "0202040046 - PARASITOLOGICO DE FEZES", vlUnit: 1.65, qtdEmpenho: 600, saldoAnterior: 600, faturado: 57 },
  { id: 29, item: "29", cat: "Laboratorial", descEmpenho: "EXAME ESTRADIOL", descPrestador: "0202060160 - ESTRADIOL", vlUnit: 10.15, qtdEmpenho: 100, saldoAnterior: 100, faturado: 17 },
  { id: 30, item: "30", cat: "Laboratorial", descEmpenho: "FAN-FATOR ANTINUCLEAR", descPrestador: "0202030598 - FATOR ANTINUCLEAR [SORO]", vlUnit: 17.16, qtdEmpenho: 100, saldoAnterior: 100, faturado: 7 },
  { id: 31, item: "31", cat: "Laboratorial", descEmpenho: "FATOR REUMATOIDE (LÁTEX R)", descPrestador: "0202030075 - FATOR REUMATOIDE", vlUnit: 1.89, qtdEmpenho: 100, saldoAnterior: 100, faturado: 9 },
  { id: 32, item: "32", cat: "Laboratorial", descEmpenho: "FTA-ABS", descPrestador: "Não Consta na Fatura", vlUnit: 10.00, qtdEmpenho: 100, saldoAnterior: 100, faturado: 0 },
  { id: 33, item: "33", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS FERRITINA", descPrestador: "0202010384 - FERRITINA", vlUnit: 15.59, qtdEmpenho: 100, saldoAnterior: 100, faturado: 286 },
  { id: 34, item: "34", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS FERRO SÉRICO", descPrestador: "0202010392 - FERRO", vlUnit: 3.51, qtdEmpenho: 200, saldoAnterior: 200, faturado: 82 },
  { id: 35, item: "35", cat: "Laboratorial", descEmpenho: "FOSFATASE ALCALINA", descPrestador: "0202010422 - FOSFATASE ALCALINA", vlUnit: 2.01, qtdEmpenho: 200, saldoAnterior: 200, faturado: 27 },
  { id: 36, item: "36", cat: "Laboratorial", descEmpenho: "EXAME FÓSFORO", descPrestador: "0202010430 - FOSFORO [SORO]", vlUnit: 1.85, qtdEmpenho: 600, saldoAnterior: 600, faturado: 4 },
  { id: 37, item: "37", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS GAMA GT", descPrestador: "0202010465 - GAMA GLUTAMIL TRANSFERASE", vlUnit: 3.51, qtdEmpenho: 600, saldoAnterior: 600, faturado: 49 },
  { id: 38, item: "38", cat: "Laboratorial", descEmpenho: "EXAME DE GLICOSE", descPrestador: "0202010473 - GLICOSE [PLASMA/SORO]", vlUnit: 1.85, qtdEmpenho: 800, saldoAnterior: 800, faturado: 411 },
  { id: 39, item: "39", cat: "Laboratorial", descEmpenho: "HBSAG (ANTIGENO AUSTRÁLIA)", descPrestador: "0202030970 - HEPATITE B, ANTIGENO (HBSAG)", vlUnit: 18.55, qtdEmpenho: 150, saldoAnterior: 150, faturado: 4 },
  { id: 40, item: "40", cat: "Laboratorial", descEmpenho: "EXAME DE HEMOGLOBINA GLICOSILADA", descPrestador: "0202010503 - HEMOGLOBINA GLICADA (A1C)", vlUnit: 7.86, qtdEmpenho: 500, saldoAnterior: 500, faturado: 396 },
  { id: 41, item: "41", cat: "Laboratorial", descEmpenho: "EXAME HEMOGRAMA COMPLETO", descPrestador: "0202020380 - HEMOGRAMA COMPLETO", vlUnit: 4.11, qtdEmpenho: 2000, saldoAnterior: 2000, faturado: 474 },
  { id: 42, item: "42", cat: "Laboratorial", descEmpenho: "HORMÔNIO FOLÍCULO ESTIMULANTE (FSH)", descPrestador: "0202060233 - FSH HORMONIO FOLICULO ESTIMULANTE", vlUnit: 7.89, qtdEmpenho: 100, saldoAnterior: 100, faturado: 26 },
  { id: 43, item: "43", cat: "Laboratorial", descEmpenho: "HORMÔNIO LUTEINIZANTE (LH)", descPrestador: "0202060241 - LH HORMONIO LUTEINIZANTE", vlUnit: 8.97, qtdEmpenho: 100, saldoAnterior: 100, faturado: 17 },
  { id: 44, item: "44", cat: "Laboratorial", descEmpenho: "IST (INDICE SAT. TRANSFERRINA)", descPrestador: "0202010660 - CALCULO INDICE SATURACAO TRANSFERRINA", vlUnit: 4.19, qtdEmpenho: 100, saldoAnterior: 100, faturado: 4 },
  { id: 45, item: "45", cat: "Laboratorial", descEmpenho: "KTTP (TEMPO DE TROMBOPLATIA PARCIAL ATIVADA)", descPrestador: "0202020134 - TEMPO DE TROMBOPLASTINA PARCIAL (TTP)", vlUnit: 5.77, qtdEmpenho: 100, saldoAnterior: 100, faturado: 5 },
  { id: 46, item: "46", cat: "Laboratorial", descEmpenho: "LIPASE", descPrestador: "0202010554 - LIPASE [SORO]", vlUnit: 2.25, qtdEmpenho: 200, saldoAnterior: 200, faturado: 6 },
  { id: 47, item: "47", cat: "Laboratorial", descEmpenho: "LITEMIA", descPrestador: "0202070255 - LITIO", vlUnit: 8.12, qtdEmpenho: 100, saldoAnterior: 100, faturado: 8 },
  { id: 48, item: "48", cat: "Laboratorial", descEmpenho: "EXAME MAGNÉSIO", descPrestador: "0202010562 - MAGNESIO [SORO]", vlUnit: 2.01, qtdEmpenho: 600, saldoAnterior: 600, faturado: 9 },
  { id: 49, item: "49", cat: "Laboratorial", descEmpenho: "PCR - PROTEINA REATIVA", descPrestador: "0202030083 - PROTEINA C REATIVA ULTRA SENSIVEL", vlUnit: 2.83, qtdEmpenho: 100, saldoAnterior: 100, faturado: 42 },
  { id: 50, item: "50", cat: "Laboratorial", descEmpenho: "ANTICORPOS ANTICROMOSSOMOS (ANTI-TPO)", descPrestador: "0202030555 - ANTICORPOS ANTI TIREOPEROXIDASE", vlUnit: 17.16, qtdEmpenho: 100, saldoAnterior: 100, faturado: 2 },
  { id: 51, item: "51", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS PLAQUETAS", descPrestador: "0202020380 - CONTAGEM DE PLAQUETAS", vlUnit: 2.73, qtdEmpenho: 1500, saldoAnterior: 1500, faturado: 68 },
  { id: 52, item: "52", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS POTÁSSIO", descPrestador: "0202010600 - POTASSIO [SORO]", vlUnit: 1.85, qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 84 },
  { id: 53, item: "53", cat: "Laboratorial", descEmpenho: "EXAME LABORATORIAL PROGESTERONA", descPrestador: "0202060292 - PROGESTERONA", vlUnit: 10.22, qtdEmpenho: 150, saldoAnterior: 150, faturado: 7 },
  { id: 54, item: "54", cat: "Laboratorial", descEmpenho: "PROLACTINA", descPrestador: "0202060306 - PROLACTINA", vlUnit: 10.15, qtdEmpenho: 150, saldoAnterior: 150, faturado: 5 },
  { id: 55, item: "55", cat: "Laboratorial", descEmpenho: "EXAME DE PSA LIVRE", descPrestador: "Não definido - PSAL ANTIGENO PROSTATICO LIVRE", vlUnit: 16.42, qtdEmpenho: 600, saldoAnterior: 600, faturado: 2 },
  { id: 56, item: "56", cat: "Laboratorial", descEmpenho: "EXAME PSA TOTAL", descPrestador: "0202030105 - PSA ANTIGENO PROSTATICO ESPECIFICO", vlUnit: 16.42, qtdEmpenho: 600, saldoAnterior: 600, faturado: 79 },
  { id: 57, item: "57", cat: "Laboratorial", descEmpenho: "RETICULÓCITOS", descPrestador: "0202020037 - RETICULOCITOS CONTAGEM", vlUnit: 2.73, qtdEmpenho: 200, saldoAnterior: 200, faturado: 8 },
  { id: 58, item: "58", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS SÓDIO", descPrestador: "0202010635 - SODIO [SORO]", vlUnit: 1.85, qtdEmpenho: 600, saldoAnterior: 600, faturado: 80 },
  { id: 59, item: "59", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS T4 - TIROXINA", descPrestador: "0202060373 - T4 TIROXINA", vlUnit: 8.76, qtdEmpenho: 100, saldoAnterior: 100, faturado: 8 },
  { id: 60, item: "60", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS T4 LIVRE (TIROXINA)", descPrestador: "0202060381 - T4 L TIROXINA LIVRE", vlUnit: 11.60, qtdEmpenho: 100, saldoAnterior: 100, faturado: 187 },
  { id: 61, item: "61", cat: "Laboratorial", descEmpenho: "TEMPO DE TROMBOPLASTINA ATIVADO", descPrestador: "0202020134 - TEMPO DE TROMBOPLASTINA (TTPA)", vlUnit: 5.77, qtdEmpenho: 100, saldoAnterior: 100, faturado: 3 },
  { id: 62, item: "62", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS TESTOSTERONA TOTAL", descPrestador: "0202060349 - TESTOSTERONA TOTAL", vlUnit: 10.43, qtdEmpenho: 100, saldoAnterior: 100, faturado: 8 },
  { id: 63, item: "63", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS TGO", descPrestador: "0202010643 - ASPARTATO AMINO TRANSFERASE (TGO)", vlUnit: 2.01, qtdEmpenho: 150, saldoAnterior: 150, faturado: 252 },
  { id: 64, item: "64", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS TGP", descPrestador: "0202010651 - ALANINA AMINO TRANSFERASE (TGP)", vlUnit: 2.01, qtdEmpenho: 150, saldoAnterior: 150, faturado: 248 },
  { id: 65, item: "65", cat: "Laboratorial", descEmpenho: "TIBC (CAPACIDADE DE FIXAÇÃO DO FERRO)", descPrestador: "0202010023 - CAPACIDADE TOTAL LIGACAO DO FERRO", vlUnit: 2.01, qtdEmpenho: 200, saldoAnterior: 200, faturado: 5 },
  { id: 66, item: "66", cat: "Laboratorial", descEmpenho: "TIPAGEM SANGUINEA E FATOR RH", descPrestador: "0202120082 - FATOR RH / GRUPO SANGUINEO", vlUnit: 1.37, qtdEmpenho: 300, saldoAnterior: 300, faturado: 8 },
  { id: 67, item: "67", cat: "Laboratorial", descEmpenho: "TAP (TEMPO DE ATIVIDADE DE PROTOMBINA)", descPrestador: "0202020142 - TEMPO DE PROTROMBINA (TP)", vlUnit: 2.73, qtdEmpenho: 200, saldoAnterior: 200, faturado: 11 },
  { id: 68, item: "68", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS TRIGLICERÍDEOS", descPrestador: "0202010678 - TRIGLICERIDEOS [SORO]", vlUnit: 3.51, qtdEmpenho: 800, saldoAnterior: 800, faturado: 420 },
  { id: 69, item: "69", cat: "Laboratorial", descEmpenho: "EXAMES TSH - TIREOTROFINA", descPrestador: "0202060250 - TSH HORMONIO TIREOESTIMULANTE", vlUnit: 8.96, qtdEmpenho: 150, saldoAnterior: 150, faturado: 308 },
  { id: 70, item: "70", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS UREIA", descPrestador: "0202010694 - UREIA [SORO]", vlUnit: 1.85, qtdEmpenho: 500, saldoAnterior: 500, faturado: 254 },
  { id: 71, item: "71", cat: "Laboratorial", descEmpenho: "VDRL PARA DETECÇÃO DE SÍFILIS", descPrestador: "0202031098 - VDRL [SORO]", vlUnit: 2.83, qtdEmpenho: 500, saldoAnterior: 500, faturado: 8 },
  { id: 72, item: "72", cat: "Laboratorial", descEmpenho: "EXAMES LABORATORIAIS VITAMINA B12", descPrestador: "0202010708 - VITAMINA B12", vlUnit: 15.24, qtdEmpenho: 50, saldoAnterior: 50, faturado: 291 },
  { id: 73, item: "73", cat: "Laboratorial", descEmpenho: "EXAME LABORATORIAL VITAMINA D", descPrestador: "0202010767 - VITAMINA D (25 HIDROXI)", vlUnit: 15.24, qtdEmpenho: 50, saldoAnterior: 50, faturado: 283 },
  { id: 74, item: "74", cat: "Laboratorial", descEmpenho: "EXAME VSG/VHS (HEMOSEDIMENTAÇÃO)", descPrestador: "0202020150 - VELOCIDADE HEMOSSEDIMENTACAO", vlUnit: 2.73, qtdEmpenho: 50, saldoAnterior: 50, faturado: 20 },
  { id: 75, item: "75", cat: "Laboratorial", descEmpenho: "Pesquisa de anticorpos EIE anticlamidia", descPrestador: "Não Consta na Fatura", vlUnit: 17.76, qtdEmpenho: 50, saldoAnterior: 50, faturado: 0 },
  { id: 76, item: "NF", cat: "Laboratorial", descEmpenho: "AJUSTE FISCAL / ITENS EXTRAS DAS NFS-E", descPrestador: "Conciliação Faturas NFS-e 3205 a 3264", vlUnit: 4291.20, qtdEmpenho: 1, saldoAnterior: 1, faturado: 1 }
];

const TEMPLATE_EXAMS = CONTRATO_73_EXAMS;

const INITIAL_DOTACOES = [
  {
    id: 1,
    processo: "19011",
    origem: "Farmácia Municipal",
    objeto: "Medicamentos de Atenção Básica e Insulinas",
    quantidade: 12000,
    solicitante: "Dra. Juliana / Farmácia",
    comprador: "Carlos Silva",
    compradorLogin: "carlos.compras",
    dataSolicitacao: "13/09/2026 às 10:15",
    status: "PENDENTE",
    empenhoDoc: "",
    validador: "",
    validadorLogin: "",
    dataValidacao: ""
  },
  {
    id: 2,
    processo: "18982",
    origem: "Posto Central",
    objeto: "Luvas cirúrgicas estéreis e máscaras N95",
    quantidade: 5000,
    solicitante: "Enf. Roberto / Posto Central",
    comprador: "Mariana Costa",
    compradorLogin: "mariana.compras",
    dataSolicitacao: "13/09/2026 às 09:30",
    status: "REGISTRADO",
    empenhoDoc: "3890/2026",
    validador: "Gestor Financeiro",
    validadorLogin: "gestor.financeiro",
    dataValidacao: "13/09/2026 às 11:20"
  }
];

const DEFAULT_PERMISSIONS = {
  'Comprador': {
    'audit_edit_values': false,
    'audit_create_contract': false,
    'audit_manage_procedures': false,
    'dotacoes_create': true,
    'dotacoes_check': false,
    'dotacoes_edit': false,
    'dotacoes_delete': false,
    'panel_create': false,
    'panel_edit': false,
    'panel_archive': false
  },
  'Gestor Financeiro': {
    'audit_edit_values': true,
    'audit_create_contract': false,
    'audit_manage_procedures': false,
    'dotacoes_create': true,
    'dotacoes_check': true,
    'dotacoes_edit': true,
    'dotacoes_delete': false,
    'panel_create': true,
    'panel_edit': true,
    'panel_archive': true
  }
};
