import { verifyEmail } from "integrations/directus";

export default async (req, res) => {

  if (req.method === "GET") {
    try {
        const { token } = req.query
        const result = await verifyEmail(token)
        
        if (result?.errors) {
            console.log(result.errors)
            res.redirect(307, '/auth/register?verification=failed')
        }
      
        res.redirect(307, '/auth/login?verification=success')
    } catch (err) {
      console.log(err);
      res.redirect(307, '/auth/register?verification=failed')
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};