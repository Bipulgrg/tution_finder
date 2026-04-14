function randomDigits(len) {
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out;
}

function generateBookingRef() {
  return `TF-${randomDigits(4)}-${randomDigits(5)}`;
}

module.exports = { generateBookingRef };
