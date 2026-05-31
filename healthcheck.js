require("http")
  .get("http://127.0.0.1:9090/api/health/live", (response) => {
    process.exit(response.statusCode === 200 ? 0 : 1);
  })
  .on("error", () => process.exit(1));
