//newsService.ts

import * as cheerio from 'cheerio';
import axios from 'axios';

export interface Article {
    title: string;
    link: string;
    image: string;
    description: string;
    footer: string;
}

class NewsService {
    private readonly baseUrl = 'https://finance.yahoo.com/topic/stock-market-news/';

    async fetchArticles(): Promise<Article[]> {
        try {
            const { data } = await axios.get(this.baseUrl);
            const $ = cheerio.load(data as string);
            let articles: Article[] = [];

            $('a.subtle-link').each((index, element) => {
                const title = $(element).attr('title');
                const link = $(element).attr('href');
                const image = $(element).find('img').attr('src');
                const footer = $(element).find('.publishing').text().trim();
                const description = $(element).find('p').text().trim();

                if (title && link && image) {
                    articles.push({
                        title: title.trim(),
                        link: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
                        image: image.trim(),
                        description: description.trim(),
                        footer: footer.trim()
                    });
                }
            });
            return articles.slice(0, 10);
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    }
}

export default new NewsService();
