import { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase";

const ContactPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const hasAppliedUserPrefillRef = useRef(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    if (!user) return;
    if (hasAppliedUserPrefillRef.current) return;

    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));

    hasAppliedUserPrefillRef.current = true;
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });

    void (async () => {
      try {
        const { error } = await supabase.from("messages").insert({
          sender_name: formData.name,
          sender_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          created_at: new Date().toISOString(),
          read_status: "unread",
        });
        if (error) {
          console.error("Failed to store contact message:", error);
        }
      } catch (err) {
        console.error("Failed to store contact message:", err);
      }
    })();

    setFormData({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: [
        <>
          <a
            href="https://www.facebook.com/share/1DmfPCWzYt/?mibextid=wwXIfr"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 underline"
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </a>
        </>,
        <>
          <a
            href="https://www.instagram.com/edmund_lungi?igsh=MTE3YWd1bHNoZnc3cw%3D%3D&utm_source=qr"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 underline"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
        </>,
        <>
          <a
            href="https://wa.me/916383329471"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 underline"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </>
      ]
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 63833 29471", "+91 90956 44521"]
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["edmundlungi@gmail.com"]
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Online only", "10:00 AM – 6:00 PM"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our products or need assistance? We'd love to hear from you. 
            Reach out and our team will respond promptly.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-secondary rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-primary gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold mb-6">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="bg-secondary rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="bg-secondary rounded-xl p-6 mt-8">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Map Integration Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
