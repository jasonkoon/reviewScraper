import {
  calculateDealerReviewPositivyScore,
  DealerReview
} from './dealer-review';

let dealerReview: DealerReview = {
  text: 'review text this dealer is the best Best BEST and i am wonderfully impressed',
  positivityScore: 0,
  stars: 5,
  employeeRatings: [
    { name: 'Doe, Jane', rating: 5 },
    { name: 'Doe, Janet', rating: 5 },
  ],
};
describe('dealerReview.ts', () => {
  describe('calculateDealerReviewPositivyScore', () => {
    it('should calculate positivity score', () => {
      const result = calculateDealerReviewPositivyScore(dealerReview);
      expect(result).toBe(7); // 5 superlatives and 2 employee mentions
    });

    it('should calculate positivity score when no employee ratings', () => {
      const review: DealerReview = {
        text: 'gReAt',
        stars: 5,
        employeeRatings: [],
        positivityScore: 0,
      };
      const result = calculateDealerReviewPositivyScore(review);
      expect(result).toBe(1);
    });
  });
});
