export default class PrintRecord {
    constructor(data) {
      this.time = new Date(data.Time);
      this.user = data.User;
      this.pages = parseInt(data.Pages);
      this.copies = parseInt(data.Copies);
      this.printer = data.Printer;
      this.document = data['Document Name'];
      this.client = data.Client;
      this.paperSize = data['Paper Size'];
      this.duplex = data.Duplex === 'DUPLEX';
      this.grayscale = data.Grayscale === 'GRAYSCALE';
    }
  }