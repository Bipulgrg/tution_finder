const { generateBookingRef } = require("../utils/generateRef");

function createBookingRef() {
  return generateBookingRef();
}

module.exports = { createBookingRef };
