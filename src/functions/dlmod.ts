export default async function dlmod(
  provider: string,
  id: string,
  mcLoader: string,
  mcVersion: string
): Promise<void> {
  if (provider === "modrinth") {
    try {
      const versionsResponse = await fetch(`https://api.modrinth.com/v2/project/${id}/version`);
      const versionsData = await versionsResponse.json();
      const latestVersion = versionsData.find((version: any) => {
        return version.loaders?.includes(mcLoader) && version.game_versions?.includes(mcVersion);
      });
      if (latestVersion) {
        const primaryFile = latestVersion.files?.find((file: any) => file.primary)?.url || latestVersion.files?.[0]?.url;
        if (primaryFile) {
          const link = document.createElement('a');
          link.href = primaryFile;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (error) {
      console.log('Error downloading mod:', error);
    }
  }
}
