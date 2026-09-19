'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, MessageSquare, Send, Check } from 'lucide-react';

export function ReviewsView() {
  const { reviews, selectedPropertyId, replyToReview, showToast } = useERP();

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = reviews.filter(
    (r) => selectedPropertyId === 'all' || r.propertyId === selectedPropertyId
  );

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText);
    setSelectedReviewId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Guest Reviews & Reputation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated guest reviews from Google, Tripadvisor, Booking.com, Agoda, and Airbnb
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{rev.guestName}</h3>
                  <span className="text-xs font-bold text-amber-500 flex items-center">
                    {'★'.repeat(Math.floor(rev.rating))} {rev.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {rev.propertyName} • Reviewed on {rev.date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="xs">
                  {rev.platform}
                </Badge>
                <Badge status={rev.responseStatus} size="xs">
                  {rev.responseStatus}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl">
              "{rev.comment}"
            </p>

            {/* Published Response */}
            {rev.responseText && (
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900">One Directory Response:</span>
                  <span className="text-[10px] text-teal-600 font-medium">{rev.responseDate}</span>
                </div>
                <p className="text-teal-800">{rev.responseText}</p>
              </div>
            )}

            {/* Response Input Box */}
            {selectedReviewId === rev.id ? (
              <div className="pt-2 space-y-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write an official response on behalf of One Directory..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="xs" onClick={() => setSelectedReviewId(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    icon={<Send className="w-3 h-3" />}
                    onClick={() => handleSendReply(rev.id)}
                  >
                    Publish Reply
                  </Button>
                </div>
              </div>
            ) : (
              rev.responseStatus !== 'Responded' && (
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="xs"
                    icon={<MessageSquare className="w-3 h-3 text-teal-600" />}
                    onClick={() => {
                      setSelectedReviewId(rev.id);
                      setReplyText(`Dear ${rev.guestName}, thank you for your feedback regarding your stay at ${rev.propertyName}!`);
                    }}
                  >
                    Reply to Review
                  </Button>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
