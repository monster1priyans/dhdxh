import React from "react";
import { createRoot } from "react-dom/client";
import EkadashiStudio from "./EkadashiStudio.js";

const boot = document.getElementById("boot");
if (boot) boot.remove();
const el = document.getElementById("root");
createRoot(el).render(<EkadashiStudio />);
