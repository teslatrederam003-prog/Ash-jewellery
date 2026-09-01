import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Send, CheckCircle2, ExternalLink } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const googleMapsUrl =
    'https://www.google.com/maps/place/16.710121,74.453112/data=!4m6!3m5!1s0!7e2!8m2!3d16.710121!4d74.45311199999999!18m1!1e1?entry=gps&coh=192189&g_ep=CAESBzI2LjI5LjIYACDl7Q0qnwEsOTQyNjc3MjcsOTQyOTIxOTUsOTQyOTk1MzIsMTAwNzk2NDk4LDEwMDc5Nzc2MSwxMDA3OTY1MzUsOTQyODA1NzYsOTQyMDczOTQsOTQyMDc1MDYsOTQyMDg1MDYsOTQyMTg2NTMsOTQyMjk4MzksOTQyNzUxNjgsOTQyNzk2MTksMTAwODE1NjM1LDEwMDgyMDIzNywxMDA4MjI0OTRCAklO&skid=d3660f4e-dbe6-4acb-9268-b7ff6674f7fc';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Ash Jewellery! My name is ${name} (${phone || 'N/A'}). Inquiry: ${message}`
  );
  const whatsappUrl = `https://wa.me/918208810579?text=${whatsappMessage}`;

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
          <div className="bg-white border-2 border-[#D4A017] rounded-sm p-6 sm:p-8 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#9B1C2F]">
                Store & Customer Care
              </h2>

              <div className="space-y-5 text-xs text-[#2A1810]">
                {/* Address with Google Maps */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center shrink-0 border-2 border-[#D4A017]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-bold uppercase tracking-wider text-[#9B1C2F]">Workshop & Boutique Address</h3>
                    <p className="text-[#2A1810] leading-relaxed font-semibold">
                      Ash Jewellery, Ganeshnagar Line No. 4, Near Maruti Mandir, Bajiprabhu Path Sastha Jawal, Ichalkaranji, Tal- Hatkangale, Dist- Kolhapur, Pin Code - 416115
                    </p>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B1C2F] hover:text-[#7A1522] underline underline-offset-2 pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View on Google Maps</span>
                    </a>
                  </div>
                </div>

                {/* Phone & Helpline */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBEFCB] text-[#9B1C2F] flex items-center justify-center shrink-0 border-2 border-[#D4A017]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold uppercase tracking-wider text-[#9B1C2F]">Phone & WhatsApp</h3>
                    <a
                      href="tel:+918208810579"
                      className="text-sm font-bold text-[#2A1810] hover:text-[#9B1C2F] block tracking-wide"
                    >
                      +91 82088 10579
                    </a>
                    <p className="text-[11px] text-[#7A6A5C]">
                      Available for calls and instant WhatsApp messaging.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="pt-6 border-t border-[#EFE1C8]">
              <a
                href="https://wa.me/918208810579?text=Hi%20Ash%20Jewellery,%20I%20have%20a%20general%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-sm bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider border-b-2 border-emerald-500 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Direct on WhatsApp (+91 82088 10579)</span>
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
                  <label className="block font-bold uppercase tracking-wider text-[#2A1810] mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 82088 10579"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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

