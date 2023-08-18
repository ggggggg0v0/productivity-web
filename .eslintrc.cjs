{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020
  },
  "extends": [
    "react-app",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  "plugins": ["react", "@typescript-eslint", "prettier"],
  "env": {
    "browser": true,
    "jasmine": true,
    "jest": true,
    "es6": true
  },
  "rules": {
    "prettier/prettier": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/ban-ts-ignore": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/display-name": "off"
  },
  "settings": {
    "react": {
      "pragma": "React",
      "version": "detect"
    }
  }
}
