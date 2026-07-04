export async function sendSms(to: string, message: string) {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  if (!apiKey || !username) {
    console.warn("Africa's Talking credentials not configured");
    return { success: false };
  }

  const formData = new URLSearchParams({ username, to, message });
  if (process.env.AT_SENDER_ID) {
    formData.set("from", process.env.AT_SENDER_ID);
  }

  try {
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body: formData.toString(),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return { success: false, error: "Failed to send SMS" };
  }
}
