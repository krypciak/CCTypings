# How do I get the types!?!?!?

- Put `game.compiled.js` in the repo root
- Run

```bash
npm install
npm run build
npx node ./dist/main.js
```

- The generated types should be in `output.d.ts`

Example class:
```ts
/* game.feature.menu.gui.help-boxes */
interface MultiPagePageCounter extends ig.GuiElementBase {
    gfx: ig.Image;
    transitions: unknown;
    count: sc.NumberGui;
    max: sc.NumberGui;

    setCount(this: this, a: unknown): void;
    setMax(this: this, a: unknown): void;
}
interface MultiPagePageCounterConstructor extends ImpactClass<MultiPagePageCounter> {
    new (a: unknown): MultiPagePageCounter;
}
var MultiPagePageCounter: MultiPagePageCounterConstructor
```
