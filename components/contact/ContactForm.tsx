"use client";

import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sendContactMessage } from '@/app/actions/contact';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.subject) formData.append('subject', data.subject);
    formData.append('message', data.message);

    const result = await sendContactMessage(formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      (document.getElementById('contact-form') as HTMLFormElement | null)?.reset();
    } else {
      setError(result.error || 'Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="contact-form" className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            {...register('name')}
            className={errors.name
              ? "border-error-500 focus:border-error-500"
              : "border-border focus:border-primary-500"}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className={errors.email
              ? "border-error-500 focus:border-error-500"
              : "border-border focus:border-primary-500"}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Your phone number"
          {...register('phone')}
          className="border-border focus:border-primary-500"
        />
      </div>

      <div>
        <Label htmlFor="subject">Subject (optional)</Label>
        <Input
          id="subject"
          placeholder="How can we help you?"
          {...register('subject')}
          className="border-border focus:border-primary-500"
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us what you're looking for..."
          {...register('message')}
          className={errors.message
            ? "border-error-500 focus:border-error-500"
            : "border-border focus:border-primary-500"}
          minRows={5}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-error-500">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="w-full"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {isSuccess && (
        <div className="mt-4 p-4 bg-success-50 rounded-lg border border-success-200">
          <p className="text-success-700">
            Your message has been sent! We'll get back to you soon.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-error-50 rounded-lg border border-error-200">
          <p className="text-error-700">{error}</p>
        </div>
      )}
    </form>
  );
}