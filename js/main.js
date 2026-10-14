(() => {
  gsap.registerPlugin(ScrollTrigger);

  // ========================================================================
  // PANTALLA DE CARGA (Apple Preloader: Bonsái Central & Carrusel de Árboles)
  // ========================================================================
  const preloader = document.getElementById("preloader");
  const preloaderRing = document.getElementById("preloaderRing");
  const preloaderPercent = document.getElementById("preloaderPercent");
  const preloaderLinearBar = document.getElementById("preloaderLinearBar");
  const preloaderTreeCaption = document.getElementById("preloaderTreeCaption");
  const preloaderCore = document.querySelector(".preloader-core");
  const bgSlides = document.querySelectorAll(".preloader-bg-slide");

  if (preloader) {
    document.body.classList.add("loading");

    const ringCircumference = 515.2; // 2 * PI * 82
    let currentSlide = 0;
    let slideInterval = null;

    // Rotación suave de los árboles de fondo y actualización de nombres
    const nextSlide = () => {
      if (bgSlides.length === 0) return;
      bgSlides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % bgSlides.length;
      bgSlides[currentSlide].classList.add("active");

      const treeName = bgSlides[currentSlide].getAttribute("data-tree");
      if (preloaderTreeCaption && treeName) {
        gsap.to(preloaderTreeCaption, {
          opacity: 0,
          y: -4,
          duration: 0.2,
          onComplete: () => {
            preloaderTreeCaption.textContent = treeName;
            gsap.to(preloaderTreeCaption, { opacity: 1, y: 0, duration: 0.35 });
          },
        });
      }
    };

    slideInterval = setInterval(nextSlide, 1350);

    // Animación pausada de la barra y el anillo de carga estilo Apple (0% a 100%)
    gsap.to(
      { val: 0 },
      {
        val: 100,
        duration: 6.8,
        ease: "power1.inOut",
        onUpdate: function () {
          const current = Math.round(this.targets()[0].val);
          if (preloaderPercent) preloaderPercent.textContent = `${current}%`;
          if (preloaderLinearBar) preloaderLinearBar.style.width = `${current}%`;
          if (preloaderRing) {
            const offset = ringCircumference * (1 - current / 100);
            preloaderRing.style.strokeDashoffset = offset;
          }
        },
        onComplete: function () {
          clearInterval(slideInterval);
          if (preloaderTreeCaption) {
            preloaderTreeCaption.textContent = "Colección viva lista";
          }

          // Salida cinematográfica con revelado del bonsái principal
          const exitTl = gsap.timeline({
            onComplete: () => {
              if (preloader && preloader.parentNode) {
                preloader.parentNode.removeChild(preloader);
              }
              document.body.classList.remove("loading");
              ScrollTrigger.refresh();
            },
          });

          exitTl
            .to(preloaderCore, {
              scale: 1.08,
              opacity: 0,
              y: -15,
              duration: 0.6,
              ease: "power2.in",
            })
            .to(
              preloader,
              {
                opacity: 0,
                duration: 0.7,
                ease: "power2.out",
              },
              "-=0.2"
            )
            .fromTo(
              "#bonsaiWrap",
              { scale: 1.08, filter: "brightness(0.6)" },
              { scale: 1, filter: "brightness(1)", duration: 1.2, ease: "power2.out" },
              "-=0.4"
            )
            .fromTo(
              ".hero-copy",
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
              "-=0.8"
            );
        },
      }
    );
  }

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
    opacity: 1,
    dpr: 1,
  };

  let lastY = window.scrollY;
  let lastT = performance.now();

  const resizeCanvas = () => {
    if (!canvas) return;
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
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (!rain.active || (rain.opacity !== undefined && rain.opacity <= 0.01)) {
      ctx.clearRect(0, 0, w, h);
      return;
    }
    ctx.clearRect(0, 0, w, h);

    rain.wind += (rain.targetWind - rain.wind) * 0.08;
    rain.speed += (rain.targetSpeed - rain.speed) * 0.1;
    rain.targetWind *= 0.94;
    rain.targetSpeed += (1 - rain.targetSpeed) * 0.045;

    ctx.lineCap = "round";
    const currentOpacity = rain.opacity !== undefined ? rain.opacity : 1;

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
      const alpha = drop.alpha * currentOpacity;
      ctx.strokeStyle = `rgba(92, 112, 98, ${alpha})`;
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

  const bonsaiImage = document.getElementById("bonsaiImage") || document.querySelector(".leaf");
  const bonsaiSheen = document.getElementById("bonsaiSheen");
  const heroStage = document.querySelector(".hero-stage");
  const leafScene = document.querySelector(".leaf-scene");

  gsap.set(leafWrap, {
    transformOrigin: "50% 50%",
    transformPerspective: 1800,
    force3D: true,
  });

  if (bonsaiImage) {
    gsap.set(bonsaiImage, {
      transformOrigin: "50% 50%",
      force3D: true,
    });
  }

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
    // 1. Overlay sutil desaparece dejando ver la madera y el musgo en todo su esplendor
    .to(
      ".leaf-overlay",
      {
        opacity: 0,
        duration: 0.35,
      },
      0
    )
    // 2. Destello de luz cinematográfico cruzando el tronco y la copa del bonsái
    .fromTo(
      ".bonsai-sheen",
      {
        xPercent: -100,
        opacity: 0,
      },
      {
        xPercent: 100,
        opacity: 0.45,
        duration: 0.5,
        ease: "power1.inOut",
      },
      0.05
    )
    // 3. El texto inicial ("La naturaleza...") se retira hacia arriba
    .to(
      heroCopy,
      {
        autoAlpha: 0,
        y: -40,
        duration: 0.3,
      },
      0.05
    )
    // 4. La barra de navegación se convierte en cristal esmerilado con texto negro
    .to(
      ".nav",
      {
        color: "#1d1d1f",
        backgroundColor: "rgba(245, 245, 247, 0.85)",
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
    // 5. El bonsái SE HACE CADA VEZ MÁS PEQUEÑO hacia el centro HASTA QUE DESAPARECE
    .to(
      leafWrap,
      {
        scale: 0.01,
        autoAlpha: 0,
        xPercent: 0,
        yPercent: 0,
        rotateY: 0,
        rotateX: 6,
        rotateZ: 0,
        borderRadius: "999px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
        duration: 0.75,
        ease: "power2.inOut",
      },
      0.15
    )
    // 6. Efecto de profundidad y reducción en la fotografía interior mientras encoge
    .to(
      bonsaiImage,
      {
        scale: 0.75,
        filter: "brightness(0.95)",
        duration: 0.75,
        ease: "power2.inOut",
      },
      0.15
    )
    // 7. En el centro aparece con máxima elegancia el manifiesto de la colección ("Un jardín no se decora...")
    .fromTo(
      revealCopy,
      {
        autoAlpha: 0,
        scale: 0.94,
        y: 25,
      },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      },
      0.55
    );

  // Micro-interacción física: inclinación 3D del bonsái y destello reactivo al mover el cursor
  if (heroStage && bonsaiImage) {
    heroStage.addEventListener("mousemove", (e) => {
      // Activo solo en la escena inicial previa al scroll profundo
      if (window.scrollY > window.innerHeight * 0.8) return;

      const rect = heroStage.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(bonsaiImage, {
        x: -mouseX * 22,
        y: -mouseY * 18,
        rotateZ: mouseX * 1.2,
        scale: 1.02,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (bonsaiSheen) {
        gsap.to(bonsaiSheen, {
          xPercent: mouseX * 80,
          opacity: Math.min(Math.abs(mouseX) * 1.4, 0.3),
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });

    heroStage.addEventListener("mouseleave", () => {
      gsap.to(bonsaiImage, {
        x: 0,
        y: 0,
        rotateZ: 0,
        scale: 1,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (bonsaiSheen) {
        gsap.to(bonsaiSheen, {
          opacity: 0,
          duration: 1,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });
  }

  // Respiración viva sutil del bonsái (living presence)
  if (leafScene) {
    gsap.to(leafScene, {
      y: -6,
      duration: 4.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

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

  // ========================================================================
  // CICLO NATURAL EN TIERRA: DE LLUVIA A SALIDA DE SOL Y CRECIMIENTO BOTÁNICO
  // ========================================================================
  const soilStage = document.querySelector(".soil-stage");
  const soilSun = document.getElementById("soilSun");
  const soilSunAtmosphere = document.getElementById("soilSunAtmosphere");
  const soilSunbeams = document.getElementById("soilSunbeams");
  const soilSunTitle = document.getElementById("soilSunTitle");
  const cycleLabel = document.getElementById("cycleLabel");
  const cycleDot = document.getElementById("cycleDot");
  const soilPoint1 = document.getElementById("soilPoint1");
  const soilPoint2 = document.getElementById("soilPoint2");
  const soilPoint3 = document.getElementById("soilPoint3");
  const sunRaysRotator = document.getElementById("sunRaysRotator");
  const gardenStems = gsap.utils.toArray(".growing-garden .plant-stem");
  const gardenLeaves = gsap.utils.toArray(".growing-garden .plant-leaf");
  const gardenFlowers = gsap.utils.toArray(".growing-garden .plant-flower");
  const gardenSeedlings = gsap.utils.toArray(".growing-garden .seedling-item");

  let soilTl = null;

  if (soilStage) {
    // 1. Estados iniciales en reposo
    gsap.set(gardenStems, { scaleY: 0, transformOrigin: "bottom center" });
    gsap.set(gardenLeaves, { scale: 0, opacity: 0 });
    gsap.set(gardenFlowers, { scale: 0, opacity: 0, rotation: -20 });
    gsap.set(gardenSeedlings, { scaleY: 0, opacity: 0, transformOrigin: "bottom center" });
    if (soilSun) {
      gsap.set(soilSun, { y: 90, scale: 0.5, opacity: 0, autoAlpha: 0 });
    }

    // 2. Timeline sincronizada con el scroll del usuario (Pinning estilo Apple Keynote)
    soilTl = gsap.timeline({
      scrollTrigger: {
        trigger: soilStage,
        start: "top top",
        end: "+=130%",
        pin: true,
        scrub: 1.1,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;

          // Dinámica física de la lluvia: cesa progresivamente con el scroll
          if (p < 0.4) {
            rain.active = true;
            rain.opacity = Math.max(0, 1 - (p / 0.32));
          } else {
            rain.opacity = 0;
            rain.active = false;
          }

          // Actualización de estado en el badge y puntos del ciclo
          if (cycleLabel && cycleDot) {
            if (p < 0.32) {
              cycleLabel.textContent = "Fase 01 · Lluvia nutricia";
              cycleDot.style.backgroundColor = "#5c7062";
              soilPoint1?.classList.add("active");
              soilPoint2?.classList.remove("active");
              soilPoint3?.classList.remove("active");
            } else if (p < 0.65) {
              cycleLabel.textContent = "Fase 02 · Luz y despertar solar";
              cycleDot.style.backgroundColor = "#f59e0b";
              soilPoint1?.classList.remove("active");
              soilPoint2?.classList.add("active");
              soilPoint3?.classList.remove("active");
            } else {
              cycleLabel.textContent = "Fase 03 · Brotación viva";
              cycleDot.style.backgroundColor = "#2e7d32";
              soilPoint1?.classList.remove("active");
              soilPoint2?.classList.remove("active");
              soilPoint3?.classList.add("active");
            }
          }
        },
      },
    });

    // FASE A: La lluvia se disipa, la atmósfera se ilumina con cálido amanecer dorado
    soilTl
      .to(
        "#rain",
        {
          opacity: 0,
          duration: 0.35,
          ease: "power1.out",
        },
        0.05
      )
      .to(
        soilSunAtmosphere,
        {
          opacity: 1,
          duration: 0.45,
          ease: "power1.inOut",
        },
        0.08
      )
      .to(
        soilSunbeams,
        {
          opacity: 1,
          duration: 0.45,
          ease: "power1.inOut",
        },
        0.15
      );

    // FASE B: Emerge y asciende el Sol radiante en el cielo
    if (soilSun) {
      soilTl.to(
        soilSun,
        {
          y: 0,
          scale: 1.15,
          opacity: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        0.12
      );
    }

    if (sunRaysRotator) {
      soilTl.to(
        sunRaysRotator,
        {
          rotate: 55,
          duration: 0.85,
          ease: "none",
        },
        0.12
      );
    }

    if (soilSunTitle) {
      soilTl.to(
        soilSunTitle,
        {
          color: "#b45309",
          textShadow: "0 0 25px rgba(245, 158, 11, 0.35)",
          duration: 0.4,
          ease: "power1.out",
        },
        0.22
      );
    }

    // FASE C: La tierra caliente y húmeda brota: primero plántulas y brotes tiernos
    soilTl.to(
      gardenSeedlings,
      {
        scaleY: 1,
        opacity: 1,
        duration: 0.35,
        stagger: 0.03,
        ease: "back.out(1.8)",
      },
      0.32
    );

    // FASE D: Los tallos botánicos crecen hacia la luz solar
    soilTl.to(
      gardenStems,
      {
        scaleY: 1,
        duration: 0.45,
        stagger: 0.035,
        ease: "power2.out",
      },
      0.38
    );

    // FASE E: Las hojas se abren y despliegan con gracia orgánica
    soilTl.to(
      gardenLeaves,
      {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        stagger: 0.018,
        ease: "back.out(1.5)",
      },
      0.48
    );

    // FASE F: Florecen los capullos y flores con el sol en su cenit
    soilTl.to(
      gardenFlowers,
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "back.out(2)",
      },
      0.62
    );
  }

  // Observer de visibilidad para optimizar el rendimiento del canvas
  ScrollTrigger.create({
    trigger: ".soil-stage",
    start: "top bottom",
    end: "bottom top",
    onEnter: () => {
      if (soilTl && soilTl.scrollTrigger && soilTl.scrollTrigger.progress < 0.4) {
        rain.active = true;
      }
    },
    onEnterBack: () => {
      if (soilTl && soilTl.scrollTrigger && soilTl.scrollTrigger.progress < 0.4) {
        rain.active = true;
      }
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
