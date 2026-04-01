import cors from "cors";
import express from "express";
import { readFile, writeFile } from "node:fs/promises";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = "http://localhost:5173";
const DB_FILE_URL = new URL("../db.json", import.meta.url);

const DEFAULT_DB = {
  products: [],
  cartItems: [],
};

const writeDb = async (data) => {
  await writeFile(DB_FILE_URL, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const readDb = async () => {
  try {
    const raw = await readFile(DB_FILE_URL, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_DB,
      ...parsed,
      products: Array.isArray(parsed.products) ? parsed.products : [],
      cartItems: Array.isArray(parsed.cartItems) ? parsed.cartItems : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    throw error;
  }
};

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json({
      status: "ok",
      productsCount: db.products.length,
      cartItemsCount: db.cartItems.length,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

readDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize JSON database:", error);
    process.exit(1);
  });
