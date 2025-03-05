import connectDB from "@/db/db";
import {
  Service,
  BlogPost,
  Job,
  ContactSubmission,
  Client,
  Partner,
  User,
} from "@/db/models";

async function seedTestData() {
  try {
    await connectDB();

    // Seed Services
    const services = [
      {
        title: "Custom Software Development",
        description: "Tailored software solutions to meet your business needs.",
        image: "https://example.com/images/service1.jpg",
        order: 1,
      },
      {
        title: "Software Testing & QA",
        description: "Comprehensive testing services to ensure software quality.",
        image: "https://example.com/images/service2.jpg",
        order: 2,
      },
    ];
    await Service.insertMany(services);
    console.log("Services seeded successfully.");

    // Seed Blog Posts
    const blogPosts = [
      {
        title: "The Future of Software Development",
        content: "Exploring the latest trends in software development.",
        author: "John Doe",
        thumbnail: "https://example.com/images/blog1.jpg",
        excerpt: "A look into the future of software development.",
        category: "Technology",
      },
      {
        title: "Best Practices for Agile Development",
        content: "A guide to implementing agile development methodologies.",
        author: "Jane Smith",
        thumbnail: "https://example.com/images/blog2.jpg",
        excerpt: "Tips for successful agile development.",
        category: "Project Management",
      },
    ];
    await BlogPost.insertMany(blogPosts);
    console.log("Blog Posts seeded successfully.");

    // Seed Jobs
    const jobs = [
      {
        title: "Full Stack Developer",
        description: "Looking for a full stack developer with experience in React and Node.js.",
        requirements: "3+ years of experience, proficiency in JavaScript, React, Node.js.",
        location: "Remote",
      },
      {
        title: "QA Engineer",
        description: "Seeking a QA engineer to ensure the quality of our software products.",
        requirements: "2+ years of experience in software testing, knowledge of testing methodologies.",
        location: "New York, NY",
      },
    ];
    await Job.insertMany(jobs);
    console.log("Jobs seeded successfully.");

    // Seed Contact Submissions
    const contactSubmissions = [
      {
        name: "Alice Brown",
        email: "alice.brown@example.com",
        phone: "123-456-7890",
        message: "I am interested in your software development services.",
      },
      {
        name: "Bob Smith",
        email: "bob.smith@example.com",
        phone: "987-654-3210",
        message: "Can you provide more information about your training programs?",
      },
    ];
    await ContactSubmission.insertMany(contactSubmissions);
    console.log("Contact Submissions seeded successfully.");

    // Seed Clients
    const clients = [
      {
        name: "Acme Corp",
        logo: "https://example.com/logos/acme-corp.png",
        order: 1,
        description: "A leading provider of innovative solutions in the tech industry.",
        website: "https://acmecorp.com",
      },
      {
        name: "Beta LLC",
        logo: "https://example.com/logos/beta-llc.png",
        order: 2,
        description: "Specializing in software solutions for small businesses.",
        website: "https://betallc.com",
      },
    ];
    await Client.insertMany(clients);
    console.log("Clients seeded successfully.");

    // Seed Partners
    const partners = [
      {
        name: "Tech Innovations Inc.",
        logo: "https://example.com/logos/tech-innovations.png",
        order: 1,
        description: "A technology partner focused on innovation.",
        website: "https://techinnovations.com",
      },
      {
        name: "Global Solutions Ltd.",
        logo: "https://example.com/logos/global-solutions.png",
        order: 2,
        description: "Providing global solutions for complex problems.",
        website: "https://globalsolutions.com",
      },
    ];
    await Partner.insertMany(partners);
    console.log("Partners seeded successfully.");
  } catch (error) {
    console.error("Error seeding test data:", error);
  }
}

async function main() {
  await seedTestData();
}

main(); 


