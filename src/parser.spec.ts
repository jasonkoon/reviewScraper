import { AxiosInstance } from 'axios';
import cheerio, { CheerioAPI } from 'cheerio';
import {
  EMPLOYEE_REVIEW_SELECTOR,
  getDealerReviews,
  parseDealerReviews,
  parseEmployeeReviews,
  parseNextLink,
  REVIEW_WRAPPER_SELECTOR
} from './parser';

let cheerioAPI: CheerioAPI;
let parseFunctions: any;
let axios: AxiosInstance;
describe('parser.ts', () => {
  describe('parseEmployeeReviews', () => {
    it('should parse employeeReviews', () => {
      cheerioAPI = cheerio.load(exampleEmployeeReviewHtml);
      const reviews = parseEmployeeReviews(
        cheerioAPI,
        cheerioAPI(EMPLOYEE_REVIEW_SELECTOR)
      );
      expect(reviews.length).toBe(2);
      expect(reviews[0].name).toBe('Adrian "AyyDee" Cortes');
      expect(reviews[0].rating).toBe(5);
      expect(reviews[1].rating).toBe(4);
    });
    it('should parse empty reviews', () => {
      cheerioAPI = cheerio.load('<div></div>');
      const reviews = parseEmployeeReviews(
        cheerioAPI,
        cheerioAPI(EMPLOYEE_REVIEW_SELECTOR)
      );
      expect(reviews.length).toBe(0);
    });
  });

  describe('parseNextLink', () => {
    it('should parse parseNextLink', () => {
      cheerioAPI = cheerio.load(exampleNextLinkHtml);
      const link = parseNextLink(cheerioAPI);
      expect(link).toBe(
        '/dealer/McKaig-Chevrolet-Buick-A-Dealer-For-The-People-dealer-reviews-23685/page2/?filter=#link'
      );
    });
    it('should return null when no next link', () => {
      cheerioAPI = cheerio.load('<div></div>');
      const link = parseNextLink(cheerioAPI);
      expect(link).toBe(undefined);
    });
  });

  describe('parseDealerReviews', () => {
    beforeEach(() => {
      parseFunctions = { parseEmployeeReviews: jest.fn().mockReturnValue([]) };
    });
    it('should parse dealer reviews', () => {
      cheerioAPI = cheerio.load(exampleDealerReviewHtml);
      const reviews = parseDealerReviews(
        cheerioAPI,
        cheerioAPI(REVIEW_WRAPPER_SELECTOR),
        parseFunctions
      );
      expect(reviews.length).toBe(2);
      expect(reviews[0].text).toContain(
        'As a Single Mom and a Disabled Veteran'
      );
      expect(reviews[0].stars).toBe(5);
      expect(reviews[0].employeeRatings.length).toBe(0);
      expect(parseFunctions.parseEmployeeReviews).toHaveBeenCalled();
    });
    it('should return empty array when no reviews', () => {
      cheerioAPI = cheerio.load('<div></div>');
      const reviews = parseDealerReviews(
        cheerioAPI,
        cheerioAPI(REVIEW_WRAPPER_SELECTOR),
        parseFunctions
      );
      expect(reviews.length).toBe(0);
    });
  });

  describe('getDealerReviews', () => {
    beforeEach(() => {
      parseFunctions = {
        parseDealerReviews: jest.fn().mockReturnValue([]),
        parseNextLink: jest.fn().mockReturnValue('link2'),
        getDealerReviews: jest.fn().mockReturnValue([{}]),
      };
      axios = { get: jest.fn().mockResolvedValue({ data: 'content' }) } as any;
    });
    it('should return when remaining pages is below 1', async () => {
      const result = await getDealerReviews(
        'url',
        'page',
        [],
        0,
        axios,
        parseFunctions
      );
      expect(result).toMatchObject([]);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return when url is null', async () => {
      const result = await getDealerReviews(
        'url',
        undefined as any,
        [],
        3,
        axios,
        parseFunctions
      );
      expect(result).toMatchObject([]);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should get content', async () => {
      const result = await getDealerReviews(
        'url',
        'link',
        [],
        3,
        axios,
        parseFunctions
      );
      expect(result.length).toBe(1);
      expect(axios.get).toHaveBeenCalledWith('urllink', expect.anything());
      expect(parseFunctions.parseDealerReviews).toHaveBeenCalled();
      expect(parseFunctions.getDealerReviews).toHaveBeenCalledWith(
        'url',
        'link2',
        [],
        2,
        axios,
        parseFunctions
      );
    });
  });
});

