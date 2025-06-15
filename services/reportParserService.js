import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import { parse } from 'csv-parse/sync';

export default class ReportParserService {
  constructor(reportDir) {
    this.reportDir = reportDir;
    this.allowedExtensions = ['.csv'];
    this.parsedCount = 0;
    this.parsedReports = [];
  }

  parseReports() {
    const reportFolders = fs.readdirSync(this.reportDir);

    for (const folder of reportFolders) {
      const folderPath = path.join(this.reportDir, folder);
      const stat = fs.statSync(folderPath);
      if (!stat.isDirectory()) continue;

      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const ext = path.extname(file).toLowerCase();
        if (!this.allowedExtensions.includes(ext)) continue;

        try {
          const content = this.readFileSmart(filePath);
          const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true,
          });

          const parsedRecords = records.map(record => {
            const cleaned = {};
            for (const key in record) {
              const cleanKey = key.trim();
              cleaned[cleanKey] = record[key];
            }

            return {
              Time: cleaned['Time'],
              User: cleaned['User'],
              Pages: parseInt(cleaned['Pages'], 10),
              Copies: parseInt(cleaned['Copies'], 10),
              Printer: cleaned['Printer'],
              DocumentName: cleaned['Document Name'],
              Client: cleaned['Client'],
              PaperSize: cleaned['Paper Size'],
              Language: cleaned['Language'],
              Duplex: cleaned['Duplex'],
              Grayscale: cleaned['Grayscale'],
              Size: cleaned['Size'],
              Computer: folder
            };
          });

          const fileStat = fs.statSync(filePath);

          this.parsedReports.push({
            computer: folder,
            file,
            path: filePath,
            size: fileStat.size,
            data: parsedRecords
          });

          this.parsedCount += 1;
        } catch (error) {
          console.error(`❌ Ошибка при обработке: ${filePath} ${error.message}`);
        }
      }
    }

    return this.parsedReports;
  }

  readFileSmart(filePath) {
    const buffer = fs.readFileSync(filePath);
  
    let content;
  
    try {
      content = iconv.decode(buffer, 'windows1251');
    } catch {
      content = buffer.toString('utf8');
    }
  
    const lines = content.split(/\r?\n/);
  
    const headerIndex = lines.findIndex(line =>
      line.trim().toLowerCase().startsWith('time,user')
    );
  
    if (headerIndex === -1) {
      throw new Error('Не найдена строка с заголовками (Time,User,...)');
    }
  
    const cleanedLines = lines.slice(headerIndex).filter(line => line.trim() !== '');
    return cleanedLines.join('\n');
  }
  
  getDebugInfo() {
  const allEntries = this.getAllEntries();
  
  return {
    totalFiles: this.getParsedCount(),
    totalEntries: allEntries.length,
    uniqueUsers: [...new Set(allEntries.map(e => e.User).filter(Boolean))].length,
    uniqueComputers: [...new Set(allEntries.map(e => e.Client).filter(Boolean))].length,
    uniquePrinters: [...new Set(allEntries.map(e => e.Printer).filter(Boolean))].length,
    uniqueDocuments: [...new Set(allEntries.map(e => e.DocumentName).filter(Boolean))].length,
    firstParsedDate: allEntries.length > 0 
      ? new Date(Math.min(...allEntries.map(e => new Date(e.Time)))) 
      : null,
    lastParsedDate: allEntries.length > 0 
      ? new Date(Math.max(...allEntries.map(e => new Date(e.Time)))) 
      : null,
    fileSizes: this.parsedReports.map(r => ({
      name: r.file,
      size: (r.size / 1024).toFixed(2) + ' KB',
      entries: r.data.length
    }))
  };
}
  getParsedCount() {
    return this.parsedCount;
  }

  getParsedReports() {
    return this.parsedReports;
  }

  getAllUniqueValues() {
    const allEntries = this.getParsedReports().flatMap(report => report.data);

    const users = [...new Set(allEntries.map(e => e.User).filter(Boolean))];
    const computers = [...new Set(allEntries.map(e => e.Client).filter(Boolean))];
    const printers = [...new Set(allEntries.map(e => e.Printer).filter(Boolean))];

    return { users, computers, printers };
  }

  getAllEntries() {
    return this.parsedReports.flatMap(report => report.data);
  }
}
