import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '../lib/api-config';

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequestId: number;
  onRatingSubmitted: () => void;
}

export default function RatingPopup({ 
  isOpen, 
  onClose, 
  serviceRequestId, 
  onRatingSubmitted 
}: RatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoverRating: number) => {
    setHoveredRating(hoverRating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma avaliação de 1 a 5 estrelas.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/service/${serviceRequestId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null
        })
      });

      if (response.ok) {
        toast({
          title: "Avaliação enviada!",
          description: "Obrigado por avaliar o serviço. Sua opinião é muito importante para nós.",
        });
        onRatingSubmitted();
        onClose();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao enviar avaliação",
          description: errorData.error || "Não foi possível enviar sua avaliação. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast({
        title: "Erro de conexão",
        description: "Erro de conexão ao enviar avaliação. Verifique sua internet e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Avaliar Serviço
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 text-center">
            Como você avalia o serviço prestado pelo profissional?
          </p>

          {/* Rating Stars */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  disabled={isSubmitting}
                  className="transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    size={40}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Rating Text */}
          {rating > 0 && (
            <div className="text-center mb-6">
              <p className="text-lg font-medium text-gray-800">
                {rating === 1 && 'Péssimo'}
                {rating === 2 && 'Ruim'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bom'}
                {rating === 5 && 'Excelente'}
              </p>
              <p className="text-sm text-gray-500">
                {rating} {rating === 1 ? 'estrela' : 'estrelas'}
              </p>
            </div>
          )}

          {/* Comment Input */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comentário (opcional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos sobre sua experiência com o serviço..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-24 disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Enviar Avaliação</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
