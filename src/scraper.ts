import { AxiosInstance } from 'axios';
export const getContent = async (input: {
  url: string;
  axios: AxiosInstance;
}): Promise<any> => {
  const result = await input.axios.get(input.url, {});

  return result.data;
};
