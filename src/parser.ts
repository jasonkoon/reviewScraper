import { AxiosInstance } from 'axios';
import cheerio, { Cheerio, CheerioAPI, Element } from 'cheerio';
import {
  calculateDealerReviewPositivyScore,
  DealerReview
} from './model/dealer-review';
import { EmployeeRating } from './model/employee-rating';
import { getContent } from './scraper';

export const EMPLOYEE_REVIEW_SELECTOR = '.employees-wrapper .review-employee';
export const NEXT_LINK_SELECTOR = '.next a';
export const BODY_SELECTOR = '.review-whole';
export const TITLE_SELECTOR = '.review-title';
export const DEALER_RATING_SELECTOR = '.rating-static.visible-xs';
export const REVIEW_WRAPPER_SELECTOR = '.review-entry';

export const getDealerReviews: (
  url: string,
  dealerPage: string,
  dealerReviews: DealerReview[],
  pages: number,
  axios: AxiosInstance,
  parseFunctions: any
) => Promise<DealerReview[]> = async (
  url: string,
  dealerPage: string,
  dealerReviews: DealerReview[],
  pages: number,
  axios: AxiosInstance,
  parseFunctions: any
) => {
  if (pages < 1 || dealerPage === undefined) return dealerReviews;

  const content = await getContent({ url: url + dealerPage, axios });
  const cheerioAPI = cheerio.load(content);
  const reviewWrappers = cheerioAPI(REVIEW_WRAPPER_SELECTOR);

  const reviews = [
    ...dealerReviews,
    ...parseFunctions.parseDealerReviews(
      cheerioAPI,
      reviewWrappers,
      parseFunctions
    ),
  ];

  const nextUrl = parseFunctions.parseNextLink(cheerioAPI);

  return parseFunctions.getDealerReviews(
    url,
    nextUrl,
    reviews,
    pages - 1,
    axios,
    parseFunctions
  );
};

export const parseDealerReviews = (
  cheerioAPI: CheerioAPI,
  reviewWrappers: Cheerio<Element>,
  parseFunctions: any
) => {
  return reviewWrappers
    .map((i, el) => {
      const title = cheerioAPI(el).find(TITLE_SELECTOR).text();
      const body = cheerioAPI(el).find(BODY_SELECTOR).text();
      const text = `${title} ${body}`;
      const rating = cheerioAPI(el)
        .find(DEALER_RATING_SELECTOR)
        .attr()
        .class.split(' ')
        .filter(c => c.startsWith('rating-') && c !== 'rating-static')[0]
        .replace('rating-', '');
      const stars = Number.parseInt(rating) / 10;

      const employeeRatings = parseFunctions.parseEmployeeReviews(
        cheerioAPI,
        cheerioAPI(el).find(EMPLOYEE_REVIEW_SELECTOR)
      );

      const review = { text, stars, employeeRatings } as DealerReview;
      review.positivityScore = calculateDealerReviewPositivyScore(review);
      return review;
    })
    .toArray();
};

export const parseNextLink = (cheerioAPI: CheerioAPI) => {
  const href = cheerioAPI(NEXT_LINK_SELECTOR)?.first()?.attr()?.href;
  return href;
};

export const parseEmployeeReviews = (
  cheerioAPI: CheerioAPI,
  element: Cheerio<Element>
) => {
  return element
    .map((i, el) => {
      const name = cheerioAPI(el).find('a').html()?.trim() || '';
      const rating = Number.parseFloat(
        cheerioAPI(el).find('.employee-rating-badge-sm').find('span').text()
      );

      return { name, rating } as EmployeeRating;
    })
    .toArray();
};

export const parseFunctions = {
  getDealerReviews,
  parseDealerReviews,
  parseNextLink,
  parseEmployeeReviews,
};
