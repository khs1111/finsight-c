const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app = express();
app.use(cors());

const NAVER_ID     = 'kHkTjH95EFin3hD6fVo3';
const NAVER_SECRET = 'bqqcp_Y08M';

app.get('/', (req, res) => {
  res.send('Server is up and running');
});

app.get('/api/news', async (req, res) => {
  const { category = '오늘의 뉴스', display = 10, start = 1, sort = 'sim' } = req.query;
  try {
    const { data } = await axios.get(
      'https://openapi.naver.com/v1/search/news.json',
      {
        params: { query: category, display: +display, start: +start, sort },
        headers: {
          'X-Naver-Client-Id':     NAVER_ID,
          'X-Naver-Client-Secret': NAVER_SECRET
        }
      }
    );
    const items = data.items.map(i => ({
      title:       i.title.replace(/<[^>]*>/g, ''),
      description: i.description.replace(/<[^>]*>/g, ''),
      link:        i.link,
      pubDate:     i.pubDate
    }));
    res.json({ items });
  } catch (err) {
    console.error('Naver API error:', err.response?.status, err.response?.data);
    res.status(500).json({ error: '네이버 API 호출 실패' });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
