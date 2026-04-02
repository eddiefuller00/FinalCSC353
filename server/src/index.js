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

const asNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : NaN;
};

const findProductById = (products, productId) =>
  products.find((product) => String(product.id) === String(productId));

const normalizeCartItems = (cartItems) =>
  Array.isArray(cartItems)
    ? cartItems
        .map((item) => ({
          productId: asNumber(item.productId ?? item.id),
          quantity: asNumber(item.quantity),
        }))
        .filter(
          (item) =>
            Number.isFinite(item.productId) &&
            Number.isFinite(item.quantity) &&
            item.quantity > 0,
        )
    : [];

const buildCartResponse = (db) => {
  const items = normalizeCartItems(db.cartItems)
    .map((item) => {
      const product = findProductById(db.products, item.productId);
      if (!product) {
        return null;
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0),
    0,
  );

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(subtotal.toFixed(2)),
  };
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

app.get("/api/products", async (req, res, next) => {
  try {
    const db = await readDb();
    const searchValue = String(req.query.search || "").trim().toLowerCase();

    if (!searchValue) {
      res.json(db.products);
      return;
    }

    const filteredProducts = db.products.filter((product) => {
      const searchable = `${product.title || ""} ${product.description || ""} ${product.category || ""}`;
      return searchable.toLowerCase().includes(searchValue);
    });

    res.json(filteredProducts);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:id", async (req, res, next) => {
  try {
    const db = await readDb();
    const product = findProductById(db.products, req.params.id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.get("/api/cart", async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(buildCartResponse(db));
  } catch (error) {
    next(error);
  }
});

app.post("/api/cart/items", async (req, res, next) => {
  try {
    const db = await readDb();
    const productId = asNumber(req.body.productId);
    const quantity = req.body.quantity === undefined ? 1 : asNumber(req.body.quantity);

    if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity < 1) {
      res.status(400).json({ error: "Invalid productId or quantity" });
      return;
    }

    const product = findProductById(db.products, productId);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const nextCartItems = normalizeCartItems(db.cartItems);
    const existingItem = nextCartItems.find(
      (item) => String(item.productId) === String(productId),
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      nextCartItems.push({ productId, quantity });
    }

    const nextDb = {
      ...db,
      cartItems: nextCartItems,
    };
    await writeDb(nextDb);
    res.status(201).json(buildCartResponse(nextDb));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/cart/items/:productId", async (req, res, next) => {
  try {
    const db = await readDb();
    const productId = asNumber(req.params.productId);
    const quantity = asNumber(req.body.quantity);

    if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity < 1) {
      res.status(400).json({ error: "Invalid quantity" });
      return;
    }

    const nextCartItems = normalizeCartItems(db.cartItems);
    const existingItem = nextCartItems.find(
      (item) => String(item.productId) === String(productId),
    );

    if (!existingItem) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    existingItem.quantity = quantity;

    const nextDb = {
      ...db,
      cartItems: nextCartItems,
    };
    await writeDb(nextDb);
    res.json(buildCartResponse(nextDb));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/cart/items/:productId", async (req, res, next) => {
  try {
    const db = await readDb();
    const productId = asNumber(req.params.productId);

    if (!Number.isFinite(productId)) {
      res.status(400).json({ error: "Invalid productId" });
      return;
    }

    const currentCartItems = normalizeCartItems(db.cartItems);
    const nextCartItems = currentCartItems.filter(
      (item) => String(item.productId) !== String(productId),
    );

    const nextDb = {
      ...db,
      cartItems: nextCartItems,
    };
    await writeDb(nextDb);
    res.json(buildCartResponse(nextDb));
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
