(() => {
  // Fiber color sequence (standard 12)
  const FIBER_COLORS = [
    { name: "Blue",   hex: "#1e64c8", lightText:false },
    { name: "Orange", hex: "#f57c00", lightText:false },
    { name: "Green",  hex: "#2e7d32", lightText:false },
    { name: "Brown",  hex: "#5d4037", lightText:false },
    { name: "Slate",  hex: "#616161", lightText:false },
    { name: "White",  hex: "#f1f1f1", lightText:true  },
    { name: "Red",    hex: "#c62828", lightText:false },
    { name: "Black",  hex: "#111111", lightText:false },
    { name: "Yellow", hex: "#fdd835", lightText:true  },
    { name: "Violet", hex: "#6a1b9a", lightText:false },
    { name: "Rose",   hex: "#d81b60", lightText:false },
    { name: "Aqua",   hex: "#00acc1", lightText:true  }
  ];

  // Stripe groups (based on your instruction text)
  // 1-144: none, 145-288: black stripe, 289-432: red stripe
  const STRIPE_RULES = [
    { min: 145, max: 288, kind: "black" },
    { min: 289, max: 432, kind: "red" }
  ];

  const el = (id) => document.getElementById(id);

  const calcType = el("calcType");
  const ribbonSizeWrap = el("ribbonSizeWrap");
  const ribbonSize = el("ribbonSize");
  const startFiber = el("startFiber");
  const targetFiber = el("targetFiber");
  const btnCalc = el("btnCalc");

  const screenForm = el("screenForm");
  const screenSmf = el("screenSmf");
  const screenRibbon = el("screenRibbon");

  const btnBackSmf = el("btnBackSmf");
  const btnBackRibbon = el("btnBackRibbon");

  const err = el("err");

  // SMF result elements
  const tubeBlock = el("tubeBlock");
  const tubeStripe = el("tubeStripe");
  const tubeMeta = el("tubeMeta");
  const fiberList = el("fiberList");

  // Ribbon result elements
  const rbSizeText = el("rbSizeText");
  const rbNumText = el("rbNumText");
  const rbFiberText = el("rbFiberText");
  const rbRelText = el("rbRelText");

  function showError(msg){
    err.textContent = msg;
    err.classList.remove("hidden");
  }
  function clearError(){
    err.textContent = "";
    err.classList.add("hidden");
  }

  function toInt(v){
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) ? n : null;
  }

  function showScreen(which){
    screenForm.classList.add("hidden");
    screenSmf.classList.add("hidden");
    screenRibbon.classList.add("hidden");
    which.classList.remove("hidden");
  }

  function updateModeUI(){
    const isRibbon = calcType.value === "RIBN";
    ribbonSizeWrap.classList.toggle("hidden", !isRibbon);
  }

  function stripeKindForFiber(fiberNum){
    for (const rule of STRIPE_RULES){
      if (fiberNum >= rule.min && fiberNum <= rule.max) return rule.kind;
    }
    return null;
  }

  function renderSmf(){
    const start = toInt(startFiber.value);
    const target = toInt(targetFiber.value);

    if (start == null || start < 1) return showError("Enter a valid Start Fiber #");
    if (target == null || target < 1) return showError("Enter a valid Target Fiber #");
    if (target < start) return showError("Target Fiber # must be ≥ Start Fiber #");

    // Relative fiber position inside this count (used by some techs)
    const rel = (target - start) + 1;

    // Use ABSOLUTE target fiber to determine tube and tube-range (matches your screenshot 133–144 for target 144)
    const tubeIndex = Math.ceil(target / 12);                 // 1-based tube number in the full cable
    const tubeStart = (tubeIndex - 1) * 12 + 1;
    const tubeEnd   = tubeIndex * 12;

    // Tube color cycles every 12 tubes
    const tubeColorObj = FIBER_COLORS[(tubeIndex - 1) % 12];

    // Determine stripe kind based on the target fiber range (per your instruction text)
    const stripeKind = stripeKindForFiber(target);

    // Paint tube block
    tubeBlock.style.background = tubeColorObj.hex;

    // Stripe overlay
    if (stripeKind === "black"){
      tubeStripe.style.background = `repeating-linear-gradient(
        135deg,
        rgba(0,0,0,0.0) 0px,
        rgba(0,0,0,0.0) 22px,
        rgba(0,0,0,0.85) 22px,
        rgba(0,0,0,0.85) 44px
      )`;
      tubeStripe.classList.remove("hidden");
    } else if (stripeKind === "red"){
      tubeStripe.style.background = `repeating-linear-gradient(
        135deg,
        rgba(0,0,0,0.0) 0px,
        rgba(0,0,0,0.0) 22px,
        rgba(200,40,40,0.9) 22px,
        rgba(200,40,40,0.9) 44px
      )`;
      tubeStripe.classList.remove("hidden");
    } else {
      tubeStripe.classList.add("hidden");
    }

    // Meta text (small, not heavy)
    tubeMeta.textContent = `Tube ${tubeIndex} • Fibers ${tubeStart}–${tubeEnd} • Relative fiber in count: ${rel}`;

    // Build the 12 fiber tiles for that tube range
    fiberList.innerHTML = "";
    for (let i = 0; i < 12; i++){
      const fiberNum = tubeStart + i; // absolute fiber number
      const fiberColorObj = FIBER_COLORS[i];

      const tile = document.createElement("div");
      tile.className = "fiber-tile" + (fiberColorObj.lightText ? " light" : "");
      tile.style.background = fiberColorObj.hex;

      if (fiberNum === target){
        tile.classList.add("highlight");
      }

      tile.innerHTML = `
        <div class="fiber-num">${fiberNum}</div>
        <div class="fiber-name">${fiberColorObj.name}</div>
      `;

      fiberList.appendChild(tile);
    }

    showScreen(screenSmf);
  }

  function renderRibbon(){
    const start = toInt(startFiber.value);
    const target = toInt(targetFiber.value);

    if (start == null || start < 1) return showError("Enter a valid Start Fiber #");
    if (target == null || target < 1) return showError("Enter a valid Target Fiber #");
    if (target < start) return showError("Target Fiber # must be ≥ Start Fiber #");

    const size = toInt(ribbonSize.value) || 12;

    const rel = (target - start) + 1;
    const ribbonNum = Math.ceil(rel / size);
    const fiberInRibbon = ((rel - 1) % size) + 1;

    rbSizeText.textContent = `${size}F`;
    rbNumText.textContent = String(ribbonNum);
    rbFiberText.textContent = String(fiberInRibbon);
    rbRelText.textContent = String(rel);

    showScreen(screenRibbon);
  }

  // Events
  calcType.addEventListener("change", () => {
    updateModeUI();
    clearError();
  });

  btnCalc.addEventListener("click", () => {
    clearError();
    if (calcType.value === "SMF") renderSmf();
    else renderRibbon();
  });

  btnBackSmf.addEventListener("click", () => showScreen(screenForm));
  btnBackRibbon.addEventListener("click", () => showScreen(screenForm));

  // Init
  updateModeUI();
  showScreen(screenForm);
})();
