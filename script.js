/* Secret Garden — interactions and our song player */

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

function startSecretGarden() {
  (() => {
    'use strict';

    const intro = document.getElementById('intro');
    const gift = document.getElementById('openGift');
    const player = document.getElementById('musicToggle');
    const musicPanel = document.getElementById('musicPanel');
    const musicVideo = document.getElementById('musicVideo');
    const musicLoading = document.getElementById('musicLoading');
    const musicHint = musicPanel.querySelector('.music-hint');
    const main = document.getElementById('main');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const deepLink = window.location.hash.length > 1;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!deepLink) window.scrollTo(0, 0);

    /* ── our song, straight from the official music video ── */

    const track = {
      title: 'Ikaw at Ako',
      artist: 'Johnoy Danao',
      videoId: 'l5ta60yfryc',
      url: 'https://music.youtube.com/watch?v=l5ta60yfryc&si=bsgqOrME0HSSoDwj'
    };

    const canEmbedYouTube = window.location.protocol === 'http:' || window.location.protocol === 'https:';

    let playerOpen = false;
    let songStarted = false;
    let songFrame = null;
    let opened = false;

    function mountSongPlayer() {
      /* YouTube refuses embeds on opaque origins such as file://, so show a
         direct link to the song there instead of a broken player. */
      if (!canEmbedYouTube) {
        musicVideo.classList.add('is-fallback');
        musicLoading.classList.add('is-hidden');
        return false;
      }

      if (songFrame) return true;

      const params = new URLSearchParams({
        autoplay: '1',
        playsinline: '1',
        rel: '0',
        start: '0'
      });

      songFrame = document.createElement('iframe');
      songFrame.src = `https://www.youtube.com/embed/${track.videoId}?${params.toString()}`;
      songFrame.title = `${track.title} by ${track.artist} — official music video`;
      songFrame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      songFrame.setAttribute('allowfullscreen', '');
      songFrame.setAttribute('frameborder', '0');

      const loadTimeout = window.setTimeout(() => {
        musicLoading.classList.add('is-hidden');
        musicHint.textContent = 'our song · open it in YouTube Music';
      }, 10000);

      songFrame.addEventListener('load', () => {
        window.clearTimeout(loadTimeout);
        musicLoading.classList.add('is-hidden');
      });

      musicVideo.appendChild(songFrame);
      return true;
    }

    function beginSong() {
      if (songStarted) return;
      songStarted = true;

      /* The iframe is created inside the gift's click so the browser treats
         playback as user-initiated and starts it from 0:00. */
      const playingInline = mountSongPlayer();

      musicHint.textContent = playingInline
        ? 'our song · Ikaw at Ako'
        : 'our song · open in YouTube Music';

      /* when the page is opened as a file there is no inline music, so show
         the visitor where to hear it */
      if (!playingInline) window.setTimeout(() => setPlayerOpen(true), 650);
    }

    function setPlayerOpen(open, { returnFocus = false } = {}) {
      playerOpen = open;
      player.setAttribute('aria-expanded', String(open));
      player.setAttribute('aria-label', open
        ? 'Close our song player'
        : `Open our song, ${track.title} by ${track.artist}`);

      if (open) {
        musicPanel.inert = false;
        musicPanel.removeAttribute('aria-hidden');
        window.requestAnimationFrame(() => {
          if (playerOpen) musicPanel.classList.add('is-open');
        });
      } else {
        musicPanel.classList.remove('is-open');
        musicPanel.inert = true;
        musicPanel.setAttribute('aria-hidden', 'true');
      }

      if (returnFocus) player.focus({ preventScroll: true });
    }

    player.addEventListener('click', () => {
      if (playerOpen) {
        setPlayerOpen(false);
        return;
      }

      if (!songStarted) {
        beginSong();
        return;
      }

      setPlayerOpen(true);
    });

    document.addEventListener('click', (event) => {
      if (playerOpen && !event.target.closest('.player-wrap')) setPlayerOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && playerOpen) setPlayerOpen(false, { returnFocus: true });
    });

    /* ── opening the gift ── */

    function burst() {
      if (reduceMotion) return;

      const layer = document.createElement('div');
      layer.className = 'burst-layer';
      document.body.appendChild(layer);

      const rect = gift.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const pieces = ['💗', '🌸', '✨', '🌹', '🤍', '💫'];

      for (let i = 0; i < 20; i++) {
        const piece = document.createElement('span');
        piece.className = 'burst-piece';
        piece.textContent = pieces[i % pieces.length];
        piece.style.left = originX + 'px';
        piece.style.top = originY + 'px';
        piece.style.fontSize = (11 + Math.random() * 15) + 'px';

        const angle = (Math.PI * 2 * i) / 20 + Math.random() * .45;
        const distance = 110 + Math.random() * 250;
        piece.style.setProperty('--x', Math.cos(angle) * distance + 'px');
        piece.style.setProperty('--y', (Math.sin(angle) * distance - 70) + 'px');
        piece.style.setProperty('--r', (Math.random() * 200 - 100) + 'deg');
        piece.style.animationDelay = (Math.random() * .16) + 's';

        layer.appendChild(piece);
      }

      window.setTimeout(() => layer.remove(), 2300);
    }

    function openSite() {
      if (opened) return;
      opened = true;

      intro.classList.add('opening');
      beginSong();

      window.setTimeout(burst, 320);

      window.setTimeout(() => {
        intro.classList.add('leaving');
        document.body.classList.add('site-ready');
      }, 650);

      window.setTimeout(() => {
        intro.classList.add('gone');
        intro.setAttribute('aria-hidden', 'true');
        intro.inert = true;
        main.focus({ preventScroll: true });
      }, 1700);
    }

    gift.addEventListener('click', (event) => {
      event.stopPropagation();
      openSite();
    });

    intro.addEventListener('click', openSite);

    document.addEventListener('keydown', (event) => {
      if (!opened && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openSite();
      }
    });

    /* ── roses ── */

    const roses = Array.from(document.querySelectorAll('.rose'));

    function closeRoses(except) {
      roses.forEach((rose) => {
        if (rose === except) return;
        rose.classList.remove('is-open');
        rose.setAttribute('aria-expanded', 'false');
      });
    }

    roses.forEach((rose) => {
      rose.addEventListener('click', () => {
        const isOpen = !rose.classList.contains('is-open');
        closeRoses(rose);
        rose.classList.toggle('is-open', isOpen);
        rose.setAttribute('aria-expanded', String(isOpen));
      });

      rose.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          rose.classList.remove('is-open');
          rose.setAttribute('aria-expanded', 'false');
          rose.blur();
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.rose')) closeRoses(null);
    });

    const roseHint = document.querySelector('.garden-hint .hint-text');
    if (roseHint && window.matchMedia('(hover: none)').matches) {
      roseHint.textContent = 'tap each rose to feel its warmth';
    }

    /* ── soft reveals ── */

    const revealItems = Array.from(document.querySelectorAll('.reveal'));

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('in'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

      revealItems.forEach((item) => observer.observe(item));
    }

    /* a shared link that points to a section skips the gift */
    if (deepLink) {
      opened = true;
      intro.classList.add('gone');
      intro.setAttribute('aria-hidden', 'true');
      intro.inert = true;
      document.body.classList.add('site-ready');
      revealItems.forEach((item) => item.classList.add('in'));

      /* no gift to open, so start with the visitor's first interaction */
      const startOnFirstInteraction = () => beginSong();
      document.addEventListener('pointerdown', startOnFirstInteraction, { once: true, passive: true });
      document.addEventListener('keydown', startOnFirstInteraction, { once: true });

      const target = document.querySelector(window.location.hash);
      if (target) {
        window.setTimeout(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }), 40);
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
        }
      }
    }
  })();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startSecretGarden, { once: true });
} else {
  startSecretGarden();
}
