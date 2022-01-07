import { EmployeeRating } from './employee-rating';

// dealer review
export interface DealerReview {
  text: string;
  stars: number;
  employeeRatings: EmployeeRating[];
  positivityScore: number;
}

export const superlatives = [
  /best/gi,
  /awesome/gi,
  /wonderful/gi,
  /great/gi,
  /above and beyond/gi,
  /impressed/gi,
  /attentive/gi,
  /personable/gi,
  /impeccable/gi,
];

// return number of superlatives + number of employees mentioned
export const calculateDealerReviewPositivyScore = (review: DealerReview) =>
  superlatives
    .map(s => [...review.text.matchAll(s)].length)
    .reduce((p, c) => p + c) +
  review.employeeRatings.filter(r => r.rating === 5).length;
