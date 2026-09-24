/* V10.1 — estabilização estrutural sem alterar os cálculos dos testes */
(() => {
  'use strict';

  function removeDuplicateIds(){
    const seen = new Set();
    document.querySelectorAll('[id]').forEach(el => {
      if (!seen.has(el.id)) {
        seen.add(el.id);
        return;
      }
      // Remove somente duplicatas conhecidas da interface acrescida por patches.
      if (/^(v10|reliability|rp)/i.test(el.id)) el.remove();
    });
  }

  function syncModalState(){
    const open = !!document.querySelector('.v10modal.open,.rp-modal.open');
    document.body.classList.toggle('modal-open', open);
  }

  function improveDialogs(){
    document.querySelectorAll('.v10modal,.rp-modal').forEach(modal => {
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          modal.classList.remove('open');
          syncModalState();
        }
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const modal = [...document.querySelectorAll('.v10modal.open,.rp-modal.open')].pop();
      if (modal) {
        modal.classList.remove('open');
        syncModalState();
      }
    });
  }

  function watchModalState(){
    const observer = new MutationObserver(syncModalState);
    document.querySelectorAll('.v10modal,.rp-modal').forEach(modal => {
      observer.observe(modal,{attributes:true,attributeFilter:['class']});
    });
  }

  function normalizeExternalLinks(){
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
      const rel = new Set((a.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener'); rel.add('noreferrer');
      a.setAttribute('rel',[...rel].join(' '));
    });
  }

  function init(){
    removeDuplicateIds();
    improveDialogs();
    watchModalState();
    normalizeExternalLinks();
    syncModalState();
    document.documentElement.dataset.uiStabilized = '10.1';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