const exampleDealerReviewHtml = `<div>
<div class="review-entry col-xs-12 text-left pad-none pad-top-lg  border-bottom-teal-lt">
<a name="r9030878"></a>
<div class="col-xs-12 col-sm-3 pad-left-none text-center review-date margin-bottom-md">
    <div class="italic col-xs-6 col-sm-12 pad-none margin-none font-20">January 04, 2022</div>
    <div class="col-xs-6 col-sm-12 pad-none dealership-rating">
        <div class="rating-static visible-xs pad-none margin-none rating-50 pull-right"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
        <div class="rating-static hidden-xs rating-50 margin-center"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
        <div class="col-xs-12 hidden-xs pad-none margin-top-sm small-text dr-grey">SALES VISIT - USED</div>
    </div>
</div>
<div class="col-xs-12 col-sm-9 pad-none review-wrapper open">
<!-- REVIEW BODY -->

<div class="tr margin-top-md">
    <div class="td text-left valign-top ">
        <p class="font-16 margin-bottom-none line-height-25">

            <span class="review-title bolder font-18 italic">As a Single Mom and a Disabled Veteran I was in need with</span>
            <span class="review-snippet" style="display: none;"> no options and Tristian Olivares was there with the solution making the process easy and hassle free. He listened to and cared about my concerns, nee</span>
            <span class="review-whole display-none" style="display: inline;"> no options and Tristian Olivares was there with the solution making the process easy and hassle free. He listened to and cared about my concerns, needs, and wants for my family and he delivered. I would highly recommend coming to see him, you won’t be disappointed! Thank you Mckaig Chevrolet, I will be sure to send anyone in need your way. You guys are truly for the people.  </span>
                <a id="9030878" class="read-more-toggle pointer line-height-25 small-text bolder inline margin-bottom-md" data-ae-append="">Less</a>
        </p>
    </div>
</div>
<!--  USER-->
<div class="margin-bottom-sm line-height-150">
    
    <span class="italic font-16 bolder notranslate">by kinaanderson2021</span>
</div>

<!-- REVIEW RATINGS - ALL -->
<div class="pull-left pad-left-md pad-right-md bg-grey-lt margin-bottom-md review-ratings-all review-hide">
    <!-- REVIEW RATING - CUSTOMER SERVICE -->
    <div class="table width-100 pad-left-none pad-right-none margin-bottom-md">
            <div class="tr">
                <div class="lt-grey small-text td">Customer Service</div>
                <div class="rating-static-indv rating-50 margin-top-none td"></div>
            </div>
                            <!-- REVIEW RATING - FRIENDLINESS -->
            <div class="tr margin-bottom-md">
                <div class="lt-grey small-text td">Friendliness</div>
                <div class="rating-static-indv rating-50 margin-top-none td"></div>
            </div>
                    <!-- REVIEW RATING - PRICING -->
            <div class="tr margin-bottom-md">
                <div class="lt-grey small-text td">Pricing</div>
                <div class="rating-static-indv rating-50 margin-top-none td"></div>
            </div>
                    <!-- REVIEW RATING - EXPERIENCE -->
            <div class="tr margin-bottom-md">
                <div class="td lt-grey small-text">Overall Experience</div>
                <div class="rating-static-indv rating-50 margin-top-none td"></div>
            </div>
        <!-- REVIEW RATING - RECOMMEND DEALER -->
        <div class="tr">
            <div class="lt-grey small-text td">Recommend Dealer</div>
            <div class="td small-text boldest">
                Yes
            </div>
        </div>
    </div>


</div>

<!-- EMPLOYEE SECTION -->
<div class="clear-fix  margin-top-sm">
        <div class="col-xs-12 lt-grey pad-left-none employees-wrapper">
            <div class="small-text">Employees Worked With </div>

                         <div class="col-xs-12 col-sm-6 col-md-4 pad-left-none pad-top-sm pad-bottom-sm review-employee">
                             <div class="table">
                                 <div class="td square-image employee-image" style="background-image: url(https://cdn-user.dealerrater.com/images/dealer/23685/employees/338f32ce6a76.jpg)"></div>
                                 
                                 <div class="td valign-bottom pad-left-md pad-top-none pad-bottom-none">
                                         <a class="notranslate pull-left line-height-1 tagged-emp small-text teal  margin-right-sm emp-507107" data-emp-id="507107" href="/sales/Brandon-McCloskey-review-507107/">
                                             Brandon McCloskey
                                         </a>
                                                                              <div class="col-xs-12 pad-none margin-none pad-top-sm">


<div class="relative employee-rating-badge-sm">
    <div class="col-xs-12 pad-none">
            <span class="pull-left font-14 boldest lt-grey line-height-1 pad-right-sm margin-right-sm border-right">5.0</span>
            <div class="rating-static rating-50 margin-top-none pull-left"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
    </div>
    
</div>

                                         </div>
                                 </div>

                             </div>

                         </div>
                         <div class="col-xs-12 col-sm-6 col-md-4 pad-left-none pad-top-sm pad-bottom-sm review-employee">
                             <div class="table">
                                 <div class="td square-image employee-image" style="background-image: url(https://cdn-user.dealerrater.com/images/dealer/23685/employees/2ef9cb4a37df.jpg)"></div>
                                 
                                 <div class="td valign-bottom pad-left-md pad-top-none pad-bottom-none">
                                         <a class="notranslate pull-left line-height-1 tagged-emp small-text teal  margin-right-sm emp-721863" data-emp-id="721863" href="/sales/Tristian-Olivares-review-721863/">
                                             Tristian Olivares
                                         </a>
                                                                              <div class="col-xs-12 pad-none margin-none pad-top-sm">


<div class="relative employee-rating-badge-sm">
    <div class="col-xs-12 pad-none">
            <span class="pull-left font-14 boldest lt-grey line-height-1 pad-right-sm margin-right-sm border-right">5.0</span>
            <div class="rating-static rating-50 margin-top-none pull-left"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
    </div>
    
</div>

                                         </div>
                                 </div>

                             </div>

                         </div>
                         <div class="col-xs-12 col-sm-6 col-md-4 pad-left-none pad-top-sm pad-bottom-sm review-employee">
                             <div class="table">
                                 <div class="td square-image employee-image" style="background-image: url(https://cdn-user.dealerrater.com/images/dealer/23685/employees/ca22768af3f7.jpg)"></div>
                                 
                                 <div class="td valign-bottom pad-left-md pad-top-none pad-bottom-none">
                                         <a class="notranslate pull-left line-height-1 tagged-emp small-text teal   emp-640356" data-emp-id="640356" href="/sales/Taylor-Prickett-review-640356/">
                                             Taylor Prickett
                                         </a>
                                                                              <div class="col-xs-12 pad-none margin-none pad-top-sm">


<div class="relative employee-rating-badge-sm">
    <div class="col-xs-12 pad-none">
            <span class="pull-left font-14 boldest lt-grey line-height-1 pad-right-sm margin-right-sm border-right">5.0</span>
            <div class="rating-static rating-50 margin-top-none pull-left"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
    </div>
    
</div>

                                         </div>
                                 </div>

                             </div>

                         </div>
                    </div>
</div>

<!-- SOCIAL MEDIA AND REVIEW ACTIONS -->
<div class="col-xs-12 pad-none review-hide margin-top-lg">
    <div class="pull-left">
        <a href="https://twitter.com/intent/tweet?url=http://www.dealerrater.com/consumer/social/9030878&amp;via=dealerrater&amp;text=Check+out+the+latest+review+on+McKaig+Chevrolet+Buick+-+A+Dealer+For+The+People" onclick="window.open('https://twitter.com/intent/tweet?url=http://www.dealerrater.com/consumer/social/9030878&amp;via=dealerrater&amp;text=Check+out+the+latest+review+on+McKaig+Chevrolet+Buick+-+A+Dealer+For+The+People', 'sharer', 'toolbar=0,status=0,width=750,height=500');return false;" target="_blank" rel="nofollow" aria-describedby="audioeye_new_window_message" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }"><img class="align-bottom" height="20" src="https://www.dealerrater.com/ncdn/s/209.20220104.4/Graphics/icons/icon_twitter_sm.png" alt="Twitter Social Network"></a>
        <a href="http://www.facebook.com/share.php?u=http://www.dealerrater.com/consumer/social/9030878" onclick="window.open('http://www.facebook.com/share.php?u=http://www.dealerrater.com/consumer/social/9030878', 'sharer', 'toolbar=0,status=0,width=750,height=500');return false;" target="_blank" rel="nofollow" aria-describedby="audioeye_new_window_message" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }"><img class="align-bottom" height="20" src="https://www.dealerrater.com/ncdn/s/209.20220104.4/Graphics/icons/icon_facebook_sm.png" alt="Facebook Social Network"></a>
    </div>
    <div class="pull-left margin-left-md">
        <a href="#" onclick="javascript:window.reportReview(9030878); return false;" class="small-text" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }">Report</a> |
        <a href="#" onclick="window.open('/consumer/dealer/23685/review/9030878/print', 'report', 'toolbar=no,scrollbars=yes,location=no,width=720,height=400,resizable=yes'); return false;" class="small-text" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }">Print</a>
    </div>
</div>

<!-- PUBLIC MESSAGES -->

<!-- WAS HELPFUL SECTION -->
<div class="col-xs-12 margin-bottom-lg">
    <div class="pull-right">
        <a href="#" class="helpful-button" onclick="javascript:MarkReviewHelpful(9030878, this); return false;" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }">
            <img class="pull-left margin-right-sm" src="https://www.dealerrater.com/ncdn/s/209.20220104.4/Graphics/icons/icon-thumbsup.png" alt=""> Helpful <span class="helpful-count display-none" id="helpful_count_9030878">0</span></a>
    </div>
</div>
</div>

</div>
<div class="review-entry col-xs-12 text-left pad-none pad-top-lg  border-bottom-teal-lt">
<a name="r9030878"></a>
<div class="col-xs-12 col-sm-3 pad-left-none text-center review-date margin-bottom-md">
    <div class="italic col-xs-6 col-sm-12 pad-none margin-none font-20">January 04, 2022</div>
    <div class="col-xs-6 col-sm-12 pad-none dealership-rating">
        <div class="rating-static visible-xs pad-none margin-none rating-50 pull-right"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
        <div class="rating-static hidden-xs rating-50 margin-center"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
        <div class="col-xs-12 hidden-xs pad-none margin-top-sm small-text dr-grey">SALES VISIT - USED</div>
    </div>
</div>
<div class="col-xs-12 col-sm-9 pad-none review-wrapper open">
<!-- REVIEW BODY -->

<div class="tr margin-top-md">
    <div class="td text-left valign-top ">
        <p class="font-16 margin-bottom-none line-height-25">

            <span class="review-title bolder font-18 italic">As a Single Mom and a Disabled Veteran I was in need with</span>
            <span class="review-snippet" style="display: none;"> no options and Tristian Olivares was there with the solution making the process easy and hassle free. He listened to and cared about my concerns, nee</span>
            <span class="review-whole display-none" style="display: inline;"> no options and Tristian Olivares was there with the solution making the process easy and hassle free. He listened to and cared about my concerns, needs, and wants for my family and he delivered. I would highly recommend coming to see him, you won’t be disappointed! Thank you Mckaig Chevrolet, I will be sure to send anyone in need your way. You guys are truly for the people.  </span>
                <a id="9030878" class="read-more-toggle pointer line-height-25 small-text bolder inline margin-bottom-md" data-ae-append="">Less</a>
        </p>
    </div>
</div>
<!--  USER-->
<div class="margin-bottom-sm line-height-150">
    
    <span class="italic font-16 bolder notranslate">by kinaanderson2021</span>
</div>

<!-- REVIEW RATINGS - ALL -->
<div class="pull-left pad-left-md pad-right-md bg-grey-lt margin-bottom-md review-ratings-all review-hide">
    <!-- REVIEW RATING - CUSTOMER SERVICE -->
    <div class="table width-100 pad-left-none pad-right-none margin-bottom-md">
            <div class="tr">
                <div class="lt-grey small-text td">Customer Service</div>
                <div class="rating-static-indv rating-50 margin-top-none td"></div>
            </div>
                            <!-- REVIEW RATING - FRIENDLINESS -->
            <div class="tr margin-bottom-md">
                <div class="lt-grey small-text td">Friendliness</div>
                <div class="rating-static-indv rating-50 margin-top-none td"></div>
            </div>
                    <!-- REVIEW RATING - PRICING -->
            <div class="tr margin-bottom-md">
                <div class="lt-grey small-text td">Pricing</div>
                <div class="rating-static-indv rating-50 margin-top-none td"></div>
            </div>
                    <!-- REVIEW RATING - EXPERIENCE -->
            <div class="tr margin-bottom-md">
                <div class="td lt-grey small-text">Overall Experience</div>
                <div class="rating-static-indv rating-50 margin-top-none td"></div>
            </div>
        <!-- REVIEW RATING - RECOMMEND DEALER -->
        <div class="tr">
            <div class="lt-grey small-text td">Recommend Dealer</div>
            <div class="td small-text boldest">
                Yes
            </div>
        </div>
    </div>


</div>

<!-- EMPLOYEE SECTION -->
<div class="clear-fix  margin-top-sm">
        <div class="col-xs-12 lt-grey pad-left-none employees-wrapper">
            <div class="small-text">Employees Worked With </div>

                         <div class="col-xs-12 col-sm-6 col-md-4 pad-left-none pad-top-sm pad-bottom-sm review-employee">
                             <div class="table">
                                 <div class="td square-image employee-image" style="background-image: url(https://cdn-user.dealerrater.com/images/dealer/23685/employees/338f32ce6a76.jpg)"></div>
                                 
                                 <div class="td valign-bottom pad-left-md pad-top-none pad-bottom-none">
                                         <a class="notranslate pull-left line-height-1 tagged-emp small-text teal  margin-right-sm emp-507107" data-emp-id="507107" href="/sales/Brandon-McCloskey-review-507107/">
                                             Brandon McCloskey
                                         </a>
                                                                              <div class="col-xs-12 pad-none margin-none pad-top-sm">


<div class="relative employee-rating-badge-sm">
    <div class="col-xs-12 pad-none">
            <span class="pull-left font-14 boldest lt-grey line-height-1 pad-right-sm margin-right-sm border-right">5.0</span>
            <div class="rating-static rating-50 margin-top-none pull-left"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
    </div>
    
</div>

                                         </div>
                                 </div>

                             </div>

                         </div>
                         <div class="col-xs-12 col-sm-6 col-md-4 pad-left-none pad-top-sm pad-bottom-sm review-employee">
                             <div class="table">
                                 <div class="td square-image employee-image" style="background-image: url(https://cdn-user.dealerrater.com/images/dealer/23685/employees/2ef9cb4a37df.jpg)"></div>
                                 
                                 <div class="td valign-bottom pad-left-md pad-top-none pad-bottom-none">
                                         <a class="notranslate pull-left line-height-1 tagged-emp small-text teal  margin-right-sm emp-721863" data-emp-id="721863" href="/sales/Tristian-Olivares-review-721863/">
                                             Tristian Olivares
                                         </a>
                                                                              <div class="col-xs-12 pad-none margin-none pad-top-sm">


<div class="relative employee-rating-badge-sm">
    <div class="col-xs-12 pad-none">
            <span class="pull-left font-14 boldest lt-grey line-height-1 pad-right-sm margin-right-sm border-right">5.0</span>
            <div class="rating-static rating-50 margin-top-none pull-left"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
    </div>
    
</div>

                                         </div>
                                 </div>

                             </div>

                         </div>
                         <div class="col-xs-12 col-sm-6 col-md-4 pad-left-none pad-top-sm pad-bottom-sm review-employee">
                             <div class="table">
                                 <div class="td square-image employee-image" style="background-image: url(https://cdn-user.dealerrater.com/images/dealer/23685/employees/ca22768af3f7.jpg)"></div>
                                 
                                 <div class="td valign-bottom pad-left-md pad-top-none pad-bottom-none">
                                         <a class="notranslate pull-left line-height-1 tagged-emp small-text teal   emp-640356" data-emp-id="640356" href="/sales/Taylor-Prickett-review-640356/">
                                             Taylor Prickett
                                         </a>
                                                                              <div class="col-xs-12 pad-none margin-none pad-top-sm">


<div class="relative employee-rating-badge-sm">
    <div class="col-xs-12 pad-none">
            <span class="pull-left font-14 boldest lt-grey line-height-1 pad-right-sm margin-right-sm border-right">5.0</span>
            <div class="rating-static rating-50 margin-top-none pull-left"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
    </div>
    
</div>

                                         </div>
                                 </div>

                             </div>

                         </div>
                    </div>
</div>

<!-- SOCIAL MEDIA AND REVIEW ACTIONS -->
<div class="col-xs-12 pad-none review-hide margin-top-lg">
    <div class="pull-left">
        <a href="https://twitter.com/intent/tweet?url=http://www.dealerrater.com/consumer/social/9030878&amp;via=dealerrater&amp;text=Check+out+the+latest+review+on+McKaig+Chevrolet+Buick+-+A+Dealer+For+The+People" onclick="window.open('https://twitter.com/intent/tweet?url=http://www.dealerrater.com/consumer/social/9030878&amp;via=dealerrater&amp;text=Check+out+the+latest+review+on+McKaig+Chevrolet+Buick+-+A+Dealer+For+The+People', 'sharer', 'toolbar=0,status=0,width=750,height=500');return false;" target="_blank" rel="nofollow" aria-describedby="audioeye_new_window_message" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }"><img class="align-bottom" height="20" src="https://www.dealerrater.com/ncdn/s/209.20220104.4/Graphics/icons/icon_twitter_sm.png" alt="Twitter Social Network"></a>
        <a href="http://www.facebook.com/share.php?u=http://www.dealerrater.com/consumer/social/9030878" onclick="window.open('http://www.facebook.com/share.php?u=http://www.dealerrater.com/consumer/social/9030878', 'sharer', 'toolbar=0,status=0,width=750,height=500');return false;" target="_blank" rel="nofollow" aria-describedby="audioeye_new_window_message" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }"><img class="align-bottom" height="20" src="https://www.dealerrater.com/ncdn/s/209.20220104.4/Graphics/icons/icon_facebook_sm.png" alt="Facebook Social Network"></a>
    </div>
    <div class="pull-left margin-left-md">
        <a href="#" onclick="javascript:window.reportReview(9030878); return false;" class="small-text" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }">Report</a> |
        <a href="#" onclick="window.open('/consumer/dealer/23685/review/9030878/print', 'report', 'toolbar=no,scrollbars=yes,location=no,width=720,height=400,resizable=yes'); return false;" class="small-text" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }">Print</a>
    </div>
</div>

<!-- PUBLIC MESSAGES -->

<!-- WAS HELPFUL SECTION -->
<div class="col-xs-12 margin-bottom-lg">
    <div class="pull-right">
        <a href="#" class="helpful-button" onclick="javascript:MarkReviewHelpful(9030878, this); return false;" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }">
            <img class="pull-left margin-right-sm" src="https://www.dealerrater.com/ncdn/s/209.20220104.4/Graphics/icons/icon-thumbsup.png" alt=""> Helpful <span class="helpful-count display-none" id="helpful_count_9030878">0</span></a>
    </div>
</div>
</div>

</div>

</div>`;

