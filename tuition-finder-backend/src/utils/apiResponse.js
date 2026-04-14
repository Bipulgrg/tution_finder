function apiResponse({ data = null, message = null, meta = null } = {}) {
  const res = { success: true, data };
  if (message) res.message = message;
  if (meta) res.meta = meta;
  return res;
}

module.exports = { apiResponse };
