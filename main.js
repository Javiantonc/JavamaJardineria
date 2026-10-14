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
    transformOrigin: "50% 55%",
    force3D: true,
  });

  const heroTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".hero-stage",
      start: "top top",
      end: "+=280%",
      pin: ".hero-pin",
      scrub: 1.1,
      anticipatePin: 1,
    },
  });

  heroTl
    .to(
      leafWrap,
      {
        rotateY: 48,
        rotateX: -16,
        rotateZ: -9,
        scale: 0.38,
        xPercent: 36,
        yPercent: 4,
        borderRadius: "28px",
      },
      0
    )
    .to(
      heroCopy,
      {
        color: "#1d1d1f",
      },
      0
    )
    .to(
      ".hero-copy .eyebrow",
      {
        color: "#6e6e73",
      },
      0
    )
    .to(
      ".nav",
      {
        color: "#1d1d1f",
        backgroundColor: "rgba(245, 245, 247, 0.72)",
        borderBottomColor: "rgba(29, 29, 31, 0.08)",
      },
      0
    )
    .to(
      ".nav nav",
      {
        color: "#6e6e73",
      },
      0
    )
    .to(
      revealCopy,
      {
        opacity: 1,
        y: -24,
      },
      0.38
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
