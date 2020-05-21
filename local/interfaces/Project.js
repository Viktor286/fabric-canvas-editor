import FilesIO from './FilesIO.js';
import FabricBridge from './FabricBridge.js';

export default class Project {
  static async loadProjectFromFile(projectFile) {
    // Async read files from project file
    let asyncProjectFilesRead = [];
    projectFile.forEach((relativePath, entry) => {
      // At first, handle images, if not in images, test on .json
      if (entry.name.startsWith('images') && !entry.dir) {
        const fileName = entry.name.slice(7);
        const hash = fileName.slice(0, fileName.lastIndexOf('.'));
        const ext = fileName.substring(fileName.lastIndexOf('.') + 1);

        let type = undefined;
        if (ext === 'png') type = 'png';
        if (ext === 'gif') type = 'gif';
        if (ext === 'svg') type = 'svg+xml';
        if (ext === 'jpeg' || ext === 'jpg') type = 'jpeg';

        asyncProjectFilesRead.push(
          entry.async('arraybuffer').then(async (arrayBuffer) => {
            if (arrayBuffer.byteLength > 100) {
              const imageBlob = new Blob([arrayBuffer], { type: `image/${type}` });
              // Save image to Blob Store right away
              const imageElement = await FilesIO.saveImageToBlobStore(imageBlob);
              // Return finalized ImageFileData object
              console.log('[progress] saved imageElement', imageElement);
              return await FabricBridge.constructImageFileData(imageElement, imageBlob);
            }
          }),
        );
      } else {
        // Handle application.json file
        if (entry.name === 'application.json') {
          asyncProjectFilesRead.push(
            entry.async('string').then((appJsonStr) => ({
              file: 'application',
              data: JSON.parse(appJsonStr),
              type: 'json',
            })),
          );
        }
      }
    });

    const projectFiles = await Promise.all(asyncProjectFilesRead);
    console.log('[progress] All projectFiles loaded into Blob Store.', projectFiles);

    const appState = projectFiles.find((e) => e.file === 'application' && e.type === 'json').data;

    appState.objects.forEach((e) => {
      if (e.type === 'image') {
        const correspondingLoadedFile = projectFiles.find((loaded) => loaded.hash === e.file.hash);
        e.file = correspondingLoadedFile;
        e.src = correspondingLoadedFile.blobUrlStore;
      }
    });

    console.log('[success] Loading new project into application', appState);

    // load application.json with fabric.Canvas#loadFromJSON
    canvas.loadFromJSON(appState);
  }

  static loadProjectFromCache() {
    // load compressed project from BrowserStore
    const projectFile = undefined;
    Project.loadProjectFromFile(projectFile);
  }

  static async buildProjectFile() {
    const projectArchive = new JSZip();
    const appState = FabricBridge.getFabricAppState();

    projectArchive.file('application.json', JSON.stringify(appState));

    // Get image files from app store
    const projectImages = appState.objects.filter((e) => e.type === 'image');

    const asyncImgBlobs = projectImages.map(
      (obj) =>
        new Promise((resolve) => {
          FilesIO.getBlobFromImageURL(obj.file.imageElement).then((blob) => {
            obj.file.blob = blob;
            resolve(obj.file);
          });
        }),
    );

    const projectImagesReady = await Promise.all(asyncImgBlobs);

    // Save files into projectArchive
    projectImagesReady.forEach((imageObj) => {
      projectArchive.file(`images/${imageObj.hash}.png`, imageObj.blob, {
        binary: true,
        type: 'blob',
      });
    });

    return projectArchive;
  }

  static async saveProjectFile(canvas) {
    const projectFile = await Project.buildProjectFile(canvas);
    console.log('projectFile built', projectFile);
    // compression: STORE|DEFLATE
    projectFile
      .generateAsync({
        type: 'blob',
        compression: 'STORE',
        compressionOptions: {
          level: 9,
        },
        platform: 'UNIX',
      })
      .then(function (content) {
        FilesIO.downloadFileToClient(content, 'project.flow', 'application/zip');
      });
  }

  static async readProjectFile(event) {
    const file = event.target.files[0];

    if (!file || file.size < 100) {
      console.log("Project file doesn't seem to be valid");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const projectFile = new JSZip();
      projectFile.loadAsync(e.target.result).then((project) => {
        Project.loadProjectFromFile(project);
      });
    };

    reader.readAsBinaryString(file);
  }
}
