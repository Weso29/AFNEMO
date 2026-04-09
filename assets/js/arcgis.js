/* ============================================
   AFNEMO - arcgis.js
   ArcGIS embedded map initialization.
   The ArcGIS embeddable components are loaded
   via the ES module script tag in <head>.
   This file handles any additional map event
   handlers or configuration if needed.
   ============================================ */

(function () {
  'use strict';

  // The ArcGIS embedded map is a Web Component (<arcgis-embedded-map>).
  // It self-initializes once the ES module script is loaded.
  // No additional JS initialization is required for basic usage.
  // Add custom event listeners or configuration here if needed in the future.

  document.addEventListener('DOMContentLoaded', function () {
    var mapEl = document.querySelector('arcgis-embedded-map');
    if (!mapEl) return;

    // Example: listen for the map ready event (ArcGIS embeddable components API)
    mapEl.addEventListener('arcgisViewReadyChange', function (event) {
      // Map is ready - add custom interactions here if needed
      console.log('ArcGIS map ready:', event);
    });
  });

})();
