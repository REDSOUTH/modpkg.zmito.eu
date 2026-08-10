export default async function exportPackage(version, loader, selectedMods, download) {
  if (!(selectedMods.length > 0)) {
    console.log("No mod added");
    return null;
  }

  const packageJson = {
    minecraftVersion: version,
    loader: loader,
    mods: {
      modrinth: selectedMods
    }
  };

  const jsonContent = JSON.stringify(packageJson, null, 2);

  if (download) {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `package.json`;
    a.click();

    URL.revokeObjectURL(url);
    return null;
  } else {
    return packageJson;
  }
};