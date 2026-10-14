(() => {
  gsap.registerPlugin(ScrollTrigger);

  const leafWrap = document.querySelector(".leaf-wrap");
  const heroCopy = document.querySelector(".hero-copy");
  const revealCopy = document.querySelector(".reveal-copy");
  const toolImg = document.querySelector(".tool-frame img");
  const canvas = document.getElementById("rain");
  const ctx = canvas.getContext("2d", { alpha: true });

  const rain = {
    drops: [],
    wind: 0,
    speed: 1,
    targetWind: 0,
    targetSpeed: 1,
    active: false,
    dpr: 1,
  };

  let lastY = window.scrollY;
  let lastT = performance.now();

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    rain.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * rain.dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * rain.dpr));
    ctx.setTransform(rain.dpr, 0, 0, rain.dpr, 0, 0);
    spawnDrops(rect.width, rect.height);
  };

  const spawnDrops = (w, h) => {
    const count = Math.min(220, Math.floor((w * h) / 9000));
    rain.drops = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 10 + Math.random() * 16,
      thick: 0.6 + Math.random() * 0.8,
      vy: 7 + Math.random() * 9,
      alpha: 0.18 + Math.random() * 0.22,
    }));
  };

  const drawRain = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    rain.wind += (rain.targetWind - rain.wind) * 0.08;
    rain.speed += (rain.targetSpeed - rain.speed) * 0.1;
    rain.targetWind *= 0.94;
    rain.targetSpeed += (1 - rain.targetSpeed) * 0.045;

    ctx.lineCap = "round";

    for (const drop of rain.drops) {
      drop.x += rain.wind * 0.55;
      drop.y += drop.vy * rain.speed;

      if (drop.y > h + 20) {
        drop.y = -20;
        drop.x = Math.random() * w;
      }
      if (drop.x > w + 20) drop.x = -10;
      if (drop.x < -20) drop.x = w + 10;

      const tilt = rain.wind * 1.8;
      ctx.strokeStyle = `rgba(92, 112, 98, ${drop.alpha})`;
      ctx.lineWidth = drop.thick;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + tilt, drop.y + drop.len);
      ctx.stroke();
    }
  };

  const loop = () => {
    if (rain.active) drawRain();
    requestAnimationFrame(loop);
  };

  const onScrollPhysics = () => {
    const now = performance.now();
    const y = window.scrollY;
    const dt = Math.max(8, now - lastT);
    const vy = (y - lastY) / dt;
    lastY = y;
    lastT = now;

    const gust = Math.max(-1.4, Math.min(1.4, vy * 18));
    rain.targetWind = gust * 14;
    rain.targetSpeed = 1 + Math.min(3.2, Math.abs(vy) * 22);
  };

  gsap.set(leafWrap, {
    transformOrigin: "50% 50%",
    force3D: true,
  });

  gsap.set(revealCopy, {
    autoAlpha: 0,
    y: 35,
  });

  const isMobile = window.innerWidth <= 1100;

  const heroTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".hero-stage",
      start: "top top",
      end: "+=260%",
      pin: ".hero-pin",
      scrub: 1.1,
      anticipatePin: 1,
    },
  });

  heroTl
    // 1. Overlay oscuro desaparece devolviendo la luminosidad viva a la imagen
    .to(
      ".leaf-overlay",
      {
        opacity: 0,
        duration: 0.5,
      },
      0
    )
    // 2. La imagen se transforma en 3D, se redondea y se ubica de lado
    .to(
      leafWrap,
      {
        scale: isMobile ? 0.48 : 0.52,
        xPercent: isMobile ? 0 : 32,
        yPercent: isMobile ? -22 : 0,
        rotateY: isMobile ? 0 : -26,
        rotateX: isMobile ? 8 : 12,
        rotateZ: isMobile ? 0 : 3,
        borderRadius: "32px",
        boxShadow: "0 35px 85px rgba(0, 0, 0, 0.28)",
        duration: 1,
      },
      0
    )
    // 3. Las letras cambian de blanco a negro al salir de la imagen
    .to(
      heroCopy,
      {
        color: "#1d1d1f",
        duration: 0.35,
      },
      0
    )
    .to(
      ".hero-copy .eyebrow",
      {
        color: "#6e6e73",
        duration: 0.35,
      },
      0
    )
    // 4. La barra de navegación se convierte en cristal esmerilado con texto negro
    .to(
      ".nav",
      {
        color: "#1d1d1f",
        backgroundColor: "rgba(245, 245, 247, 0.82)",
        borderBottomColor: "rgba(29, 29, 31, 0.08)",
        backdropFilter: "blur(20px)",
        duration: 0.35,
      },
      0
    )
    .to(
      ".nav nav",
      {
        color: "#6e6e73",
        duration: 0.35,
      },
      0
    )
    // 5. El texto del hero inicial se retira con suavidad hacia arriba
    .to(
      heroCopy,
      {
        autoAlpha: 0,
        y: -45,
        duration: 0.4,
      },
      0.18
    )
    // 6. El texto lateral ("Un jardín no se decora. Se orquesta.") aparece en negro nítido
    .to(
      revealCopy,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
      },
      0.4
    );

  if (toolImg) {
    gsap.fromTo(
      toolImg,
      { yPercent: -8, scale: 1.08 },
      {
        yPercent: 8,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".philosophy",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  gsap.utils.toArray(".cards article").forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 28,
      duration: 0.9,
      delay: i * 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
      },
    });
  });

  ScrollTrigger.create({
    trigger: ".soil-stage",
    start: "top bottom",
    end: "bottom top",
    onEnter: () => {
      rain.active = true;
    },
    onEnterBack: () => {
      rain.active = true;
    },
    onLeave: () => {
      rain.active = false;
    },
    onLeaveBack: () => {
      rain.active = false;
    },
  });

  window.addEventListener("scroll", onScrollPhysics, { passive: true });
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  loop();
})();
