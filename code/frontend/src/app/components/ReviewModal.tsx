import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderService: string;
  sellerName: string;
  onSubmit: (rating: number, comment: string) => void;
}

export function ReviewModal({ isOpen, onClose, orderService, sellerName, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, comment);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setRating(0);
        setComment('');
      }, 2000);
    }
  };

  const handleClose = () => {
    onClose();
    setIsSubmitted(false);
    setRating(0);
    setComment('');
    setHoverRating(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
        >
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="px-6 py-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Leave a Review</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      How was your experience with {sellerName}?
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Service Name */}
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Service</p>
                  <p className="font-semibold">{orderService}</p>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block mb-3 font-medium">
                    Rate your experience <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {rating === 5 && 'Excellent!'}
                      {rating === 4 && 'Great!'}
                      {rating === 3 && 'Good'}
                      {rating === 2 && 'Fair'}
                      {rating === 1 && 'Poor'}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block mb-2 font-medium">
                    Share your experience (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Tell others about your experience working with this seller..."
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {comment.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-accent/30 border-t border-border flex gap-3 justify-end">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className="min-w-32"
                >
                  Submit Review
                </Button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="px-6 py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                Your review has been submitted successfully
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
