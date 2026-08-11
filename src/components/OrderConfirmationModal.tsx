import React from 'react';
import { CheckCircle2, MessageCircle, Package, ArrowRight, X } from 'lucide-react';
import { Order, ActivePage } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  setActivePage: (page: ActivePage) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  setActivePage,
}) => {
  if (!order) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello Ash Jewellery! I have placed Order #${order.id.slice(0, 8)} for ₹${order.totalAmount.toLocaleString(
      'en-IN'
    )} (${order.paymentMethod}). Please confirm my order details!`
  );

  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border-2 border-[#D4A017] rounded-sm shadow-2xl p-6 sm:p-8 text-center my-8">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-sm bg-white border border-[#EFE1C8] text-[#2A1810] hover:text-[#9B1C2F] cursor-pointer font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-800 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <p className="text-xs font-bold text-[#D4A017] uppercase tracking-widest">
          Order Placed Successfully!
        </p>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1810] mt-1">
          Thank You, {order.customerName}!
        </h2>

        <p className="text-xs text-[#7A6A5C] mt-2">
          Your order ID is <strong className="text-[#9B1C2F]">#{order.id.slice(0, 10)}</strong>.
          We have received your order details and will dispatch it shortly.
        </p>

        {/* Order Details Summary Box */}
        <div className="mt-6 bg-[#FFF8EC] border border-[#EFE1C8] rounded-sm p-4 text-left text-xs space-y-2">
          <div className="flex justify-between border-b border-[#EFE1C8] pb-2">
            <span className="text-[#7A6A5C] font-semibold">Payment Method:</span>
            <span className="font-bold text-[#2A1810] uppercase tracking-wider">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between border-b border-[#EFE1C8] pb-2">
            <span className="text-[#7A6A5C] font-semibold">Payment Status:</span>
            <span
              className={`font-bold uppercase tracking-wider ${
                order.paymentStatus === 'Verified'
                  ? 'text-emerald-800'
                  : order.paymentStatus === 'Pending Verification'
                  ? 'text-amber-800'
                  : 'text-[#2A1810]'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>

          <div className="flex justify-between border-b border-[#EFE1C8] pb-2">
            <span className="text-[#7A6A5C] font-semibold">Total Payable:</span>
            <span className="font-bold font-serif text-[#9B1C2F] text-sm">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="pt-1">
            <span className="text-[#7A6A5C] font-semibold block mb-1">Delivering To:</span>
            <p className="font-bold text-[#2A1810]">
              {order.address}, {order.city} - {order.pincode}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-sm bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider border-b-2 border-emerald-500 shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Connect on WhatsApp for Order Updates</span>
          </a>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                setActivePage('my-orders');
              }}
              className="py-2.5 rounded-sm bg-[#FFF8EC] hover:bg-[#FBEFCB] text-[#2A1810] border border-[#EFE1C8] text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Package className="w-4 h-4 text-[#D4A017]" />
              <span>View My Orders</span>
            </button>

            <button
              onClick={() => {
                onClose();
                setActivePage('shop');
              }}
              className="py-2.5 rounded-sm bg-[#9B1C2F] hover:bg-[#7A1522] text-white border-b-2 border-[#D4A017] text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 text-[#F0C75E]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
