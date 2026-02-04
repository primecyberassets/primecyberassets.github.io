(() => {
  // Standard 12-color sequence used in fiber/tube/ribbon identification
  const COLORS_12 = [
    "Blue", "Orange", "Green", "Brown", "Slate", "White",
    "Red", "Black", "Yellow", "Violet", "Rose", "Aqua"
  ];

  // Elements
  const totalFibersEl = document.getElementById("totalFibers");
  const modeSmfBtn = document.getElementById("modeSmf");
  const modeRibbonBtn = document.getElementById("modeRibbon");

  const smfSettings = document.getElementById("smfSettings");
  const ribbonSettings = document.getElementById("ribbonSettings");

  const fibersPerTubeEl = document.getElementById("fibersPerTube");
  const showFiberListEl = document.getElementById("showFiberList");

  const fibersPerRibbonEl = document.getElementById("fibersPerRibbon");
  const ribbonsPerTubeEl = document.getElementById("ribbonsPerTube");
  const showRibbonDetailEl = document.getElementById("showRibbonDetail");

  const calcBtn = document.getElementById("calcBtn");
  const clearBtn = document.getElementById("clearBtn");
  const resultEl = document.getElementById("result");
  const summaryEl = document.getElementById("summary");
  const errorEl = document.getElementById("error");

  const presetButtons = Array.from(document.querySelectorAll(".preset"));

  let mode = "SMF"; // "SMF" | "RIBBON"

  function setMode(next) {
    mode = next;
    if (mode === "SMF") {
      modeSmfBtn.classList.add("active");
      modeRibbonBtn.classList.remove("active");
      smfSettings.classList.remove("hidden");
      ribbonSettings.classList.add("hidden");
    } else {
      modeSmfBtn.classList.remove("active");
      modeRibbonBtn.classList.add("active");
      smfSettings.classList.add("hidden");
      ribbonSettings.classList.remove("hidden");
    }
    clearError();
    // Recalc if user already has a number entered
    const v = parseInt(totalFibersEl.value, 10);
    if (Number.isFinite(v) && v > 0) calculate();
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }

  function clampInt(val, min = 1) {
    const n = parseInt(val, 10);
    if (!Number.isFinite(n)) return null;
    return Math.max(min, n);
  }

  function tubeColor(tubeIndexZeroBased) {
    return COLORS_12[tubeIndexZeroBased % COLORS_12.length];
  }

  function fiberColor(fiberIndexOneBased) {
    return COLORS_12[(fiberIndexOneBased - 1) % COLORS_12.length];
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildSmf(totalFibers, fibersPerTube, showFiberList) {
    const tubesNeeded = Math.ceil(totalFibers / fibersPerTube);
    const fullTubes = Math.floor(totalFibers / fibersPerTube);
    const remainder = totalFibers % fibersPerTube;

    summaryEl.textContent =
      `Mode: SMF • ${tubesNeeded} tube(s) • ${fibersPerTube} fibers/tube`;

    let html = "";

    for (let t = 0; t < tubesNeeded; t++) {
      const tubeNum = t + 1;
      const isLastPartial = (t === tubesNeeded - 1) && (remainder !== 0);
      const countInTube = isLastPartial ? remainder : fibersPerTube;

      const color = tubeColor(t);
      html += `<div class="block">`;
      html += `<h3>Tube ${tubeNum} <span class="badge info">${escapeHtml(color)}</span></h3>`;
      html += `<div class="mono">Fibers in tube: ${countInTube}/${fibersPerTube}</div>`;

      if (showFiberList) {
        html += `<ul class="list">`;
        for (let i = 1; i <= countInTube; i++) {
          const c = fiberColor(i);
          html += `<li class="mono">Fiber ${i}: ${escapeHtml(c)}</li>`;
        }
        html += `</ul>`;
      }

      // Badge if full tube
      if (!isLastPartial) {
        html += `<div style="margin-top:10px;"><span class="badge ok">FULL</span></div>`;
      }

      html += `</div>`;
    }

    resultEl.innerHTML = html || "No result.";
  }

  function buildRibbon(totalFibers, fibersPerRibbon, ribbonsPerTube, showRibbonDetail) {
    const fibersPerTube = fibersPerRibbon * ribbonsPerTube;
    const tubesNeeded = Math.ceil(totalFibers / fibersPerTube);

    summaryEl.textContent =
      `Mode: Ribbon • ${tubesNeeded} tube(s) • ${fibersPerRibbon} fibers/ribbon • ${ribbonsPerTube} ribbons/tube (${fibersPerTube} fibers/tube)`;

    let remaining = totalFibers;
    let html = "";

    for (let t = 0; t < tubesNeeded; t++) {
      const tubeNum = t + 1;
      const color = tubeColor(t);
      const inThisTube = Math.min(remaining, fibersPerTube);

      html += `<div class="block">`;
      html += `<h3>Tube ${tubeNum} <span class="badge info">${escapeHtml(color)}</span></h3>`;
      html += `<div class="mono">Fibers in tube: ${inThisTube}/${fibersPerTube}</div>`;

      if (showRibbonDetail) {
        html += `<ul class="list">`;

        let tubeRemaining = inThisTube;
        for (let r = 0; r < ribbonsPerTube && tubeRemaining > 0; r++) {
          const ribbonNum = r + 1;
          const ribbonColor = COLORS_12[r % COLORS_12.length];

          const inThisRibbon = Math.min(tubeRemaining, fibersPerRibbon);

          if (inThisRibbon === fibersPerRibbon) {
            html += `<li class="mono">Ribbon ${ribbonNum}: ${escapeHtml(ribbonColor)} — ${fibersPerRibbon} fibers</li>`;
          } else {
            // Partial ribbon: show fiber colors inside that ribbon
            html += `<li class="mono">Ribbon ${ribbonNum}: ${escapeHtml(ribbonColor)} — ${inThisRibbon}/${fibersPerRibbon} fibers</li>`;
            html += `<ul class="list">`;
            for (let f = 1; f <= inThisRibbon; f++) {
              const c = fiberColor(f);
              html += `<li class="mono">Fiber ${f}: ${escapeHtml(c)}</li>`;
            }
            html += `</ul>`;
          }

          tubeRemaining -= inThisRibbon;
        }

        html += `</ul>`;
      }

      if (inThisTube === fibersPerTube) {
        html += `<div style="margin-top:10px;"><span class="badge ok">FULL</span></div>`;
      }

      html += `</div>`;

      remaining -= inThisTube;
    }

    resultEl.innerHTML = html || "No result.";
  }

  function calculate() {
    clearError();

    const totalFibers = clampInt(totalFibersEl.value, 1);
    if (!totalFibers || totalFibers < 1) {
      showError("Enter a valid Total Fiber Count (1 or more).");
      return;
    }

    if (mode === "SMF") {
      const fibersPerTube = clampInt(fibersPerTubeEl.value, 1);
      if (!fibersPerTube) {
        showError("Enter a valid Fibers per Tube (1 or more).");
        return;
      }
      const showFiberList = (showFiberListEl.value === "yes");
      buildSmf(totalFibers, fibersPerTube, showFiberList);
      return;
    }

    // Ribbon
    const fibersPerRibbon = clampInt(fibersPerRibbonEl.value, 1);
    const ribbonsPerTube = clampInt(ribbonsPerTubeEl.value, 1);
    if (!fibersPerRibbon || !ribbonsPerTube) {
      showError("Enter valid Ribbon settings (1 or more).");
      return;
    }

    const showRibbonDetail = (showRibbonDetailEl.value === "yes");
    buildRibbon(totalFibers, fibersPerRibbon, ribbonsPerTube, showRibbonDetail);
  }

  function clearAll() {
    clearError();
    summaryEl.textContent = "";
    totalFibersEl.value = "";
    resultEl.innerHTML = `Enter a fiber count and tap <strong>Calculate</strong>.`;
    totalFibersEl.focus();
  }

  // Events
  modeSmfBtn.addEventListener("click", () => setMode("SMF"));
  modeRibbonBtn.addEventListener("click", () => setMode("RIBBON"));

  calcBtn.addEventListener("click", calculate);
  clearBtn.addEventListener("click", clearAll);

  totalFibersEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") calculate();
  });

  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const v = parseInt(btn.getAttribute("data-val"), 10);
      if (Number.isFinite(v)) {
        totalFibersEl.value = String(v);
        calculate();
      }
    });
  });

  // Default
  setMode("SMF");
})();
