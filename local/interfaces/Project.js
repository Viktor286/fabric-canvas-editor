import FilesIO from './FilesIO.js';

export default class Project {
  static async saveProjectFile(canvas) {
    const zip = new JSZip();
    const appStateBackupJSON = JSON.stringify(canvas);

    zip.file('application.json', appStateBackupJSON);

    const file = canvas.getActiveObject().file;
    const testImageBlob = await FilesIO.getBlobFromImageURL(file.imageElement);

    zip.file(`images/${file.hash}.png`, testImageBlob, {
      binary: true,
      type: 'blob',
    });

    zip
      .generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
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
        console.log('!!! Opened project', project.files);
      });
    };

    reader.readAsBinaryString(file);
  }
}
