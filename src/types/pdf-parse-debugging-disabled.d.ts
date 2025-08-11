/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "pdf-parse-debugging-disabled" {
  interface PDFData {
    text: string;
    info: any;
    metadata: any;
    version: string;
  }

  function pdfParse(buffer: Buffer): Promise<PDFData>;
  export = pdfParse;
}
