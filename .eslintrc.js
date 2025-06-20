module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:compat/recommended"
    ],
    "plugins": [
        "compat"
    ],
    "parserOptions": {
        "ecmaVersion": 2022,
    },
    "env": {
        "node": true,
        "browser": true
    },
    "globals": {
        "$": "readonly",
        "jQuery": "readonly"
    }
};
