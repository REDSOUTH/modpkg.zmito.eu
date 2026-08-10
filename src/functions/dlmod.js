export default async function dlmod(provider, id, mcLoader, mcVersion) {
  if (provider === "modrinth") {
    try {
      const versionsResponse = await fetch(`https://api.modrinth.com/v2/project/${id}/version`);
      const versionsData = await versionsResponse.json();
      const latestVersion = versionsData.find(version => {
        return version.loaders.includes(mcLoader) && version.game_versions.includes(mcVersion);
      });
      if (latestVersion) {
        const primaryFile = latestVersion.files.find(file => file.primary).url;
        const link = document.createElement('a');
        link.href = primaryFile;
        document.body.appendChild(link);
        link.click();
      }
    } catch (error) {
      console.log('Error downloading mod:', error)
    }
  }
}