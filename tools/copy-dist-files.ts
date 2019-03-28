import fs from "fs-extra";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

fs.writeFileSync(
  "dist/package.json",
  JSON.stringify(
    {
      dependencies: pkg.dependencies,
      description: pkg.description,
      license: pkg.license,
      main: pkg.main,
      name: pkg.name,
      peerDependencies: pkg.peerDependencies,
      repository: pkg.repository,
      version: pkg.version,
    },
    null,
    2,
  ),
);

fs.copySync("LICENSE", "dist/LICENSE");
fs.copySync("README.md", "dist/README.md");

const packageNameSansOrg = pkg.name.split("/").pop();
const baseDocsPath = `docs/jupiterone-io/${packageNameSansOrg}`;

let docsExtension;
if (fs.pathExistsSync(`${baseDocsPath}.md`)) {
  docsExtension = "md";
} else if (fs.pathExistsSync(`${baseDocsPath}.rst`)) {
  docsExtension = "rst";
}

if (docsExtension !== undefined) {
  fs.copySync(
    `${baseDocsPath}.${docsExtension}`,
    `dist/docs/${packageNameSansOrg}.${docsExtension}`,
  );
  fs.writeFileSync(
    "dist/docs/metadata.json",
    JSON.stringify(
      {
        version: pkg.version,
      },
      null,
      2,
    ),
  );
} else {
  throw new Error("No documentation found!");
}
