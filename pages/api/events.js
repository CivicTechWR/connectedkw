import { getEvents } from 'integrations/directus';
import Cors from 'cors'

import { 
  createDirectus, 
  staticToken, 
  rest,
  createItem,
  uploadFiles,
} from '@directus/sdk';

const directus = createDirectus('https://cms.connectedkw.com').with(rest()).with(staticToken(process.env.DIRECTUS_TOKEN));

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: "https://www.connectedkw.com"
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async (req, res) => {
  await runMiddleware(req, res, cors)
  // const { limit, offset } = req.query
  if (req.method === "GET") {
    try {
      const events = await getEvents()
      res.statusCode = 200;
      return res.json(events)

    } catch (err) {
      console.log(err)
      res.statusCode = 500;
      res.json({ msg: 'Something went wrong', error: err });
    }
  }

  if (req.method === "POST") {
    try {
      const event = await directus.request(
        createItem('events', req.body)
      )
      res.statusCode = 201;
      return res.json(event)
    } catch (err) {
      console.log(err)
      const errorMessage = err.errors[0].message
      res.statusCode = 500;
      res.json({ msg: errorMessage, error: err });
    }
  }
};
