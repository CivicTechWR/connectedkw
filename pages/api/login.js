import { loginUser } from "integrations/directus";

export default async (req, res) => {
	const { email, password } = JSON.parse(req.body);

	if (req.method === "POST") {
		try {
			// console.log("LOGIN API Invoked");
			const result = await loginUser(email, password);
      // console.log("LOGIN API RESULT", result);
			res.status(200).json({ user: result.user, token: result.access_token });
		} catch (err) {
			console.log(err);
			res.status(401).json({ message: "Invalid email or password" });
		}
	} else {
		res.setHeader("Allow", ["POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
};
