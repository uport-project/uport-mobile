export interface ScannerProps {
  /**
   * Scanner enabled
   */
  isEnabled: boolean
  /**
   * Callback when barcode has been read
   */
  onBarcodeRead: () => void
  /**
   * Callback when barcode has been read
   */
  startScanner: () => void

  /**
   * Close the scanner
   */
  closeScanner: () => void
}

export interface ScannerState {
  hasCameraPermission: boolean | null
}
