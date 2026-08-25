"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

const Loading = () => {
  return (
    <div
      className="flex items-center justify-center h-screen
    sm:flex sm:items-center sm:justify-center sm:h-screen
    md:flex md:items-center md:justify-center md:h-screen
    lg:flex lg:items-center lg:justify-center lg:h-screen"
    >
      <motion.div
        className="w-auto h-auto m-0"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src={"/loadLogo_shield_smooth.png"}
          alt={"loading"}
          width={60}
          height={60}
          priority
          className="w-auto h-auto m-auto p-0"
        />
      </motion.div>
      <Link href={"/Dashboard"} className="font-poppins text-[100%]
          text-blue-500 no-underline mb-6 block font-bold">
           <h1>reresh</h1>
      </Link> 
    </div>
  );
};

export default Loading;