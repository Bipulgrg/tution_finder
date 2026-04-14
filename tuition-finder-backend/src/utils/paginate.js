async function paginate(modelQuery, { page = 1, limit = 10 } = {}) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (p - 1) * l;

  const [items, total] = await Promise.all([
    modelQuery.skip(skip).limit(l),
    modelQuery.model.countDocuments(modelQuery.getFilter()),
  ]);

  const totalPages = Math.ceil(total / l) || 1;

  return {
    items,
    meta: {
      page: p,
      totalPages,
      total,
      limit: l,
    },
  };
}

module.exports = { paginate };
