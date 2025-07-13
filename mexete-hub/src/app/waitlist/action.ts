import { formSchema } from "./schema";

export async function submitWaitlistForm(data: FormData): Promise<{ message: string }> {
  const formData = Object.fromEntries(data);
  const parsed = formSchema.safeParse(formData);

  if (!parsed.success) {
    return { message: "Invalid form data" };
  }

  try {
    const response = await fetch(
      "https://app.router.so/api/endpoints/v0nbd9zn",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ROUTER_API_KEY}`,
        },
        body: JSON.stringify(parsed.data),
      }
    );

    if (!response.ok) {
      return { message: "Failed to submit form" };
    }

    return { message: "Message sent successfully!" };
  } catch {
    return { message: "Failed to submit form. Please try again." };
  }
}
