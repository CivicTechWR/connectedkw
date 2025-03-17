import { createDirectus, staticToken, rest, uploadFiles } from '@directus/sdk';

const directus = createDirectus('https://cms.connectedkw.com')
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_TOKEN));


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the file data from the request
    const formData = await req.formData();

    if (!formData) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload directly to Directus
    const uploadedFile = await directus.request(
      uploadFiles(formData)
    );

    // Return the file object
    return res.status(200).json(uploadedFile);

  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message 
    });
  }
} 