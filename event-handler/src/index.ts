import app from "./app";

const PORT = 8080;

app.listen(PORT, () => {
  // const logger = getLogger();
  console.log(`⚡️ Service listening on port ${PORT}`);
});
