/* ============================================
   AFNEMO - nav.js
   Navbar scroll behavior and mobile menu toggle
   ============================================ */

(function () {
  'use strict';

  // ─── Navbar scroll behavior ───
  window.addEventListener('scroll', function () {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // ─── Mobile menu toggle ───
  // Inject hamburger button and mobile menu overlay into the nav
  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.getElementById('mainNav');
    if (!nav) return;

    // Create hamburger button
    var hamburger = document.createElement('button');
    hamburger.className = 'nav-hamburger';
    hamburger.setAttribute('aria-label', 'Abrir menú');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(hamburger);

    // Create mobile menu overlay
    var mobileMenu = document.createElement('div');
    mobileMenu.className = 'nav-mobile-menu';
    mobileMenu.innerHTML = [
      '<a href="#about" >Nosotros</a>',
      '<a href="#programs">Programas</a>',
      '<a href="#mapa-institucional">Mapa ArcGIS</a>',
      '<a href="#news">Noticias</a>',
      '<a href="#team">Equipo</a>',
      '<a href="#contact">Contacto</a>',
      '<a href="#donate" class="nav-cta">Donar</a>'
    ].join('');
    document.body.appendChild(mobileMenu);

    // Toggle handler
    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('open');
      hamburger.classList.toggle('open', !isOpen);
      mobileMenu.classList.toggle('open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  });

  // ─── Dev notes toggle ───
  window.toggleNotes = function () {
    var notes = document.getElementById('uiNotes');
    if (notes) notes.classList.toggle('hidden');
  };

})();
