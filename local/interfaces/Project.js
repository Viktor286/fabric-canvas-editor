import FilesIO from './FilesIO.js';
import FabricBridge from './FabricBridge.js';

export default class Project {
  static async loadProjectFromFile(projectFile) {
    // from file, all sources will be loaded
    // TODO: try to load all image files into Blob Store,
    //  then get image blob links, replace them in JSON
    //  then populate fabric.Canvas#loadFromJSON

    // Async read files from project file
    let asyncRead = [];
    projectFile.forEach((relativePath, entry) => {
      // At first, handle images, if not in images, test on .json
      if (entry.name.startsWith('images')) {
        const fileName = entry.name.slice(7);
        const hash = fileName.slice(0, fileName.lastIndexOf('.'));
        const ext = fileName.substring(fileName.lastIndexOf('.') + 1);

        let type = undefined;
        if (ext === 'png') type = 'png';
        if (ext === 'gif') type = 'gif';
        if (ext === 'svg') type = 'svg+xml';
        if (ext === 'jpeg' || ext === 'jpg') type = 'jpeg';

        asyncRead.push(
          entry.async('arraybuffer').then(async (arrayBuffer) => {
            if (arrayBuffer.byteLength > 100) {
              const imageBlob = new Blob([arrayBuffer], { type: `image/${type}` });
              // todo: should we check saved hash to match uploaded hash? probably not...
              // Save image to Blob Store right away
              const imageElement = await FilesIO.saveImageToBlobStore(imageBlob);
              // Return finalized ImageFileData object
              return await FabricBridge.constructImageFileData(imageElement, imageBlob);
            }
          }),
        );
      } else {
        // Handle application.json file
        if (entry.name === 'application.json') {
          asyncRead.push(
            entry.async('string').then((appJsonStr) => ({
              file: 'application',
              data: JSON.parse(appJsonStr),
              type: 'json',
            })),
          );
        }
      }
    });

    const results = await Promise.all(asyncRead);
    console.log('loadProjectFromFile results', results);
    // todo: change blobUrlStore in assets of appStore by hash match
  }

  static loadProjectFromCache() {
    // load compressed project from BrowserStore
    const projectFile = undefined;
    Project.loadProjectFromFile(projectFile);
  }

  static async buildProjectFile(canvas) {
    const projectArchive = new JSZip();
    const appStateBackup = FabricBridge.getFabricAppState();

    projectArchive.file('application.json', JSON.stringify(appStateBackup));

    // Get image files from app store
    const projectImages = appStateBackup.objects.filter((e) => e.type === 'image');

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
    projectFile
      .generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
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
      // Todo: implement public error pipeline
      console.log("Project file doesn't seem to be valid");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const projectFile = new JSZip();
      projectFile.loadAsync(e.target.result).then((project) => {
        console.log('!!! Opened project', project);
        Project.loadProjectFromFile(project);
      });
    };

    reader.readAsBinaryString(file);
  }
}
