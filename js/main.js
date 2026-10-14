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

  // ========================================================================
  // ANIMACIÓN 3D HARDWARE DISPLAY ESTILO IPHONE (Sección Sobre Mí)
  // ========================================================================
  const toolFrame = document.getElementById("toolFrame");
  const toolImage = document.getElementById("toolImage");
  const toolSheen = document.getElementById("toolSheen");
  const tagTop = document.getElementById("tagTop");
  const tagBottom = document.getElementById("tagBottom");
  const toolContainer = document.querySelector(".tool-perspective-container");

  if (toolFrame && toolImage) {
    gsap.set(toolFrame, {
      transformOrigin: "50% 50%",
      transformPerspective: 1600,
      force3D: true,
    });

    // Timeline anclada al scrollTrigger de la sección Sobre Mí
    const toolTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".philosophy",
        start: "top 85%",
        end: "bottom 15%",
        scrub: 1.2,
      },
    });

    // 1. Giro 3D y escala del marco como un dispositivo Apple
    toolTl
      .fromTo(
        toolFrame,
        {
          rotateY: -20,
          rotateX: 16,
          rotateZ: -3,
          scale: 0.88,
          yPercent: 12,
          boxShadow: "0 15px 35px rgba(29, 29, 31, 0.08)",
        },
        {
          rotateY: 10,
          rotateX: -10,
          rotateZ: 2,
          scale: 1.04,
          yPercent: -10,
          boxShadow: "0 45px 95px rgba(29, 29, 31, 0.22)",
          ease: "none",
        },
        0
      )
      // 2. Parallax interno de la imagen dentro del marco
      .fromTo(
        toolImage,
        {
          scale: 1.25,
          yPercent: -10,
        },
        {
          scale: 1.05,
          yPercent: 10,
          ease: "none",
        },
        0
      )
      // 3. Destello de barrido de luz metálica (Sheen gleam estilo titanio)
      .fromTo(
        toolSheen,
        {
          xPercent: -90,
          opacity: 0.2,
        },
        {
          xPercent: 130,
          opacity: 0.9,
          ease: "power1.inOut",
        },
        0.1
      )
      // 4. Aparición flotante de las etiquetas estilo Apple specs
      .fromTo(
        tagTop,
        {
          autoAlpha: 0,
          scale: 0.7,
          y: 25,
        },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.35,
          ease: "back.out(1.7)",
        },
        0.25
      )
      .fromTo(
        tagBottom,
        {
          autoAlpha: 0,
          scale: 0.7,
          y: 25,
        },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.35,
          ease: "back.out(1.7)",
        },
        0.35
      );

    // Micro-interacción Apple con ratón (Tilt 3D reactivo al pasar el cursor)
    if (toolContainer) {
      toolContainer.addEventListener("mousemove", (e) => {
        const rect = toolContainer.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(toolFrame, {
          rotateY: mouseX * 16,
          rotateX: -mouseY * 16,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      toolContainer.addEventListener("mouseleave", () => {
        gsap.to(toolFrame, {
          rotateY: 0,
          rotateX: 0,
          duration: 1.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    }
  }

  // ========================================================================
  // SCROLL HORIZONTAL ESTILO APPLE (Sección Trabajos Selectos)
  // ========================================================================
  const worksSection = document.querySelector(".works-horizontal-wrapper");
  const worksTrack = document.getElementById("worksTrack");
  const worksProgress = document.getElementById("worksProgress");

  if (worksSection && worksTrack) {
    const isDesktop = window.innerWidth > 768;

    if (isDesktop) {
      const getScrollDistance = () => {
        const trackWidth = worksTrack.scrollWidth;
        const viewportWidth = window.innerWidth;
        const paddingRight = parseFloat(window.getComputedStyle(worksTrack).paddingRight) || 0;
        return Math.max(trackWidth - viewportWidth + paddingRight, 350);
      };

      const horizontalTl = gsap.timeline({
        scrollTrigger: {
          trigger: worksSection,
          start: "top top",
          end: () => `+=${Math.max(getScrollDistance() * 1.3, 1100)}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (worksProgress) {
              worksProgress.style.width = `${Math.max(self.progress * 100, 12)}%`;
            }
          },
        },
      });

      horizontalTl.to(worksTrack, {
        x: () => -getScrollDistance(),
        ease: "none",
      });

      // Micro-efecto de foco y escala en las tarjetas al desplazarse horizontalmente
      gsap.utils.toArray(".work-card").forEach((card, index) => {
        horizontalTl.fromTo(
          card,
          { scale: 0.97, opacity: 0.9 },
          { scale: 1, opacity: 1, duration: 0.25, ease: "power1.out" },
          index * 0.2
        );
      });
    } else {
      const container = document.querySelector(".works-track-container");
      if (container && worksProgress) {
        container.addEventListener(
          "scroll",
          () => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            const ratio = maxScroll > 0 ? container.scrollLeft / maxScroll : 0;
            worksProgress.style.width = `${Math.max(ratio * 100, 15)}%`;
          },
          { passive: true }
        );
      }
    }

    // ========================================================================
    // INTERACCIÓN HOVER 3D MAGNÉTICA Y REFLEJO EN TARJETAS DE TRABAJOS
    // ========================================================================
    const workCards = document.querySelectorAll(".work-card");

    workCards.forEach((card) => {
      const inner = card.querySelector(".work-card-inner");
      const img = card.querySelector(".work-media img");
      const sheen = card.querySelector(".card-sheen");

      if (!inner) return;

      gsap.set(inner, {
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      });

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const mouseX = x / rect.width - 0.5;
        const mouseY = y / rect.height - 0.5;

        // Posición del reflejo specular
        if (sheen) {
          card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
          card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
        }

        // Inclinación 3D del cuerpo de la tarjeta
        gsap.to(inner, {
          rotateY: mouseX * 16,
          rotateX: -mouseY * 16,
          scale: 1.025,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Contra-parallax de la fotografía para profundidad tridimensional
        if (img) {
          gsap.to(img, {
            x: -mouseX * 22,
            y: -mouseY * 22,
            scale: 1.1,
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(inner, {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.9,
          ease: "power2.out",
          overwrite: "auto",
        });

        if (img) {
          gsap.to(img, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });
    });
  }

  // Revelado de tarjetas de valoraciones
  gsap.utils.toArray(".review-card").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 35,
      duration: 0.85,
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

  // Lógica del contador de observaciones (máximo 500 caracteres)
  const obsTextarea = document.getElementById("observaciones");
  const charCounter = document.getElementById("charCounter");

  if (obsTextarea && charCounter) {
    const updateCount = () => {
      const len = obsTextarea.value.length;
      charCounter.textContent = `${len} / 500`;
      if (len >= 480) {
        charCounter.style.color = "#d97706";
      } else {
        charCounter.style.color = "var(--muted)";
      }
    };
    obsTextarea.addEventListener("input", updateCount);
    updateCount();
  }

  // Envío del formulario de contacto a antoncocajavier@gmail.com
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
      const originalText = btnText ? btnText.textContent : "Enviar solicitud";

      if (btnText) btnText.textContent = "Enviando solicitud...";
      if (submitBtn) submitBtn.disabled = true;
      if (formStatus) {
        formStatus.className = "form-status";
        formStatus.textContent = "";
      }

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          formStatus.className = "form-status success";
          formStatus.innerHTML = "✓ Solicitud enviada correctamente. Javier se pondrá en contacto contigo en menos de 24 horas.";
          contactForm.reset();
          if (charCounter) charCounter.textContent = "0 / 500";
        } else {
          contactForm.submit();
        }
      } catch (err) {
        contactForm.submit();
      } finally {
        if (btnText) btnText.textContent = originalText;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Desplazamiento suave para los enlaces del menú considerando la barra de navegación
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navOffset = 58;
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({
          top: targetPos,
          behavior: "smooth",
        });
      }
    });
  });

  window.addEventListener("scroll", onScrollPhysics, { passive: true });
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  loop();
})();
