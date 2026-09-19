import React, { useState } from 'react';
import { X, Star, Heart, Sparkles, Send } from 'lucide-react';
import { CustomerOrder, CustomerReview } from '@/types/customer';

interface FeedbackModalProps {
  order: CustomerOrder | null;
  onClose: () => void;
  onSubmit: (review: CustomerReview) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ order, onClose, onSubmit }) => {
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [experienceRating, setExperienceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [likedDishes, setLikedDishes] = useState<Record<string, boolean>>({});

  if (!order) return null;

  const toggleDishLike = (dishId: string) => {
    setLikedDishes((prev) => ({
      ...prev,
      [dishId]: !prev[dishId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `rev-${Date.now()}`,
      orderId: order.id,
      foodRating,
      serviceRating,
      experienceRating,
      comment: comment.trim(),
      itemRatings: likedDishes,
      createdAt: new Date().toISOString(),
    });
  };

  const renderStarPicker = (current: number, setVal: (v: number) => void) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setVal(star)}
            className="p-1 hover:scale-125 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= current
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Rate Your Dining Experience</h3>
              <p className="text-[11px] text-slate-400">Order #{order.orderNumber} • {order.outletName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Star Rating Controls */}
          <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Food Taste & Quality</h4>
                <p className="text-[10px] text-slate-400">Authentic flavours & freshness</p>
              </div>
              {renderStarPicker(foodRating, setFoodRating)}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div>
                <h4 className="text-xs font-bold text-white">Service & Speed</h4>
                <p className="text-[10px] text-slate-400">Timeliness & hospitality</p>
              </div>
              {renderStarPicker(serviceRating, setServiceRating)}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div>
                <h4 className="text-xs font-bold text-white">Overall Dining Experience</h4>
                <p className="text-[10px] text-slate-400">Ambiance, packing & presentation</p>
              </div>
              {renderStarPicker(experienceRating, setExperienceRating)}
            </div>
          </div>

          {/* Dish-level Favorites / Compliments */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Which dishes won your heart?
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => {
                const isLoved = !!likedDishes[item.foodItem.id];
                return (
                  <div
                    key={item.cartItemId}
                    onClick={() => toggleDishLike(item.foodItem.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isLoved
                        ? 'bg-rose-500/15 border-rose-500/50 text-white'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.foodItem.imageUrl}
                        alt={item.foodItem.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <span className="text-xs font-semibold">{item.foodItem.name}</span>
                    </div>
                    <Heart
                      className={`w-4 h-4 ${
                        isLoved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comment Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Notes for the Chef & Restaurant
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you enjoyed most or what we can refine on your next visit..."
              className="w-full p-3 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Culinary Review</span>
          </button>
        </form>
      </div>
    </div>
  );
};
