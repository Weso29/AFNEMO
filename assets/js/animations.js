/* ============================================
   AFNEMO - animations.js
   IntersectionObserver scroll animations,
   counter animations, chatbot widget
   ============================================ */

(function () {
  'use strict';

  // ─── Scroll-triggered fadeUp animations ───
  // BUG FIX: original code set opacity/transform directly before observing,
  // which could flash unstyled content. We use CSS classes instead to keep
  // animation state in the stylesheet and avoid FOUC.
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeUp 0.6s ease forwards';
        // Stop observing once animated to avoid re-triggering
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.stat-item, .program-card, .news-card, .team-card').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      observer.observe(el);
    });

    // ─── Chatbot widget ───
    initChatbot();
  });

  // ─── Chatbot ───
  // ⚠️ CAMBIA ESTA URL por la de tu Worker de Cloudflare
  var WORKER_URL = 'https://summer-wildflower-8156.santiagopazbedoya.workers.dev';

  var SYSTEM_PROMPT = 'Eres Neftalí, el asistente virtual especializado de AFNEMO (Asociación Afrocultural Neftalí Mosquera).\n\n' +
    'IDIOMA: Responde SIEMPRE en español, sin excepción, sin importar en qué idioma te escriban.\n\n' +
    'TU ESPECIALIDAD: Eres experto en el marco jurídico y normativo afrocolombiano. Conoces a profundidad:\n' +
    '- Ley 70 de 1993 (derechos de comunidades negras, territorios colectivos, identidad cultural)\n' +
    '- Decreto 1745 de 1995 (titulación colectiva de tierras)\n' +
    '- Decreto 804 de 1995 (etnoeducación afrocolombiana)\n' +
    '- Artículos 7, 13, 55 transitorio de la Constitución Política de Colombia\n' +
    '- Convenio 169 de la OIT (pueblos indígenas y tribales)\n' +
    '- Política pública para comunidades negras, afrocolombianas, raizales y palenqueras\n' +
    '- Decreto 1066 de 2015 (sector interior, comunidades étnicas)\n' +
    '- Ley 1482 de 2011 (antidiscriminación)\n' +
    '- Autos y sentencias de la Corte Constitucional sobre derechos afro\n' +
    '- Programas y misión de AFNEMO\n\n' +
    'COMPORTAMIENTO:\n' +
    '- Responde SIEMPRE en español sin importar el idioma del usuario\n' +
    '- Si te preguntan algo fuera de tu especialidad, di: "Ese tema está fuera de mi especialidad. Soy Neftalí, asistente especializado en derechos y normativa afrocolombiana. ¿Te puedo ayudar con alguna ley, decreto o programa de AFNEMO?"\n' +
    '- Si recibes texto sin sentido o sin pregunta clara, pide amablemente que reformulen su consulta\n' +
    '- Respuestas claras y precisas, máximo 4 oraciones salvo que pidan más detalle\n' +
    '- Cita siempre el artículo o decreto específico cuando sea relevante\n' +
    '- FORMATO: Nunca uses markdown (sin #, sin **, sin ---, sin tablas con |). Escribe en texto plano con saltos de línea simples. Usa emojis para organizar si es necesario y bullets point.';

  var chatHistory = [];
  var chatOpen = false;
  var welcomeShown = false;

  function initChatbot() {
    var bubble = document.getElementById('chat-bubble');
    var closeBtn = document.getElementById('chat-close');
    var sendBtn = document.getElementById('chat-send');
    var chatInput = document.getElementById('chat-input');

    if (bubble) {
      bubble.addEventListener('click', toggleChat);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', toggleChat);
    }
    if (sendBtn) {
      sendBtn.addEventListener('click', sendMessage);
    }
    if (chatInput) {
      chatInput.addEventListener('keydown', handleKey);
    }
  }

  // Expose globally so inline onclick fallbacks still work during transition
  window.toggleChat = function () {
    chatOpen = !chatOpen;
    var win = document.getElementById('chat-window');
    if (!win) return;
    win.classList.toggle('open', chatOpen);
    if (chatOpen && !welcomeShown) {
      welcomeShown = true;
      appendMessage('bot', '¡Hola! Soy Neftalí, el asistente virtual de AFNEMO 🌍 ¿En qué te puedo ayudar hoy? Puedo contarte sobre nuestros programas, cómo donar, el directorio de emprendimientos y mucho más.');
    }
    if (chatOpen) {
      setTimeout(function () {
        var input = document.getElementById('chat-input');
        if (input) input.focus();
      }, 100);
    }
  };

  function appendMessage(role, text) {
    var msgs = document.getElementById('chat-messages');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.innerHTML =
      '<div class="chat-msg-avatar">' + (role === 'bot' ? '🌍' : '👤') + '</div>' +
      '<div class="chat-msg-bubble">' + text + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    var msgs = document.getElementById('chat-messages');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'typing-indicator';
    div.innerHTML =
      '<div class="chat-msg-avatar">🌍</div>' +
      '<div class="chat-msg-bubble">' +
      '<div class="chat-typing"><span></span><span></span><span></span></div>' +
      '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    var t = document.getElementById('typing-indicator');
    if (t) t.remove();
  }

  window.sendMessage = async function () {
    var input = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    if (sendBtn) sendBtn.disabled = true;
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });

    showTyping();

    try {
      var res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-10),
          system: SYSTEM_PROMPT
        })
      });

      var data = await res.json();
      removeTyping();

      if (data.reply) {
        appendMessage('bot', data.reply);
        chatHistory.push({ role: 'assistant', content: data.reply });
      } else {
        appendMessage('bot', 'Lo siento, hubo un problema al procesar tu mensaje. Por favor intenta de nuevo.');
      }
    } catch (err) {
      removeTyping();
      appendMessage('bot', 'Lo siento, no pude conectarme en este momento. Por favor intenta más tarde.');
    }

    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  };

  window.handleKey = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sendMessage();
    }
  };

})();
