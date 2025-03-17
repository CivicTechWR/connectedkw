import { createDirectus, staticToken, rest, uploadFiles } from '@directus/sdk';

const directus = createDirectus('https://cms.connectedkw.com')
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_TOKEN));

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const formData = new FormData();
    const blob = new Blob([rawBody]);
    const file = new File([blob], 'image.png', { lastModified: new Date().getTime(), type: blob.type });
    formData.append('file', file);

    if (!formData) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = await directus.request(
      uploadFiles(formData)
    );

    console.log({uploadedFile})

    // Return the file ID/URL
    return res.status(200).json(uploadedFile);

  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message 
    });
  }
} 