import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationAPI } from '../../services/api';
import { Star, CheckCircle2, ArrowLeft, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

export default function ReviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await applicationAPI.getById(applicationId);
        if (res.data.success) {
          setApp(res.data.application);
        }
      } catch (err) {
        console.error('[ReviewPage Load Error]:', err);
        setError(err.message || 'Failed to load application details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [applicationId]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setSubmitError('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }

    setSelectedImage(file);
    setSubmitError('');

    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result || '');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setSubmitError('Please select a star rating.'); return; }
    if (!comment.trim()) { setSubmitError('Please write a comment.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('comment', comment.trim());
      if (selectedImage) {
        formData.append('completionImage', selectedImage);
      }

      const res = await applicationAPI.createReview(applicationId, formData);
      if (res.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center max-w-sm space-y-4 shadow-xs">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="font-editorial text-2xl font-bold text-[#16382B]">Error</h2>
          <p className="text-slate-600 text-sm">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary text-sm py-2.5 px-5 w-full">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center max-w-sm space-y-5 shadow-xs">
          <div className="w-16 h-16 bg-[#E6ECE7] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[#16382B]" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-[#16382B]">Review Submitted!</h2>
          <p className="text-slate-600 text-sm">Thank you for your feedback. This helps build trust in our community.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/opportunities/my')} className="btn-primary text-sm py-3 px-6">
              My Opportunities
            </button>
            <button onClick={() => navigate('/opportunities')} className="btn-secondary text-sm py-3 px-5">
              Browse More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#16382B] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-3xl border border-[#E2E7E3] p-8 shadow-xs space-y-8">

          <div className="space-y-2">
            <span className="badge-terracotta text-xs uppercase tracking-wider">Leave a Review</span>
            <h1 className="font-editorial text-3xl font-bold text-[#16382B]">
              Rate {app?.providerId?.name || 'the Provider'}
            </h1>
            {app?.opportunityId?.title && (
              <p className="text-[#C86D51] font-bold text-xs uppercase tracking-wider">
                For Task: {app.opportunityId.title}
              </p>
            )}
            <p className="text-slate-600 text-sm">
              Your honest review helps other customers make informed decisions and rewards great providers.
            </p>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {submitError}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Star Rating */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#16382B]">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-[#C07A46] text-[#C07A46]'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm font-semibold text-[#C07A46]">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#16382B]">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Describe the quality of work, punctuality, communication, and overall experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="input-editorial resize-none"
                required
              />
              <p className="text-xs text-slate-400">{comment.length} / 500 characters</p>
            </div>

            {/* Completion Image */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#16382B]">Completion Image</label>
              <label className="flex items-center justify-center gap-2 w-full border border-dashed border-[#D2DDD5] rounded-2xl bg-[#FAFAF8] px-4 py-4 cursor-pointer text-sm text-slate-600 hover:border-[#16382B] transition-colors">
                <Upload className="w-4 h-4" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="rounded-2xl border border-[#E2E7E3] bg-[#FAFAF8] p-3">
                  <img src={imagePreview} alt="Completion preview" className="w-full max-h-64 object-cover rounded-xl" />
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting || rating === 0} className="btn-primary w-full py-4 text-sm">
              <Star className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>

          </form>
        </div>

        {/* Trust reminder */}
        <div className="bg-[#E6ECE7] rounded-2xl border border-[#D2DDD5] p-5 text-sm text-slate-600 space-y-1.5">
          <p className="font-semibold text-[#16382B]">Why reviews matter</p>
          <p>Reviews directly update the provider's trust rating and help SilverHands' community stay safe and reliable.</p>
        </div>

      </div>
    </div>
  );
}
