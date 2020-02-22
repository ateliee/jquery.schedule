module.exports = {
    "extends": [
        "eslint:recommended",
        // check https://github.com/amilajack/eslint-plugin-compat
        "plugin:compat/recommended"
    ],
    "plugins": [
    ],
    "parserOptions": {
        "ecmaVersion": 6,
    },
    "env": {
        "node": true
    },
    "globals": {
        "$": "readonly",
        "jQuery": "readonly"
    }
};