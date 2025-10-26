import js from '@eslint/js';
import ts from 'typescript-eslint';

export default ts.config(
  js.configs.recommended,
  ts.configs.recommended,
  {
    ignores: ['node_modules', 'dist', '.next'],
    rules: {
      'no-console': ['warn', { allow: ['error'] }]
    }
  }
);
