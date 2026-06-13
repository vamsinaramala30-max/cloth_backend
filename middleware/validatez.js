const { z } = require('zod');

// Compatibility shim: some controllers may import ../middleware/validatez.
// Delegate to the existing validate middleware.
const { validateBody } = require('./validate');

module.exports = { validateBody };

