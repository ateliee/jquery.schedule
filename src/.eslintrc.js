module.exports = {
    "env": {
        "browser": true,
        "node": false,
        'jquery': true
    },
    'extends': [
        'airbnb-base/legacy',
        'plugin:no-jquery/deprecated-3.5'
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "console": true,
        "$": true
    },
    "plugins": [
        "no-jquery"
    ],
    "rules": {
        "indent": [2, 4],
        "vars-on-top": "off",
        "no-restricted-syntax": "off",
        "guard-for-in": "off",
        "no-useless-concat": "off",
        "operator-linebreak": "off",
        "no-plusplus": "off",
        "block-scoped-var": "off",
        "func-names": "off",
        "no-continue": "off",
        "no-bitwise": "warn",
        "no-mixed-operators": "warn",
        "one-var": "off",
        "one-var-declaration-per-line": "off",
        "max-len": ["error", {code: 180}],
        "no-param-reassign": "warn",
        "no-else-return": "warn",
        "no-underscore-dangle": "off",
        "no-unneeded-ternary": "off",
        "no-jquery/variable-pattern": "error"
    }
};