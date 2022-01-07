import { AxiosInstance } from 'axios';
import { getContent } from './scraper';

let axios: AxiosInstance;
describe('scraper.ts', () => {
  beforeEach(() => {
    axios = {
      get: jest.fn().mockResolvedValue({ data: 'web content' }),
    } as any;
  });
  describe('getContent', () => {
    it('should return webcontent from valid url', async () => {
      const result = await getContent({ url: 'a valid url', axios });
      expect(axios.get).toHaveBeenCalledWith('a valid url', expect.anything());
      expect(result).toBe('web content');
    });

    it('should fail with inalid url', async () => {
      axios = {
        get: jest
          .fn()
          .mockRejectedValue(new Error('Request failed with status code 404')),
      } as any;

      expect.assertions(1);
      try {
        await getContent({ url: 'an invalid url', axios });
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });
  });
});
