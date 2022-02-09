import * as path from "path"
import * as rollup from "rollup"
import * as ttypescript from "ttypescript"

import {
  default as rollup_typescript
} from "@rollup/plugin-typescript"

export default rollup.defineConfig({
  input: {
    index: path.resolve("./src/exports/index.ts")
  },

  plugins: [
    rollup_typescript({
      typescript: ttypescript,
      tsconfig: path.resolve("./scripts/typescript/tsconfig.build.json")
    })
  ],

  output: [
    {
      format: "cjs",
      chunkFileNames: "chunk/[hash].cjs",
      entryFileNames: "entry/[name].cjs",
      dir: path.resolve("./build/bundle/cjs")
    },
    {
      format: "esm",
      chunkFileNames: "chunk/[hash].mjs",
      entryFileNames: "entry/[name].mjs",
      dir: path.resolve("./build/bundle/esm")
    }
  ]
})
