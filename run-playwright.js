const { exec } = require("child_process");

process.stdin.setEncoding("utf8");

let buffer = "";

/**
 * Safe JSON parse for stream chunks
 */
process.stdin.on("data", (chunk) => {
  buffer += chunk;

  try {
    const request = JSON.parse(buffer);
    buffer = "";

    handleRequest(request);
  } catch (e) {
    // wait for full JSON chunk
  }
});

function send(id, result) {
  process.stdout.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id,
      result
    }) + "\n"
  );
}

function sendError(id, message) {
  process.stdout.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message
      }
    }) + "\n"
  );
}

function handleRequest(req) {
  const id = req.id ?? 1;

  // =========================
  // tools/list
  // =========================
  if (req.method === "tools/list") {
    return send(id, {
      tools: [
        {
          name: "run_playwright",
          description: "Run Playwright tests",
          input_schema: {
            type: "object",
            properties: {}
          }
        }
      ]
    });
  }

  // =========================
  // tools/call
  // =========================
  if (req.method === "tools/call") {

  // ✅ ADD ENV CONFIG HERE (SAFE PLACE)
  const baseUrl = process.env.BASE_URL;
  const adminUrl = process.env.ADMIN_URL;
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  exec("npx playwright test --reporter=json", (error, stdout, stderr) => {

    let output;

    try {
      output = JSON.parse(stdout);
    } catch (e) {
      output = {
        raw: stdout,
        error: "Playwright output is not valid JSON"
      };
    }

    send(id, {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: !error,
            data: output,

            // ✅ ADD ENV DEBUG INFO (VERY USEFUL FOR QA)
            context: {
              baseUrl,
              adminUrl,
              user
              // ❌ never return password in real production
            },

            error: error ? stderr || error.message : null
          })
        }
      ]
    });
  });

  return;
}

  // =========================
  // fallback
  // =========================
  sendError(id, "Unknown method: " + req.method);
}

// keep process alive
process.stdin.resume();