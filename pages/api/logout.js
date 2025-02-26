export default async (req, res) => {
  if (req.method === "POST") {
    try {
      res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Error logging out" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}; 