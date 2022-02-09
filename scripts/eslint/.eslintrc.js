module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",

  rules: {
    "no-void": 2,
    "eol-last": 2,
    indent: [2, 2],
    "new-parens": 2,
    yoda: [2, "never"],
    semi: [2, "never"],
    quotes: [2, "double"],
    "wrap-iife": [2, "inside"],
    "dot-location": [2, "property"],
    "func-style": [2, "expression"],

    //comma
    "comma-style": 2,
    "comma-dangle": 2,
    "comma-spacing": 2,

    // no-dupe
    "no-dupe-keys": 2,
    "no-dupe-else-if": 2,
    "no-duplicate-case": 2,
    "no-duplicate-imports": 2,

    // spacing
    "key-spacing": 2,
    "no-multi-spaces": 2,
    "func-call-spacing": 2,
    "yield-star-spacing": 2,
    "no-trailing-spaces": 2,
    "generator-star-spacing": 2,
    "no-mixed-spaces-and-tabs": 2,
    "no-whitespace-before-property": 2
  }
}
