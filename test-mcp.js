const { Server } = require("@modelcontextprotocol/sdk/server");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio");

const server = new Server({
  name: "test",
  version: "1.0.0"
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();