const exampleNextLinkHtml = `<div class="page_active next page_num_2 page" onclick="javascript:document.location.href='/dealer/McKaig-Chevrolet-Buick-A-Dealer-For-The-People-dealer-reviews-23685/page2/?filter=#link';" onkeypress="if (event.key === &quot;Enter&quot; || event.key === &quot; &quot;) { event.target.onclick(event); }"><a href="/dealer/McKaig-Chevrolet-Buick-A-Dealer-For-The-People-dealer-reviews-23685/page2/?filter=#link" rel="next page_num_2">next&nbsp;&gt;</a></div>`;

const exampleEmployeeReviewHtml = `<div class="col-xs-12 lt-grey pad-left-none employees-wrapper">
  <div class="small-text">Employees Worked With </div>

               <div class="col-xs-12 col-sm-6 col-md-4 pad-left-none pad-top-sm pad-bottom-sm review-employee">
                   <div class="table">
                       <div class="td square-image employee-image" style="background-image: url(https://cdn-user.dealerrater.com/images/dealer/23685/employees/f00ae268a4b8.jpg)"></div>
                       
                       <div class="td valign-bottom pad-left-md pad-top-none pad-bottom-none">
                               <a class="notranslate pull-left line-height-1 tagged-emp small-text teal  margin-right-sm emp-273456" data-emp-id="273456" href="/sales/Adrian-AyyDee-Cortes-review-273456/">
                                   Adrian "AyyDee" Cortes
                               </a>
                                                                    <div class="col-xs-12 pad-none margin-none pad-top-sm">


<div class="relative employee-rating-badge-sm">
<div class="col-xs-12 pad-none">
  <span class="pull-left font-14 boldest lt-grey line-height-1 pad-right-sm margin-right-sm border-right">5.0</span>
  <div class="rating-static rating-50 margin-top-none pull-left"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
</div>

</div>

                               </div>
                       </div>

                   </div>

               </div>
               <div class="col-xs-12 col-sm-6 col-md-4 pad-left-none pad-top-sm pad-bottom-sm review-employee">
                   <div class="table">
                       <div class="td square-image employee-image" style="background-image: url(https://cdn-user.dealerrater.com/images/dealer/23685/employees/ca22768af3f7.jpg)"></div>
                       
                       <div class="td valign-bottom pad-left-md pad-top-none pad-bottom-none">
                               <a class="notranslate pull-left line-height-1 tagged-emp small-text teal   emp-640356" data-emp-id="640356" href="/sales/Taylor-Prickett-review-640356/">
                                   Taylor Prickett
                               </a>
                                                                    <div class="col-xs-12 pad-none margin-none pad-top-sm">


<div class="relative employee-rating-badge-sm">
<div class="col-xs-12 pad-none">
  <span class="pull-left font-14 boldest lt-grey line-height-1 pad-right-sm margin-right-sm border-right">4.0</span>
  <div class="rating-static rating-40 margin-top-none pull-left"><span style="display: none;" class="ae-compliance-indent ae-reader-visible"> 5 out of 5 Stars </span></div>
</div>

</div>

                               </div>
                       </div>

                   </div>

               </div>
          </div>`;
