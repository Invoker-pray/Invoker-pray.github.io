/* ============================================
   Jiao hongbao's Trash - Custom Animations JS
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  /* --- Scroll Progress Bar (init once) --- */
  (function initScrollProgress() {
    if (document.getElementById("scroll-progress")) return;
    var bar = document.createElement("div");
    bar.id = "scroll-progress";
    document.body.appendChild(bar);

    window.addEventListener(
      "scroll",
      function () {
        var scrollTop =
          document.documentElement.scrollTop || document.body.scrollTop;
        var scrollHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        var progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        bar.style.width = progress + "%";
      },
      { passive: true },
    );
  })();

  /* --- Functions that need to re-run after pjax --- */
  function initPageAnimations() {
    // Post cards scroll animation
    var observerOptions = {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px",
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document
      .querySelectorAll("#recent-posts > .recent-post-item")
      .forEach(function (el) {
        observer.observe(el);
      });

    // Site title typewriter caret
    var title = document.getElementById("site-title");
    if (title) {
      title.classList.remove("typed-done");
      setTimeout(function () {
        title.classList.add("typed-done");
      }, 3800);
    }

    // Parallax
    initParallax();
  }

  function initParallax() {
    var header = document.getElementById("page-header");
    if (!header || !header.classList.contains("full_page")) return;

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrolled = window.pageYOffset;
          var headerHeight = header.offsetHeight;
          if (scrolled < headerHeight) {
            header.style.backgroundPositionY = scrolled * 0.4 + "px";
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    // Clean up on next pjax
    document.addEventListener("pjax:send", function cleanup() {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pjax:send", cleanup);
    });
  }

  // Run on first load
  initPageAnimations();

  // Re-run after pjax navigation
  document.addEventListener("pjax:complete", initPageAnimations);

  /* --- Floating Particles (lightweight, no library) --- */
  (function initParticles() {
    // Skip on mobile
    if (window.innerWidth < 768) return;

    var canvas = document.createElement("canvas");
    canvas.id = "particles-canvas";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var particles = [];
    var particleCount = 35;
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    document.addEventListener(
      "mousemove",
      function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      },
      { passive: true },
    );

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      var color = isDark ? "255, 255, 255" : "100, 100, 120";
      var lineColor = isDark ? "255, 255, 255" : "150, 150, 170";

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse repulsion (subtle)
        var dx = p.x - mouse.x;
        var dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x += dx * 0.008;
          p.y += dy * 0.008;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + color + ", " + p.opacity + ")";
        ctx.fill();

        // Draw lines between nearby particles
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var ddx = p.x - p2.x;
          var ddy = p.y - p2.y;
          var d = ddx * ddx + ddy * ddy;
          if (d < 18000) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle =
              "rgba(" + lineColor + ", " + 0.12 * (1 - d / 18000) + ")";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawParticles);
    }

    drawParticles();
  })();

  /* --- Smooth Scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* --- Click Star Scatter Effect (星辰飘散) --- */
  (function initClickStars() {
    var canvas = document.createElement("canvas");
    canvas.id = "click-particles";
    canvas.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var stars = [];
    var colors = [
      "#fffbe6",
      "#fef3c7",
      "#fde68a", // warm gold
      "#c4b5fd",
      "#a78bfa",
      "#8b5cf6", // purple
      "#bae6fd",
      "#7dd3fc",
      "#38bdf8", // blue
      "#fecdd3",
      "#fda4af", // pink
    ];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function Star(x, y) {
      this.x = x;
      this.y = y;
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 2.5 + 0.8;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - Math.random() * 1.5; // drift upward
      this.life = 1;
      this.decay = Math.random() * 0.008 + 0.006; // slow fade
      this.size = Math.random() * 3.5 + 1.5;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.08;
      this.twinkle = Math.random() * Math.PI * 2; // twinkle phase
      this.points = Math.random() > 0.3 ? 4 : 5; // 4 or 5 pointed star
    }

    function drawStar(s) {
      var points = s.points;
      var outer = s.size * s.life;
      var inner = outer * 0.4;
      // twinkle: oscillate opacity
      var twinkleAlpha = 0.6 + 0.4 * Math.sin(s.twinkle);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.globalAlpha = s.life * twinkleAlpha;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = outer * 2;
      ctx.beginPath();
      for (var i = 0; i < points * 2; i++) {
        var r = i % 2 === 0 ? outer : inner;
        var a = (i * Math.PI) / points - Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = stars.length - 1; i >= 0; i--) {
        var s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.01; // very gentle gravity
        s.vx *= 0.995; // slight drag
        s.life -= s.decay;
        s.rotation += s.rotSpeed;
        s.twinkle += 0.15;

        if (s.life <= 0) {
          stars.splice(i, 1);
          continue;
        }
        drawStar(s);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    var animating = false;
    document.addEventListener("click", function (e) {
      var count = 12 + Math.floor(Math.random() * 8); // 12~19 stars
      for (var i = 0; i < count; i++) {
        stars.push(new Star(e.clientX, e.clientY));
      }
      if (!animating) {
        animating = true;
        (function loop() {
          if (stars.length > 0) {
            animate();
            requestAnimationFrame(loop);
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            animating = false;
          }
        })();
      }
    });
  })();
});
