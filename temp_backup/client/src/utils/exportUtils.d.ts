/**
 * Exports data to a CSV file and initiates download
 * @param data The data to be exported
 * @param filename The name of the file to download
 */
export function exportToCsv(data: any[], filename: string): Promise<void>;

/**
 * Prints a DOM element using the browser's print functionality
 * @param element The DOM element to print
 * @param title Optional title for the printed page
 */
export function printElement(element: HTMLElement, title?: string): Promise<void>;