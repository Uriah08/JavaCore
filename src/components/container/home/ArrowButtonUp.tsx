"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const ArrowButtonUP = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 p-3 bg-red-800 rounded-full text-white shadow-lg hover:bg-red-900 transition z-20"
        >
          <ChevronUp className="w-8 h-8" />
        </button>
      )}
    </>
  );
};

export default ArrowButtonUP;
