import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, Truck, MessageCircle, AlertCircle } from 'lucide-react';
import { Order, ActivePage } from '../types';
import { fetchCustomerOrders } from '../services/dbService';

interface MyOrdersPageProps {
  userEmail: string | null;
  setActivePage: (page: ActivePage) => void;
  onOpenAuth: () => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ userEmail, setActivePage, onOpenAuth }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    fetchCustomerOrders(userEmail)
      .then((data) => setOrders(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userEmail]);

  if (!userEmail) {
    return (
      <div className="py-16 bg-[#FFF8EC] min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border-2 border-[#D4A017] rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <Package className="w-12 h-12 text-[#9B1C2F] mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-bold text-[#2A1810]">Sign In to View Orders</h2>
          <p className="text-xs text-[#7A6A5C] mt-2">
            Please log in to track your past order status and view payment confirmation details.
          </p>
          <button
            onClick={onOpenAuth}
            className="mt-6 w-full py-3 rounded-full bg-[#9B1C2F] text-[#FFF8EC] font-semibold text-xs border border-[#D4A017] cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FFF8EC] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2A1810]">My Jewellery Orders</h1>
            <p className="text-xs text-[#7A6A5C] mt-1">Logged in as {userEmail}</p>
          </div>
          <button
            onClick={() => setActivePage('shop')}
            className="px-5 py-2.5 rounded-full bg-[#9B1C2F] text-[#FFF8EC] font-semibold text-xs border border-[#D4A017] shadow-xs cursor-pointer hover:bg-[#7A1522] self-start sm:self-auto"
          >
            Shop More Jewellery
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#9B1C2F] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-xs text-[#7A6A5C]">Fetching your order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#EFE1C8] rounded-3xl p-12 text-center max-w-md mx-auto my-8">
            <Package className="w-12 h-12 text-[#D4A017] mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#2A1810]">No Orders Placed Yet</h3>
            <p className="text-xs text-[#7A6A5C] mt-2">
              You haven't placed any orders with Ash Jewellery yet.
            </p>
            <button
              onClick={() => setActivePage('shop')}
              className="mt-6 px-6 py-2.5 rounded-full bg-[#9B1C2F] text-[#FFF8EC] text-xs font-semibold border border-[#D4A017] cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#EFE1C8] rounded-3xl p-6 shadow-2xs space-y-4 hover:border-[#D4A017] transition-colors"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE1C8] pb-4 text-xs">
                  <div>
                    <span className="text-[#7A6A5C]">Order ID:</span>{' '}
                    <strong className="text-[#9B1C2F] font-mono">#{order.id.slice(0, 10)}</strong>
                    <span className="text-[#7A6A5C] ml-3">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                        order.paymentStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.paymentStatus === 'Pending Verification'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>

                    {/* Order Status Pill */}
                    <span className="px-3 py-1 rounded-full font-bold text-[11px] bg-[#9B1C2F] text-[#FFF8EC] border border-[#D4A017]">
                      Status: {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#FFF8EC] p-3 rounded-2xl border border-[#EFE1C8]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-xl border border-[#EFE1C8] shrink-0"
                      />
                      <div className="min-w-0 text-xs">
                        <p className="font-semibold text-[#2A1810] truncate">{item.name}</p>
                        <p className="text-[#7A6A5C]">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-[#EFE1C8]">
                  <div className="text-[#7A6A5C]">
                    <span>Shipping To: </span>
                    <strong className="text-[#2A1810]">
                      {order.customerName}, {order.address}, {order.city} - {order.pincode}
                    </strong>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-serif font-bold text-base text-[#9B1C2F]">
                      Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>

                    <a
                      href={`https://wa.me/919876543210?text=Hi%20Ash%20Jewellery,%20checking%20status%20for%20Order%20%23${order.id.slice(
                        0,
                        8
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                      title="Ask on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
