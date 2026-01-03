// LOAD ENV FIRST (VERY IMPORTANT)
require("dotenv").config();

const express = require("express");
const app = express();
const { resolve } = require("path");

// PORT
const port = process.env.PORT || 3000;

// ENV VARIABLES CHECK
if (!process.env.STATIC_DIR) {
  console.error("❌ STATIC_DIR is not defined in .env");
  process.exit(1);
}
if (!process.env.SECRET_KEY) {
  console.error("❌ SECRET_KEY is not defined in .env");
  process.exit(1);
}
if (!process.env.DOMAIN) {
  console.error("❌ DOMAIN is not defined in .env");
  process.exit(1);
}

// STRIPE
const stripe = require("stripe")(process.env.SECRET_KEY);

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// STATIC FILES
app.use(express.static(resolve(__dirname, process.env.STATIC_DIR)));

// ROUTES
app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, process.env.STATIC_DIR, "index.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(resolve(__dirname, process.env.STATIC_DIR, "success.html"));
});

app.get("/cancel", (req, res) => {
  res.sendFile(resolve(__dirname, process.env.STATIC_DIR, "cancel.html"));
});

app.get("/workshop1", (req, res) => {
  res.sendFile(
    resolve(__dirname, process.env.STATIC_DIR, "workshops", "workshop1.html")
  );
});

app.get("/workshop2", (req, res) => {
  res.sendFile(
    resolve(__dirname, process.env.STATIC_DIR, "workshops", "workshop2.html")
  );
});

app.get("/workshop3", (req, res) => {
  res.sendFile(
    resolve(__dirname, process.env.STATIC_DIR, "workshops", "workshop3.html")
  );
});

// STRIPE CHECKOUT
app.post("/create-checkout-session/:pid", async (req, res) => {
  try {
    const priceId = req.params.pid;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.DOMAIN}/success?id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
      allow_promotion_codes: true,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ error: "Payment failed" });
  }
});

// SERVER START
app.listen(port, () => {
  console.log(`✅ Server listening on port: ${port}`);
  console.log(`🌐 App URL: ${process.env.DOMAIN}`);
});
