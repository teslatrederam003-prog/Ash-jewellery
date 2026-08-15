import React, { useState, useRef } from 'react';
import {
  Sparkles,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  X,
  Camera,
  Eye,
  Plus,
  Loader2,
} from 'lucide-react';
import { createCustomInquiry, uploadMediaFile } from '../services/dbService';

export const CustomOrderPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [occasion, setOccasion] = useState('Bridal / Wedding');
  const [budget, setBudget] = useState('₹3,000 - ₹5,000');
  const [details, setDetails] = useState('');

  // Reference photos state
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const fileArray = Array.from(files).slice(0, 3 - referenceImages.length);
      const newUrls: string[] = [];

      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          setUploadError('Please select valid image files (JPG, PNG, WEBP).');
          continue;
        }
        const url = await uploadMediaFile(file, 'custom_inquiries');
        if (url) {
          newUrls.push(url);
        }
      }

      if (newUrls.length > 0) {
        setReferenceImages((prev) => [...prev, ...newUrls].slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      setUploadError('Failed to upload image. Please try another photo or enter details.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setReferenceImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

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
        referenceImageUrl: referenceImages[0] || '',
        referenceImages: referenceImages,
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
    `Hello Ash Jewellery! I submitted a Custom Order Inquiry (${occasion}, Budget: ${budget}). My name is ${name}. Details: ${details}${
      referenceImages.length > 0
        ? ` (I have attached ${referenceImages.length} reference photo${referenceImages.length > 1 ? 's' : ''})`
        : ''
    }`
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
            Have a dream bridal necklace or matching outfit in mind? Share your requirements along with reference photos of your outfit or jewellery inspiration, and our artisans will handcraft it for you.
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

            <div className="mt-6 p-4 rounded-2xl bg-[#FFF8EC] border border-[#EFE1C8] text-xs text-[#2A1810] text-left space-y-2">
              <p><strong>Occasion:</strong> {occasion}</p>
              <p><strong>Estimated Budget:</strong> {budget}</p>
              <p><strong>Phone:</strong> {phone}</p>
              {referenceImages.length > 0 && (
                <div className="pt-2 border-t border-[#EFE1C8]">
                  <p className="font-bold text-[#2A1810] mb-1.5 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span>Attached Reference Photos ({referenceImages.length}):</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {referenceImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-lg border-2 border-[#D4A017] overflow-hidden bg-white shadow-xs cursor-pointer group"
                        onClick={() => setPreviewModalImg(imgUrl)}
                      >
                        <img
                          src={imgUrl}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-[#2A1810]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 min-h-[44px] rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                  setReferenceImages([]);
                }}
                className="text-xs text-[#7A6A5C] hover:text-[#9B1C2F] underline cursor-pointer py-1"
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
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017] text-[#2A1810]"
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
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017] text-[#2A1810]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">Occasion / Event</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017] cursor-pointer text-[#2A1810]"
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
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017] cursor-pointer text-[#2A1810]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE1C8] bg-[#FFF8EC] focus:outline-hidden focus:border-[#D4A017] text-[#2A1810]"
                  />
                </div>

                {/* Reference Photo Upload Section */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-[#2A1810] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#D4A017]" />
                      <span>Attach Reference Photos (Outfit, Jewellery Inspiration, Neckline)</span>
                    </label>
                    <span className="text-[11px] text-[#7A6A5C] font-medium">
                      Optional • Up to 3 photos
                    </span>
                  </div>

                  {/* Dropzone & Upload Box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (referenceImages.length < 3 && !isUploadingImage) {
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-[#9B1C2F] bg-[#FFF0DF]'
                        : 'border-[#D4A017]/60 bg-[#FFF8EC]/60 hover:bg-[#FFF8EC] hover:border-[#D4A017]'
                    } ${referenceImages.length >= 3 ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileUpload(e.target.files);
                          e.target.value = '';
                        }
                      }}
                      disabled={referenceImages.length >= 3 || isUploadingImage}
                    />

                    {isUploadingImage ? (
                      <div className="py-3 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-7 h-7 text-[#9B1C2F] animate-spin" />
                        <p className="text-xs font-bold text-[#9B1C2F]">Processing & Uploading photo...</p>
                        <p className="text-[11px] text-[#7A6A5C]">Compressing image for fast loading</p>
                      </div>
                    ) : (
                      <div className="py-2 flex flex-col items-center justify-center gap-1.5">
                        <div className="w-11 h-11 rounded-full bg-[#FBEFCB] text-[#9B1C2F] border border-[#D4A017] flex items-center justify-center shadow-xs">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-[#2A1810] text-xs mt-1">
                          Click to upload or drag & drop reference image
                        </p>
                        <p className="text-[11px] text-[#7A6A5C]">
                          PNG, JPG, WEBP • Outfit photos, sketches, or bridal designs
                        </p>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                      {uploadError}
                    </p>
                  )}

                  {/* Uploaded Thumbnails Preview */}
                  {referenceImages.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-[#7A6A5C] uppercase tracking-wider mb-2">
                        Uploaded Photos ({referenceImages.length}/3):
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {referenceImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl border-2 border-[#D4A017] overflow-hidden bg-white shadow-xs aspect-square"
                          >
                            <img
                              src={imgUrl}
                              alt={`Reference ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-[#2A1810]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewModalImg(imgUrl);
                                }}
                                className="p-1.5 rounded-full bg-white text-[#2A1810] hover:text-[#9B1C2F] shadow-sm cursor-pointer"
                                title="View Fullsize"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(idx);
                                }}
                                className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Badge */}
                            <span className="absolute bottom-1 left-1 bg-[#2A1810]/80 text-[#FFF8EC] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                              Photo #{idx + 1}
                            </span>
                          </div>
                        ))}

                        {/* Add more slot if less than 3 */}
                        {referenceImages.length < 3 && !isUploadingImage && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#EFE1C8] hover:border-[#D4A017] rounded-xl flex flex-col items-center justify-center gap-1 bg-[#FFF8EC]/40 hover:bg-[#FFF8EC] transition-colors cursor-pointer aspect-square text-[#7A6A5C] hover:text-[#9B1C2F]"
                          >
                            <Plus className="w-5 h-5 text-[#D4A017]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Add More</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              <button
                type="submit"
                disabled={loading || isUploadingImage}
                className={`w-full py-3.5 min-h-[48px] rounded-full bg-[#9B1C2F] hover:bg-[#7A1522] text-[#FFF8EC] font-semibold text-xs sm:text-sm border-2 border-[#D4A017] shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  loading || isUploadingImage ? 'opacity-70 cursor-wait' : ''
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
                <span>Our jewellery designers will review your design requirements and WhatsApp you within 24 hours.</span>
              </div>
            </form>
          </div>
        )}

        {/* Full Image Preview Modal */}
        {previewModalImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/80 backdrop-blur-xs">
            <div className="relative max-w-2xl w-full bg-white rounded-2xl p-4 overflow-hidden border-2 border-[#D4A017] shadow-2xl">
              <button
                onClick={() => setPreviewModalImg(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white border border-[#EFE1C8] text-[#2A1810] font-bold shadow-md cursor-pointer hover:text-[#9B1C2F]"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
              <p className="text-xs font-bold text-[#2A1810] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#D4A017]" />
                <span>Reference Photo Preview:</span>
              </p>
              <div className="bg-[#FFF8EC] rounded-xl p-2 border border-[#EFE1C8]">
                <img
                  src={previewModalImg}
                  alt="Reference Preview"
                  className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

