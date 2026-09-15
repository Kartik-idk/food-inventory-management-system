import { recordWaste } from "./src/lib/actions";

async function testWaste() {
  const formData = new FormData();
  formData.append("batchId", "1"); // Assuming batch 1 exists
  formData.append("quantity", "9999"); // More than available
  formData.append("reason", "TEST");

  console.log("Testing over-waste...");
  const result = await recordWaste(formData);
  console.log("Result:", result);
}

testWaste();
