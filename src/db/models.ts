import mongoose, { Schema, model, models } from 'mongoose';

const serviceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  order: { type: Number, required: true },
});

const caseStudySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
});

const partnerSchema = new Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  order: { type: Number, required: true },
  description: { type: String, required: true },
  website: { type: String },
  isActive: { type: Boolean, default: true, required: true },
});

const jobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  location: { type: String, required: true },
  isActive: { type: Boolean, default: true, required: true },
});

const blogPostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now, required: true },
  isPublished: { type: Boolean, default: false, required: true },
  thumbnail: { type: String },
  excerpt: { type: String },
  category: { type: String },
});

const contactSubmissionSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const clientSchema = new Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  order: { type: Number, required: true },
  description: { type: String },
  website: { type: String },
});

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: "admin", required: true },
});

export const Service = models.Service || model('Service', serviceSchema);
export const CaseStudy = models.CaseStudy || model('CaseStudy', caseStudySchema);
export const Partner = models.Partner || model('Partner', partnerSchema);
export const Job = models.Job || model('Job', jobSchema);
export const BlogPost = models.BlogPost || model('BlogPost', blogPostSchema);
export const ContactSubmission = models.ContactSubmission || model('ContactSubmission', contactSubmissionSchema);
export const Client = models.Client || model('Client', clientSchema);
export const User = models.User || model('User', userSchema); 