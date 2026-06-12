// Input-validation regexes from rest-spec §9 (the Automata tie-in).
// Kept in one place so every controller validates the same way.
module.exports = {
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  password: /^[\x20-\x7E]{8,128}$/, // 8–128 printable ASCII
  full_name: /^[\p{L}\p{M}'\- ]{2,150}$/u, // letters (incl. Khmer), marks, ' - space
  url: /^https?:\/\/[^\s]{1,500}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};
