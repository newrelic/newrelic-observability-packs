const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const fetch = require("node-fetch");
const parseLinkHeader = require("parse-link-header");
const glob = require("glob");

// pull in from helper file alec moved
const readYamlFile = (filePath) => {
  const file = fs.readFileSync(filePath);
  const contents = yaml.loadAll(file);
  return { path: filePath, contents };
};

// make helper?
const fetchFilesFromGH = async (url) => {
  let files = [];
  let nextPageLink = url;

  while (nextPageLink) {
    const resp = await fetch(nextPageLink, {
      headers: { authorization: `token ${process.env.GITHUB_TOKEN}` }
    });
    if (!resp.ok) {
      throw new Error(
        `Github API returned status ${resp.code} - ${resp.message}`
      );
    }
    const page = await resp.json();
    nextPageLink = getNextLink(resp.headers.get("Link"));
    files = [...files, ...page];
  }

  return files;
};

const getNextLink = (linkHeader) => {
  const parsedLinkHeader = parseLinkHeader(linkHeader);
  if (parsedLinkHeader && parsedLinkHeader.next) {
    return parsedLinkHeader.next.url || null;
  }
  return null;
};

const findSupportLevel = async () => {
  let packAddition = false;

  const files = await fetchFilesFromGH(url);

  const packNames = files.reduce((acc, file) => {
    if (file.filename.includes("config.yml") && file.status === "added") {
      packAddition = true;
    }
    if (file.filename.includes("pack")) {
      acc.push(file.filename.replace("packs/", "").split("/")[0]);
      return acc;
    }
  }, []);

  const supportLevelSet = new Set();

  packNames.forEach((packName) => {
    const parsedConfig = readYamlFile(
      glob.sync(
        path.join(process.cwd(), `packs/${packName}/config.+(yml|yaml)`)
      )[0]
    );
    const supportLevel = parsedConfig.contents[0].level;

    if (supportLevel) {
      const validSupportLevels = ["New Relic", "Verified", "Community"];
      if (validSupportLevels.includes(supportLevel)) {
        supportLevelSet.add(parsedConfig.contents[0].level);
      }
    }
  });

  const supportLevelArray = Array.from(supportLevelSet);

  console.log(`::set-output name=addition::${packAddition}`);

  console.log(`::set-output name=levels::${supportLevelArray}`);
};

findSupportLevel();
