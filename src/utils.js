const os = require("os");

function normalizeVersionName(version) {
  // The version is interpolated into the release download URL, and the downloaded
  // archive is extracted and added to PATH. Reject anything that is not a plain tag
  // name: a value containing "/" or ".." is normalized away by the URL parser and
  // would point the download at an arbitrary repository, causing the runner to
  // execute an attacker-supplied binary.
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(version) || version.includes("..")) {
    throw new Error(`Invalid version input: '${version}'`);
  }

  const normalized = version.replace(/^nightly-[0-9a-f]{40}$/, "nightly");
  
  // Check if the normalized version is a semver and format it accordingly
  if (/^v?\d+\.\d+\.\d+$/.test(normalized)) {
    // If it's missing the 'v' prefix, add it
    const withV = normalized.startsWith("v") ? normalized : `v${normalized}`;
    // Prepend "foundry-zksync-" to the tag
    return `foundry-zksync-${withV}`;
  }
  return normalized;
}

function mapArch(arch) {
  const mappings = {
    x32: "386",
    x64: "amd64",
  };

  return mappings[arch] || arch;
}

function getDownloadObject(version) {
  const platform = os.platform();
  const normalizedVersion = normalizeVersionName(version);
  const filename = `${normalizedVersion.replaceAll("-", "_")}_${platform}_${mapArch(os.arch())}`;
  const extension = platform === "win32" ? "zip" : "tar.gz";
  const url = `https://github.com/matter-labs/foundry-zksync/releases/download/${normalizedVersion}/${filename}.${extension}`;

  return {
    url,
    binPath: ".",
  };
}

module.exports = {
  getDownloadObject,
};
