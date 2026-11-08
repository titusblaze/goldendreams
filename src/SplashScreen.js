
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "./SplashScreen.css";
import logo from "./assets/image/logo512.png";

function SplashScreen() {
  useEffect(() => {
    document.body.classList.add("splash-active");

    return () => {
      document.body.classList.remove("splash-active");
    };
  }, []);

  return (
    <motion.div
      className="gd-splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="gd-splash-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          className="gd-logo-glow"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          <img
            src={logo}
            alt="Golden Dreams Studio"
            className="gd-splash-logo"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          GOLDEN DREAMS
        </motion.h2>

        <p>STUDIO</p>

        <div className="gd-loading">
          <span />
          <span />
          <span />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SplashScreen;
