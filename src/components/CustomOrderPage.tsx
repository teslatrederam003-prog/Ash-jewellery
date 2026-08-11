import React, { useState } from 'react';
import { Sparkles, MessageCircle, CheckCircle2, Heart, ShieldCheck } from 'lucide-react';
import { createCustomInquiry } from '../services/dbService';

export const CustomOrderPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [occasion, setOccasion] = useState('Bridal / Wedding');
  const [budget, setBudget] = useState('₹3,000 - ₹5,000');
  const [details, setDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !details) return;

    try {
      setLoading(true);
      const res = await createCustomInquiry({
        name,
        phone,
        occasion,
        budget,
        details,
      });
      setInquiryId(res.id);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit custom inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Ash Jewellery! I submitted a Custom Order Inquiry (${occasion}, Budget: ${budget}). My name is ${name}. Details: ${details}`
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappMessage}`;

  return (
    <div className="py-12 bg-[#FFF8EC] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBEFCB] text-[#9B1C2F] text-xs font-bold border border-[#D4A017] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Handcrafted In-House Customization</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2A1810]">
            Custom Bridal & Statement Jewellery
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A5C] mt-3 leading-relaxed">
            Have a dream bridal necklace or matching outfit set in mind? Share your requirements with our master artisans and we will handcraft it for your special day.
          </p>
        </div>

        {submitted ? (
          /* Submission Success View */
          <div className="bg-white border-2 border-[#D4A017] rounded-3xl p-8 sm:p-12 text-center shadow-lg max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#2A1810]">Inquiry Received!</h2>
            <p className="text-xs text-[#7A6A5C] mt-2 leading-relaxed">
              Thank you, <strong>{name}</strong>. Your custom order request has been saved securely to our system.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-[#FFF8EC] border border-[#EFE1C8] text-xs text-[#2A1810] text-left space-y-1">
              <p><strong>Occasion:</strong> {occasion}</p>
              <p><strong>Estimated Budget:</strong> {budget}</p>
              <p><strong>Phone:</strong> {phone}</p>
            </div>

            <div className="mt-8 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Message Us on WhatsApp Now</span>
              </a>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setPhone('');
                  setDetails('');
                }}
                className="text-xs text-[#7A6A5C] hover:text-[#9B1C2F] underline cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="bg-white border border-[#EFE1C8] rounded-3xl p-6 sm:p-10 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Roy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">Occasion / Event</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017] cursor-pointer"
                  >
                    <option value="Bridal / Wedding">Bridal / Wedding</option>
                    <option value="Sangeet / Mehendi">Sangeet / Mehendi</option>
                    <option value="Festive Celebration">Festive Celebration</option>
                    <option value="Party Wear">Party Wear</option>
                    <option value="Gift Order">Gift Order</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">Target Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017] cursor-pointer"
                  >
                    <option value="Under ₹2,000">Under ₹2,000</option>
                    <option value="₹2,000 - ₹5,000">₹2,000 - ₹5,000</option>
                    <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000</option>
                    <option value="Above ₹10,000">Above ₹10,000</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#2A1810] mb-1">
                    Describe Your Design / Outfit Color / Requirements *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="e.g. Looking for a Kundan choker necklace set with maroon stones to match a red lehenga..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017]"
                  />
                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-full bg-[#9B1C2F] hover:bg-[#7A1522] text-[#FFF8EC] font-semibold text-xs sm:text-sm border-2 border-[#D4A017] shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  loading ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <span>Submit Custom Order Inquiry</span>
                )}
              </button>

              <div className="text-[11px] text-[#7A6A5C] text-center flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4A017]" />
                <span>Our jewellery designers will review and respond on WhatsApp within 24 hours.</span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
