// assets/js/qso_templates.js
(function(){
  const STORAGE_KEY = 'wavelog_templates_v1';
  const selId = 'frequency_template';
  const applyBtnId = 'apply_template';
  const saveBtnId = 'save_template_btn';

  function $(id){ return document.getElementById(id); }

  function loadTemplates(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function saveTemplates(obj){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    refreshUI();
  }

  function refreshUI(){
    const sel = $(selId);
    if(!sel) return;
    const templates = loadTemplates();
    sel.innerHTML = '<option value="">Vorlage wählen...</option>';
    Object.keys(templates).sort().forEach(k=>{
      const opt = document.createElement('option');
      opt.value = k; opt.textContent = templates[k].name;
      sel.appendChild(opt);
    });
  }

  function setValueIfPresent(selOrName, value){
    if(!value && value !== 0) return;
    const elById = document.getElementById(selOrName);
    if(elById) { elById.value = value; elById.dispatchEvent(new Event('input')); return; }
    const elByName = document.querySelector(`[name="${selOrName}"]`);
    if(elByName) { elByName.value = value; elByName.dispatchEvent(new Event('input')); return; }
  }

  window.applyTemplate = function(key){
    const templates = loadTemplates();
    const t = templates[key];
    if(!t) return alert('Vorlage nicht gefunden');
    // TX -> freq_calculated & hidden frequency
    if(t.tx){
      if($('freq_calculated')) $('freq_calculated').value = t.tx;
      if($('frequency')) $('frequency').value = t.tx;
    }
    // RX
    if(t.rx){
      if($('frequency_rx')) $('frequency_rx').value = t.rx;
      if($('freq_rx')) $('freq_rx').value = t.rx;
    }
    // mode/band/rst/comment
    setValueIfPresent('mode', t.mode);
    setValueIfPresent('band', t.band);
    setValueIfPresent('rst_sent', t.rst_sent || '59');
    setValueIfPresent('rst_rcvd', t.rst_rcvd || '59');
    setValueIfPresent('comment', t.comment || '');
  };

  document.addEventListener('DOMContentLoaded', function(){
    const sel = $(selId);
    if(sel) refreshUI();

    const applyBtn = $(applyBtnId);
    if(applyBtn){
      applyBtn.addEventListener('click', function(){
        const key = sel ? sel.value : '';
        if(!key) return alert('Bitte zuerst eine Vorlage wählen.');
        applyTemplate(key);
      });
    }

    const saveBtn = $(saveBtnId);
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        const name = ($('template_name') && $('template_name').value.trim()) || '';
        if(!name) return alert('Bitte Namen eingeben.');
        const tx = $('template_tx') ? $('template_tx').value.trim() : '';
        const rx = $('template_rx') ? $('template_rx').value.trim() : '';
        const mode = $('template_mode') ? $('template_mode').value.trim() : '';
        const band = $('template_band') ? $('template_band').value.trim() : '';
        const comment = $('template_comment') ? $('template_comment').value.trim() : '';
        const key = name.toLowerCase().replace(/[^a-z0-9]+/g,'_');
        const tmp = loadTemplates();
        tmp[key] = { name, tx, rx, mode, band, comment, rst_sent:'59', rst_rcvd:'59' };
        saveTemplates(tmp);
        // close modal (Bootstrap 5)
        try{
          const modalEl = document.getElementById('newTemplateModal');
          const bs = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          bs.hide();
        }catch(e){}
        if($('template_name')) $('template_name').value='';
        if($('template_tx')) $('template_tx').value='';
        if($('template_rx')) $('template_rx').value='';
        if($('template_comment')) $('template_comment').value='';
      });
    }

    // seed defaults if empty
    (function seed(){
      const templates = loadTemplates();
      if(Object.keys(templates).length === 0){
        templates['repeater_home'] = { name:'Repeater Home', tx:'439.575', rx:'430.975', mode:'FM', band:'70cm', comment:'Repeater' };
        templates['simplex_local'] = { name:'Simplex Local', tx:'145.500', rx:'', mode:'FM', band:'2m', comment:'Simplex' };
        saveTemplates(templates);
      } else refreshUI();
    })();
  });

})();