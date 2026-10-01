/* Correção de integridade normativa — 30/09/2026
 * Não altera respostas, itens, escores brutos, T, classificações ou pontos de corte.
 * NEO PI-R / NEO FFI-R: a base atual contém pct=0 como valor sentinela em registros
 * nos quais há escore T/classificação. Percentil 0 não pode ser tratado como percentil
 * normativo real para decidir DENTRO/FORA. Quando isso ocorrer, o percentil passa a
 * ser considerado indisponível, evitando falso APTO/INAPTO.
 */
(function(){
  'use strict';
  if (typeof window.normGet !== 'function') return;
  const originalNormGet = window.normGet;
  window.normGet = function(testid,varid,tableid,raw){
    const n = originalNormGet(testid,varid,tableid,raw) || {};
    if ((Number(testid) === 1 || Number(testid) === 2) && Number(n.pct) === 0) {
      return Object.assign({}, n, {pct: undefined});
    }
    return n;
  };
})();
