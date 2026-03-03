# @9troisquarts/inline-filters

> **Current version:** `2.7.19`


## Installation

```bash
# yarn
yarn add @9troisquarts/inline-filters

# npm
npm i @9troisquarts/inline-filters
```

## Utilisation

```typescript
import InlineFilters, { InlineFilterSchema } from '@9troisquarts/inline-filters'

const schema: InlineFilterSchema = [
  {
    name: 'someField',
    input: {
      type: 'daterange'
    }
  }
]

 const customProps: InlineFiltersProps = {}
 return (
   //...
   <InlineFilters schema={schema} {...customProps} />
 )
```

## InlineFiltersProps

| version | key | type | default value | details |
| --- | --- | --- | --- | --- |
| * | `config`| **Configuration ** | - | |
| * | `value`| **T** | - | current value of inline filters |
| * | `defaultValue`| **T** | - | default value of inline filters |
| * | `resetText`| **String** | `Reset filters` | Text for reset button |
| * | `delay`| **number** | 200 | delay before applying new filters |
| * | `toggle`| **FilterToggleType** | - | Config for toggle |
| * | `resetButton`| **React.ReactNode** | - | specific config for reset Button |
| * | `resetButtonProps`| **ButtonProps** | - |  |
| * | `resetButtonVisibility`| **InlineFiltersResetButtonVisibility** | `dirty` | possible values [`always`, `never`, `dirty`] |
| * | `onReset` | **void function** | - | callback called on reset action |
| `>=2.7.19` | `containerStyle`| **React.CssProperties** | `{ display: "flex", flexWrap: "wrap", gap: "1rem", flexDirection: "row", alignItems: "flex-start" }` | CSS for the div containing the inline filters |
| `>=2.7.19` | `layout` | **InlineFiltersLayout** | `inline` | Possible values: [`inline`, `vertical`], allow to force vertical rendering if needed, **__⚠️ if defined it will overrides `containerStyle`__** |
| `>=2.7.19` | `flexGap` | **String** | `1rem` | Allow to adapt gap between filters, **__⚠️ if defined it will overrides `containerStyle.gap`__** |

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
