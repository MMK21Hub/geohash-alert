# Geohash Alert backend

## Development instructions

1. Install dependencies:

   ```bash
   bun install
   ```

2. Set up environment variables (copy `.env.example` to `.env` and fill in the values).

3. Run the development server:

   ```bash
   bun run dev
   ```

4. Open <http://localhost:3000>

### Debugging

Open a JavaScript Debug Terminal in VSCode and use the `--inspect` flag:

```bash
bun run src/index.ts --inspect
```
