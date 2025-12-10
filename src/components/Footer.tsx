import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-semibold text-primary">
              Edmund Lungi's
            </h3>
            <p className="text-cream/70 leading-relaxed">
              Premium handcrafted lungis for the modern gentleman. Comfort meets tradition.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-cream/10 rounded-full hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-cream/10 rounded-full hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-cream/10 rounded-full hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {["Shop", "About Us", "Contact", "FAQ"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(" ", "-")}`}
                    className="text-cream/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Collections</h4>
            <ul className="space-y-3">
              {["Silk Collection", "Cotton Comfort", "Premium Range", "Designer Prints"].map((link) => (
                <li key={link}>
                  <Link
                    to="/shop"
                    className="text-cream/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-cream/70">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span>123 Textile Street, Chennai, India</span>
              </li>
              <li className="flex items-center gap-3 text-cream/70">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-cream/70">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>hello@edmundlungi.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 text-center text-cream/50">
          <p>© 2024 Edmund Lungi's. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
