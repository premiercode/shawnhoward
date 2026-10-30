/* =====================================================================
   Demo reel modal
   Links marked [data-reel] open the Vimeo player in a <dialog>.
   Without JS (or without <dialog>) the link simply goes to Vimeo.
   ===================================================================== */
(() => {
  'use strict';

  const triggers = document.querySelectorAll('[data-reel]');
  if (!triggers.length || typeof HTMLDialogElement !== 'function') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'reel-modal';
  dialog.setAttribute('aria-label', 'Shawn Howard demo reel');
  dialog.innerHTML = `
    <div class="reel-modal__frame"></div>
    <button class="reel-modal__close" type="button">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>
      <span>Close</span>
    </button>`;
  document.body.append(dialog);

  const frame = dialog.querySelector('.reel-modal__frame');
  let opener = null;

  const open = (link) => {
    const id = link.dataset.reel;
    opener = link;
    frame.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&dnt=1&title=0&byline=0&portrait=0"
      title="Shawn Howard demo reel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    dialog.showModal();
  };

  triggers.forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (e) => { e.preventDefault(); open(link); });
  });

  dialog.querySelector('.reel-modal__close').addEventListener('click', () => dialog.close());
  // Click on the backdrop (outside the frame) closes
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    frame.innerHTML = ''; // stops playback
    if (opener) opener.focus();
  });
})();
