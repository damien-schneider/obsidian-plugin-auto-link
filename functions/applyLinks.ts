import * as fs from "fs";
import * as path from "path";

interface ScanOptions {
	//difine scan options here
}
interface ResultOptions {
	//define result options here
}

function applyLinks(scanOptions: ScanOptions, resultOptions: ResultOptions) {
	const vaultPath = path.join(__dirname, "..", "..", "vault");

	const files = fs
		.readdirSync(vaultPath)
		.filter((file) => path.extname(file) === ".md")
		.map((file) => path.join(vaultPath, file));

	const keywordRegExp = /keyword/g; //define keyword here

	files.forEach((file) => {
		let content = fs.readFileSync(file, "utf-8");

		//apply scn options to content if needed

		content = content.replace(keywordRegExp, "[[keyword]]");

		//apply result options to content if needed

		fs.writeFileSync(file, content, "utf-8");
	});
}
