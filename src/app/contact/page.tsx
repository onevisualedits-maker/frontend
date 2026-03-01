
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, MessageSquare, Phone, Send, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().min(5, { message: "Please enter a subject" }),
  message: z.string().min(10, { message: "Tell me a bit more about your project" }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. I'll get back to you within 24 hours.",
    });
    form.reset();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8">
            Let's <span className="text-primary">Connect</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed">
            Have a project in mind? Looking for a collaboration? Or just want to say hi? My inbox is always open.
          </p>

          <div className="space-y-8">
            {[
              { icon: Mail, label: "Email", value: "contact@jeevaneditz.com", href: "mailto:contact@jeevaneditz.com" },
              { icon: Phone, label: "Phone / WhatsApp", value: "+1 (555) 000-EDITS", href: "tel:+15550000000" },
              { icon: MapPin, label: "Base", value: "London, UK / Remote Worldwide", href: "#" },
              { icon: MessageSquare, label: "Social", value: "@JeevanEditz", href: "#" }
            ].map((contact, i) => (
              <a
                key={i}
                href={contact.href}
                className="flex items-center gap-6 group hover:text-primary transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                  <contact.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-1">{contact.label}</p>
                  <p className="text-lg font-medium">{contact.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="glass-card p-10 rounded-[3rem] shadow-2xl relative border-primary/10">
          <div className="absolute top-0 right-0 p-8 text-primary/10 -z-10">
            <Send className="w-40 h-40" />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="glass-card border-white/10 h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Your Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} className="glass-card border-white/10 h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Project Inquiry" {...field} className="glass-card border-white/10 h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell me about your vision, timeline, and requirements..."
                        className="min-h-[160px] glass-card border-white/10 resize-none p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-14 text-lg font-bold lavender-gradient shadow-xl hover:shadow-primary/40 transition-shadow">
                Send Message <Send className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
