declare module "*.css";

declare global {
  interface Window {
    AndroidPrinter?: {
      printText: (text: string) => void;
      printHtml: (html: string) => void;
      printTable: (jsonData: string) => void;
    };
  }
}
