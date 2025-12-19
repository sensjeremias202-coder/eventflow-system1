// Redireciona para a página correta ao clicar no card
// (mantém target _blank, mas pode customizar se quiser abrir URLs externas)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.app-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const page = card.getAttribute('data-page');
      if (page) {
        // Supondo que o page-loader.js carrega páginas por hash ou query
        // Aqui, abrimos a mesma URL mas com ?page=... em nova guia
        const url = window.location.origin + window.location.pathname + '?page=' + page;
        window.open(url, '_blank');
      }
    });
  });
});
