import express, { Request } from 'express';
import axios from 'axios';
import { Readable } from 'stream';

interface ProxyQueryParams {
  url: string,
}

const router = express.Router()
router.get('/proxy/image', async (req: Request<{}, {}, {}, ProxyQueryParams>, res) => {
  const url: string = req.query['url'];
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      maxRedirects: 0,
      timeout: 10000});
    response.data.pipe(res);
  } catch (e) {
    const imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII';
    const image = Buffer.from(imageData, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': image.length
    });
    res.end(image);
  }

});

export default router;
