
import { useState } from "react";

export const useStoreCart = () => {
  const [cartItems, setCartItems] = useState([]);

  // Add product to cart
  const addToCart = (product) => {
    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousItems, { ...product, quantity: 1 }];
    });
  };

  // Increase quantity
  const increaseQuantity = (productId) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (productId) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove product
  const removeFromCart = (productId) => {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.id !== productId)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Total quantity
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Total amount
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };
};
