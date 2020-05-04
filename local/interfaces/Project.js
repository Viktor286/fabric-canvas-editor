import FilesIO from './FilesIO.js';

export default class Project {
  static async loadProjectFromFile(projectFile) {
    // from file, all sources will be loaded
    // TODO: try to load all image files into Blob Store,
    //  then get image blob links, replace them in JSON
    //  then populate fabric.Canvas#loadFromJSON

    // const imageElement = await FilesIO.saveImageToBlobStore(imageBlob);

    projectFile.forEach((relativePath, entry) => {
      console.log(entry); // .asText() .asBinary() .asArrayBuffer()

      // At first, handle images, if not in images, test on .json
      if (entry.name.startsWith('images')) {
        const filename = entry.name.slice(7);

        entry.async('arraybuffer').then((arrayBuffer) => {
          if (arrayBuffer.byteLength > 100) {
            const imageBlob = new Blob([arrayBuffer], { type: 'image/png' });
            console.log('imageBlob', filename, imageBlob);
          }
        });
      } else {
        // Handle application.json file
        if (entry.name.endsWith('.json')) {
          entry.async('string').then((applicationJson) => {
            console.log('applicationJson', applicationJson);
          });
        }
      }
    });
  }

  static loadProjectFromCache() {
    // load compressed project from BrowserStore
    const projectFile = undefined;
    Project.loadProjectFromFile(projectFile);
  }

  static async buildProjectFile(canvas) {
    const projectFile = new JSZip();
    const appStateBackupJSON = JSON.stringify(canvas);

    projectFile.file('application.json', appStateBackupJSON);

    const file = canvas.getActiveObject().file;
    const testImageBlob = await FilesIO.getBlobFromImageURL(file.imageElement);

    projectFile.file(`images/${file.hash}.png`, testImageBlob, {
      binary: true,
      type: 'blob',
    });

    return projectFile;
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
