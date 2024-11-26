import "./styles/main.scss";
import App from "./App.svelte";

// Get the package version from environment variables
const packageVersion = import.meta.env.PACKAGE_VERSION;

// Get the target element
const target = document.getElementById("appRheinMain");

// Set the data-version attribute
target.setAttribute("data-version", packageVersion);

// Initialize the Svelte app
const app = new App({
  target,
  props: {
    target
  },
});

export default app;
