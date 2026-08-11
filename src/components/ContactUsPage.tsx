import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Ash Jewellery! My name is ${name}. Inquiry: ${message}`
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappMessage}`;

  return (
    <div className="py-12 bg-[#FFF8EC] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            We'd Love to Hear From You
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1810] mt-1">
            Contact Ash Jewellery
          </h1>
          <p className="text-xs font-medium text-[#7A6A5C] mt-2">
            Have a question about product details, shipping times, or custom bridal orders? Reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Info Card */}
          <div className="bg-white border-2 border-[#D4A017] rounded-sm p-6 sm:p-8 shadow-md space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#9B1C2F]">
              Store & Customer Care
            </h2>

            <div className="space-y-4 text-xs text-[#2A1810]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center shrink-0 border-2 border-[#D4A017]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wider">Boutique Address</h3>
                  <p className="text-[#7A6A5C] mt-0.5 leading-relaxed font-medium">
                    102 Jewellery Plaza, Near Central Market, New Delhi - 110001, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center shrink-0 border-2 border-[#D4A017]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wider">Phone & Helpline</h3>
                  <p className="text-[#7A6A5C] mt-0.5 font-medium">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center shrink-0 border-2 border-[#D4A017]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wider">Email Support</h3>
                  <p className="text-[#7A6A5C] mt-0.5 font-medium">support@ashjewellery.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center shrink-0 border-2 border-[#D4A017]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wider">Business Hours</h3>
                  <p className="text-[#7A6A5C] mt-0.5 font-medium">Monday - Saturday: 10:00 AM - 8:00 PM IST</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="pt-4 border-t border-[#EFE1C8]">
              <a
                href="https://wa.me/919876543210?text=Hi%20Ash%20Jewellery,%20I%20have%20a%20general%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-sm bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider border-b-2 border-emerald-500 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Direct on WhatsApp (+91 98765 43210)</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-[#EFE1C8] rounded-sm p-6 sm:p-8 shadow-2xs">
            {sent ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#2A1810]">Message Sent!</h3>
                <p className="text-xs font-medium text-[#7A6A5C]">
                  Thank you for reaching out. You can also chat with us on WhatsApp for faster response.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider border-b-2 border-emerald-500 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Chat</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h2 className="font-serif text-xl font-bold text-[#2A1810] border-b border-[#EFE1C8] pb-2 uppercase tracking-wider">
                  Send a Message
                </h2>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your query or question here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white font-bold text-xs uppercase tracking-wider border-b-2 border-[#D4A017] shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#F0C75E]" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
