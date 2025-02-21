import { register } from "integrations/directus";

export default async (req, res) => {
  const { first_name, last_name, email, password } = JSON.parse(req.body);

  if (req.method === "POST") {
    try {
      const result = await register(first_name, last_name, email, password);
      console.log(result)
      res.status(201).json({ user: result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};