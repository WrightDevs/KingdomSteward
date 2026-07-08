// js/espees.js

function ngnToEspees(amountNGN) {
  return (amountNGN / CONFIG.ESPEES_RATE).toFixed(4);
}

function formatEspees(amountNGN) {
  const val = ngnToEspees(amountNGN);
  return `${Number(val).toLocaleString()} Esp`;
}
