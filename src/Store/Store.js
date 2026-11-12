import React, { useEffect, useRef, useState } from "react";
import "./Store.css";

import {
  STORE_CATEGORIES,
  STORE_PRODUCTS,
  STORE_PACKAGES,
  formatPrice,
  fetchStoreData,
  STORE_API_URL,
} from "./StoreData";

import { useStoreCart } from "./StoreCart";
import { generateStoreQuotation } from "./StoreQuotation";

const Store = () => {
  const [activeCategory, setActiveCategory] = useState("gifts");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [storeCategories, setStoreCategories] =
    useState(STORE_CATEGORIES);

  const [storeProducts, setStoreProducts] =
    useState(STORE_PRODUCTS);

  const [storePackages, setStorePackages] =
    useState(STORE_PACKAGES);

  const [isStoreLoading, setIsStoreLoading] = useState(true);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    eventDate: "",
  });

  const storeRef = useRef(null);

  const {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useStoreCart();

  // Load Store data from Google Sheets with local fallback
  useEffect(() => {
    let isMounted = true;

    const loadStoreData = async () => {
      try {
        const data = await fetchStoreData();

        if (
          !Array.isArray(data.categories) ||
          !Array.isArray(data.products) ||
          !Array.isArray(data.packages)
        ) {
          throw new Error("Invalid store data structure.");
        }

        if (isMounted) {
          setStoreCategories(data.categories);
          setStoreProducts(data.products);
          setStorePackages(data.packages);

          const firstCategory = data.categories.find(
            (category) => category.id !== "customize"
          );

          if (firstCategory) {
            setActiveCategory(firstCategory.id);
          }
        }
      } catch (error) {
        console.error("Store API Error:", error);
      } finally {
        if (isMounted) {
          setIsStoreLoading(false);
        }
      }
    };

    loadStoreData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Scroll reveal animation
  useEffect(() => {
    const elements =
      storeRef.current?.querySelectorAll(".store-reveal") || [];

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("visible")
      );
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  // Category navigation
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);

    const section = document.getElementById(
      `store-section-${categoryId}`
    );

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Customized package builder
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState({});

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedExtras({});
  };

  const updateExtraQuantity = (productId, change) => {
    setSelectedExtras((previous) => {
      const currentQuantity = previous[productId] || 0;
      const nextQuantity = Math.max(0, currentQuantity + change);

      return {
        ...previous,
        [productId]: nextQuantity,
      };
    });
  };

  const extraProducts = storeProducts.filter(
    (product) => (selectedExtras[product.id] || 0) > 0
  );

  const extrasTotal = extraProducts.reduce(
    (total, product) =>
      total + product.price * selectedExtras[product.id],
    0
  );

  const customizedTotal = selectedPackage
    ? selectedPackage.price + extrasTotal
    : 0;

  const addCustomizedPackage = () => {
    if (!selectedPackage) {
      alert("Please select a package first.");
      return;
    }

    const includedDetails = selectedPackage.includes
      .map((item) => {
        const product = storeProducts.find(
          (product) => product.id === item.productId
        );

        return product
          ? `${product.name} x ${item.quantity}`
          : "";
      })
      .filter(Boolean);

    const extraDetails = extraProducts.map(
      (product) =>
        `${product.name} x ${selectedExtras[product.id]}`
    );

    const customizedProduct = {
      id: `custom-${Date.now()}`,
      name: `${selectedPackage.name} - Customized`,
      price: customizedTotal,
      category: "combo-packages",
      type: "Package",
      isPackage: true,
      description: [
        `Base package: ${selectedPackage.name}`,
        `Included: ${includedDetails.join(", ")}`,
        `Extras: ${extraDetails.join(", ") || "None"}`,
      ].join(" | "),
      image: "",
      customizable: true,
    };

    addToCart(customizedProduct);

    setSelectedPackage(null);
    setSelectedExtras({});
    setIsCartOpen(true);
  };

  // Customer form updates
  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Checkout: generate quotation, save order to Google Sheets, then open WhatsApp
  const handleCheckout = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      alert(
        "Please fill in your name, contact number and delivery address."
      );
      return;
    }

    // Open WhatsApp tab immediately to avoid popup blocking
    const whatsappWindow = window.open("about:blank", "_blank");

    setIsSubmitting(true);

    try {
      // Generate PDF quotation
      const quotationNumber = await generateStoreQuotation({
        customer,
        cartItems,
        cartTotal,
      });

      if (!quotationNumber) {
        throw new Error(
          "Quotation could not be generated. Please try again."
        );
      }

      // Prepare order data for Google Sheets
      const orderPayload = {
        quotationNumber,

        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email || "",
          address: customer.address.trim(),
          eventDate: customer.eventDate || "",
        },

        cartItems: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          description: item.description || "",
          customizedDetails: item.description || "",
          type: item.type || (item.isPackage ? "Package" : "Product"),
          isPackage: Boolean(item.isPackage),
        })),

        cartTotal: Number(cartTotal) || 0,
        deliveryCharges: 0,
      };

      // Save order to Google Sheets
      const response = await fetch(STORE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        throw new Error(
          "Unable to connect to the order sheet. Please try again."
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Google Sheets could not save this order."
        );
      }

      // Prepare WhatsApp message after successful save
      // Includes extras and customization details
      const productDetails = cartItems
        .map((item) => {
          const details =
            item.customizedDetails || item.description || "";

          return `${item.name} x ${item.quantity} = ${formatPrice(
            item.price * item.quantity
          )}${details ? `\n   Extras / Customization: ${details}` : ""}`;
        })
        .join("\n\n");

      const message = `
Hello Golden Dreams!

I would like to enquire about the following products.

Quotation: ${quotationNumber}
Order ID: ${result.order?.orderId || "Saved"}

Customer Name: ${customer.name}
Contact: ${customer.phone}
Address: ${customer.address}
Event Date: ${customer.eventDate || "Not specified"}

ORDER DETAILS:
${productDetails}

Total Amount: ${formatPrice(cartTotal)}

I've generated my quotation PDF. Please find it attached.

Kindly review it and let me know the next steps.

Thank you for choosing Golden Dreams!
      `.trim();

      const whatsappNumber = "919976149065";

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }

      // Show premium success popup
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Store checkout error:", error);

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }

      alert(
        error.message ||
          "Something went wrong while saving your order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Product card with live cart indication
  const renderProductCard = (product) => {
    const cartItem = cartItems.find(
      (item) => item.id === product.id
    );

    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <article
        className="store-product-card store-reveal"
        data-no-swipe
        key={product.id}
      >
        <div className="store-product-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <span className="store-image-placeholder">✦</span>
          )}
        </div>

        <div className="store-product-info">
          <h3 className="store-product-name">{product.name}</h3>

          <p className="store-product-description">
            {product.description}
          </p>

          <div className="store-product-bottom">
            <span className="store-product-price">
              {formatPrice(product.price)}
            </span>

            {quantity === 0 ? (
              <button
                type="button"
                className="store-add-button"
                onClick={() => addToCart(product)}
              >
                + Add to Cart
              </button>
            ) : (
              <div className="store-product-cart-status">
                <span className="store-added-label">
                  <span>✓</span> Added
                </span>

                <div className="store-product-quantity">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(product.id)}
                    aria-label={`Decrease ${product.name}`}
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() => increaseQuantity(product.id)}
                    aria-label={`Increase ${product.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="store-page" ref={storeRef}>
      <div className="store-container">

        {/* STORE HEADER */}
        <header className="store-header store-reveal">
          <p className="store-eyebrow">
            THE ART OF THOUGHTFUL GIFTING
          </p>

          <h1 className="store-title">
            Discover Something Special
          </h1>

          <p className="store-description">
            Beautiful gifts. Precious memories. Thoughtfully created for you.
          </p>

          <span className="store-header-line" aria-hidden="true" />
        </header>

        {/* CATEGORY NAVIGATION + STORE CART */}
        <nav
          className="store-category-nav"
          aria-label="Store categories"
        >
          <div className="store-category-list">
            {storeCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`store-category-button ${
                  activeCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="store-cart-button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <span className="store-cart-icon" aria-hidden="true">
              ♧
            </span>

            <span className="store-cart-label">Cart</span>
            <span className="store-cart-count">{cartCount}</span>
          </button>
        </nav>

        {/* PRODUCT CATEGORY SECTIONS */}
        {storeCategories
          .filter((category) => category.id !== "customize")
          .map((category) => {
            const products = storeProducts.filter(
              (product) => product.category === category.id
            );

            return (
              <section
                key={category.id}
                id={`store-section-${category.id}`}
                className="store-section"
              >
                <div className="store-section-heading store-reveal">
                  <h2 className="store-section-title">
                    {category.name}
                  </h2>

                  <p className="store-section-description">
                    {category.description}
                  </p>
                </div>

                <div className="store-product-grid">
                  {products.map(renderProductCard)}
                </div>
              </section>
            );
          })}

        {/* CUSTOMIZE PACKAGE BUILDER */}
        <section
          id="store-section-customize"
          className="store-section"
        >
          <div className="store-customize-builder store-reveal">

            <div className="store-section-heading">
              <p className="store-eyebrow">DESIGNED BY YOU</p>

              <h2 className="store-section-title">
                Build Your Own Gift Package
              </h2>

              <p className="store-section-description">
                Choose your favourite package and make it extra special.
              </p>
            </div>

            {/* FIXED PACKAGES */}
            <div className="store-package-grid">
              {storePackages.map((pkg) => (
                <article
                  key={pkg.id}
                  className={`store-package-card ${
                    selectedPackage?.id === pkg.id ? "selected" : ""
                  }`}
                  data-no-swipe
                >
                  <div className="store-package-info">
                    <span className="store-package-label">
                      {pkg.id === "premium"
                        ? "POPULAR CHOICE"
                        : "GOLDEN DREAMS"}
                    </span>

                    <h3>{pkg.name}</h3>

                    <p>{pkg.description}</p>

                    <div className="store-package-price">
                      {formatPrice(pkg.price)}
                    </div>

                    <div className="store-package-includes">
                      <strong>Package includes:</strong>

                      {pkg.includes.map((included) => {
                        const product = storeProducts.find(
                          (item) => item.id === included.productId
                        );

                        return product ? (
                          <p key={included.productId}>
                            ✓ {product.name} × {included.quantity}
                          </p>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="store-package-select"
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    {selectedPackage?.id === pkg.id
                      ? "Selected ✓"
                      : "Choose Package"}
                  </button>
                </article>
              ))}
            </div>

            {/* EXTRA PRODUCTS */}
            {selectedPackage && (
              <div className="store-extra-builder">
                <div className="store-section-heading">
                  <h3 className="store-section-title">
                    Make It More Special
                  </h3>

                  <p className="store-section-description">
                    Add extra products to your selected package.
                  </p>
                </div>

                <div className="store-extra-grid">
                  {storeProducts.map((product) => (
                    <div
                      className="store-extra-item"
                      data-no-swipe
                      key={product.id}
                    >
                      <div>
                        <h4>{product.name}</h4>
                        <span>{formatPrice(product.price)}</span>
                      </div>

                      <div className="store-quantity-controls">
                        <button
                          type="button"
                          onClick={() =>
                            updateExtraQuantity(product.id, -1)
                          }
                          aria-label={`Remove one ${product.name}`}
                        >
                          −
                        </button>

                        <span>
                          {selectedExtras[product.id] || 0}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateExtraQuantity(product.id, 1)
                          }
                          aria-label={`Add one ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* LIVE PACKAGE SUMMARY */}
                <div className="store-package-summary">
                  <h3>Your Package Summary</h3>

                  <div className="store-summary-row">
                    <span>{selectedPackage.name}</span>
                    <span>
                      {formatPrice(selectedPackage.price)}
                    </span>
                  </div>

                  {extraProducts.map((product) => (
                    <div
                      className="store-summary-row"
                      key={product.id}
                    >
                      <span>
                        {product.name} × {selectedExtras[product.id]}
                      </span>

                      <span>
                        {formatPrice(
                          product.price * selectedExtras[product.id]
                        )}
                      </span>
                    </div>
                  ))}

                  <div className="store-summary-total">
                    <span>Estimated Total</span>
                    <strong>
                      {formatPrice(customizedTotal)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="store-checkout-button"
                    onClick={addCustomizedPackage}
                  >
                    Add Customized Package to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* CART OVERLAY */}
      {/* PROFESSIONAL CART DRAWER */}
      {isCartOpen && (
        <div
          className="gd-cart-overlay"
          onClick={() => setIsCartOpen(false)}
        >
          <aside
            className="gd-cart-drawer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="gd-cart-header">
              <div>
                <span className="gd-cart-brand">GOLDEN DREAMS</span>
                <h2>Your Shopping Bag</h2>
                <p>
                  {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
                </p>
              </div>

              <button
                type="button"
                className="gd-cart-close"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {/* Cart Body */}
            <div className="gd-cart-body">
              {cartItems.length === 0 ? (
                <div className="gd-cart-empty">
                  <span className="gd-cart-empty-icon">✧</span>
                  <h3>Your bag is empty</h3>
                  <p>
                    Discover something special from our collection.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="gd-cart-section-title">
                    <h3>Selected Items</h3>
                    <span>{cartCount} items</span>
                  </div>

                  <div className="gd-cart-items">
                    {cartItems.map((item) => (
                      <article className="gd-cart-item" key={item.id}>
                        <div className="gd-cart-item-top">
                          <div className="gd-cart-item-details">
                            <h4>{item.name}</h4>

                            {item.description && (
                              <p>{item.description}</p>
                            )}

                            <span className="gd-cart-unit-price">
                              {formatPrice(item.price)} <small>/ unit</small>
                            </span>
                          </div>

                          <button
                            type="button"
                            className="gd-cart-remove"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="gd-cart-item-bottom">
                          <div className="gd-cart-quantity">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <strong className="gd-cart-line-total">
                            {formatPrice(item.price * item.quantity)}
                          </strong>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <section className="gd-cart-summary">
                    <div className="gd-cart-summary-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>

                    <div className="gd-cart-summary-row">
                      <span>Delivery</span>
                      <span className="gd-cart-confirm">
                        To be confirmed
                      </span>
                    </div>

                    <div className="gd-cart-grand-total">
                      <span>Estimated Total</span>
                      <strong>{formatPrice(cartTotal)}</strong>
                    </div>

                    <p>
                      Final delivery charges, if applicable, will be
                      confirmed by our team.
                    </p>
                  </section>

                  {/* Customer Details */}
                  <section className="gd-cart-customer">
                    <div className="gd-cart-section-title">
                      <div>
                        <span className="gd-cart-step">01 — CHECKOUT</span>
                        <h3>Delivery Information</h3>
                      </div>
                    </div>

                    <form onSubmit={handleCheckout}>
                      <div className="gd-cart-field">
                        <label htmlFor="store-customer-name">
                          Full Name <span>*</span>
                        </label>

                        <input
                          id="store-customer-name"
                          type="text"
                          name="name"
                          placeholder="Your full name"
                          value={customer.name}
                          onChange={handleCustomerChange}
                          required
                        />
                      </div>

                      <div className="gd-cart-field">
                        <label htmlFor="store-customer-phone">
                          Contact Number <span>*</span>
                        </label>

                        <input
                          id="store-customer-phone"
                          type="tel"
                          name="phone"
                          placeholder="Your mobile number"
                          value={customer.phone}
                          onChange={handleCustomerChange}
                          required
                        />
                      </div>

                      <div className="gd-cart-field">
                        <label htmlFor="store-customer-address">
                          Delivery Address <span>*</span>
                        </label>

                        <textarea
                          id="store-customer-address"
                          name="address"
                          placeholder="House / Street / City / PIN code"
                          rows={3}
                          value={customer.address}
                          onChange={handleCustomerChange}
                          required
                        />
                      </div>

                      <div className="gd-cart-field">
                        <label htmlFor="store-event-date">
                          Event Date <small>(Optional)</small>
                        </label>

                        <input
                          id="store-event-date"
                          type="date"
                          name="eventDate"
                          value={customer.eventDate}
                          onChange={handleCustomerChange}
                        />
                      </div>

                      <button
                        type="submit"
                        className="gd-cart-checkout"
                        disabled={isSubmitting}
                      >
                        <span>
                          {isSubmitting
                            ? "Saving Order..."
                            : "Generate Quotation"}
                        </span>

                        <span>{isSubmitting ? "…" : "→"}</span>
                      </button>

                      <p className="gd-cart-secure-note">
                        Your quotation PDF will be downloaded. You can
                        attach it manually when WhatsApp opens.
                      </p>
                    </form>

                    <button
                      type="button"
                      className="gd-cart-clear"
                      onClick={clearCart}
                    >
                      Clear Shopping Bag
                    </button>
                  </section>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* MIDNIGHT GOLD SUCCESS POPUP */}
      {showSuccessModal && (
        <div className="gd-success-overlay">
          <div
            className="gd-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gd-success-title"
          >
            <div className="gd-success-brand">
              ✦ GOLDENDREAMS SAYS ✦
            </div>

            <div className="gd-success-icon">✓</div>

            <h2 id="gd-success-title">
              Quotation Generated!
            </h2>

            <p className="gd-success-message">
              Your quotation has been generated and your order has
              been saved successfully!
            </p>

            <div className="gd-success-divider" />

            <h3>Thank You!</h3>

            <p className="gd-success-thanks">
              Thank you for choosing Golden Dreams.
              <br />
              We look forward to being part of your special moments.
            </p>

            <button
              type="button"
              className="gd-success-button"
              onClick={() => setShowSuccessModal(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Store;