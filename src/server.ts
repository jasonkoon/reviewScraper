import axios from 'axios';
import { getDealerReviews, parseFunctions } from './parser';

(async () => {
  const rootUrl = process.env.URL;
  const dealer = process.env.DEALER;

  if (!rootUrl) {
    throw new Error('Invalid url from environment');
  }
  if (!dealer) {
    throw new Error('Invalid dealer from environment');
  }

  const reviews = (
    await getDealerReviews(rootUrl, dealer, [], 3, axios, parseFunctions)
  )
    .filter(r => r.stars === 5)
    .sort((a, b) => b.positivityScore - a.positivityScore);

  const top = reviews.length >= 3 ? reviews.slice(0, 3) : reviews;

  console.log('Most positive reviews');
  top.forEach((review, i) =>
    console.log(`${i}: ${review.positivityScore} - ${review.text}`)
  );
})();
