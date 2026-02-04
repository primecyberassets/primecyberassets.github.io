// Fiber Counter Web Logic
// Assumes 12 fibers per tube (standard)

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("fiberCount");
  const button = document.getElementById("calculateBtn");
  const output = document.getElementById("result");

  button.addEventListener("click", calculate);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") calculate();
  });

  function calculate() {
    const totalFibers = Number(input.value);

    if (!totalFibers || totalFibers <= 0) {
      output.textContent = "Please enter a valid fiber count.";
      return;
    }

    const fibersPerTube = 12;
    const tubeCount = Math.ceil(totalFibers / fibersPerTube);
    const remainder = totalFibers % fibersPerTube || fibersPerTube;

    output.textContent =
      `Total Fibers: ${totalFibers}\n` +
      `Tubes Required: ${tubeCount}\n` +
      `Fibers in Last Tube: ${remainder}`;
  }
});
