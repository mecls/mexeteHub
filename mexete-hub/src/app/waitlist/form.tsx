"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { useRef, useState } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { submitWaitlistForm } from "./action";
import { formSchema } from "./schema";

type FormValues = z.infer<typeof formSchema>;

export function WaitlistForm() {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage("");
    
    try {
      const formData = new FormData(event.currentTarget);
      const result = await submitWaitlistForm(formData);
      setMessage(result.message);
      if (result.message === "Message sent successfully!") {
        form.reset();
      }
    } catch {
      setMessage("Failed to submit form. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="space-y-2 text-center">

        {message && (
          <div className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            {message}
          </div>
        )}
      </div>

      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: ControllerRenderProps<FormValues, "email"> }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground items-center justify-center">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="sr-only">
                  Your email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending..." : "Join the Waitlist"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
