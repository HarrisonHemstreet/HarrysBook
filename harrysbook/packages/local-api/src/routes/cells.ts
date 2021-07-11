import express from "express";
import path from "path";
import fs from "fs/promises";

interface Cell {
	id: string;
	content: string;
	type: "text" | "code";
}

export const createCellsRouter = (filename: string, dir: string) => {
	const router = express.Router();

	const fullPath = path.join(dir, filename);
	
	router.get("/cells", async (req, res) => {
		try {
			const result = await fs.readFile(fullPath, { encoding: "utf-8" });

			res.send(JSON.parse(result));
		} catch (err) {
			// If read throws an error, inspect the error, check if it says the file does not exist

			if(err.code === "ENOENT") {
				await fs.writeFile(fullPath, "[]", "utf-8");
				res.send([]);
			} else {
				throw err;
			}
		}
	});
	
	router.post("/cells", async (req, res) => {
		// Take the list of cells from the request obj
		// serialize them
		const { cells }: { cells: Cell[] } = req.body;

		// Write the cells into the file
		await fs.writeFile(fullPath, JSON.stringify(cells), "utf-8");

		res.send({ status: "OK" })
	});

	return router;
}
