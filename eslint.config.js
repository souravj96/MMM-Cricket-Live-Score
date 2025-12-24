const js = require("@eslint/js");

module.exports = [
	{
		ignores: ["node_modules/**", ".vscode/**", ".git/**", ".github/**", "*.min.js"]
	},
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				// Browser globals
				document: "readonly",
				window: "readonly",
				console: "readonly",
				setTimeout: "readonly",
				setInterval: "readonly",
				clearTimeout: "readonly",
				clearInterval: "readonly",

				// Node.js globals
				process: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				require: "readonly",
				module: "readonly",
				exports: "readonly",
				Buffer: "readonly",
				fetch: "readonly",

				// MagicMirror globals
				Module: "readonly",
				Log: "readonly",
				MM: "readonly",
				config: "readonly"
			}
		},
		rules: {
			"indent": ["error", "tab"],
			"quotes": ["error", "double"],
			"semi": ["error", "always"],
			"no-unused-vars": ["warn"],
			"no-console": "off",
			"no-trailing-spaces": ["error"],
			"eol-last": ["error", "always"],
			"object-curly-spacing": ["error", "always"],
			"array-bracket-spacing": ["error", "never"],
			"space-before-function-paren": ["error", "always"],
			"keyword-spacing": ["error", { "before": true, "after": true }],
			"comma-spacing": ["error", { "before": false, "after": true }],
			"no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }]
		}
	}
];
