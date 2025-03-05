import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(3, { message: "Description must be at least 3 characters" }),
  image: z.string().url({ message: "Invalid URL" }),
  order: z.number().int().positive({ message: "Order must be a positive integer" }),
});

export const caseStudySchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const partnerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  logo: z.string().url({ message: "Invalid URL" }),
  order: z.number().int().positive({ message: "Order must be a positive integer" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  website: z.string().url({ message: "Invalid URL" }).optional(),
  isActive: z.boolean().default(true),
});

export const jobSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  requirements: z.string().min(10, { message: "Requirements must be at least 10 characters" }),
  location: z.string().min(3, { message: "Location must be at least 3 characters" }),
  isActive: z.boolean().default(true),
});

export const blogPostSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  author: z.string().min(3, { message: "Author must be at least 3 characters" }),
  publishedAt: z.date().optional(),
  isPublished: z.boolean().default(false),
  thumbnail: z.string().url({ message: "Invalid URL" }).optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
});

export const contactSubmissionSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  createdAt: z.date().optional(),
});

export const clientSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  logo: z.string().url({ message: "Invalid URL" }),
  order: z.number().int().positive({ message: "Order must be a positive integer" }),
  description: z.string().optional(),
  website: z.string().url({ message: "Invalid URL" }).optional(),
});

export const adminSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.string().default("admin"),
}); 