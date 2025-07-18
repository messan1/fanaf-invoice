import { useState } from "react"
import { Check, X, ChevronRight } from "lucide-react"

const InvoiceInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="bg-white z-50 min-h-screen flex transition-all duration-300 ease-in-out">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:mr-[500px]" : "mr-0"
        }`}
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl font-medium text-gray-700 mb-6 md:mb-8 text-center sm:text-left">
              ASACI TECHNOLOGIES
            </h1>
          </div>

          {/* Invoice Card */}
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 sm:p-8 md:p-12">
            {/* Success Icon */}
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>

            {/* Status and Amount */}
            <div className="text-center mb-">
              <p className="text-gray-600 text-sm mb-2">Invoice paid</p>
              <p className="text-3xl sm:text-4xl font-semibold text-gray-900">350.000 FCFA</p>
            </div>

            {/* View Details Link */}
            <div className="text-center mb-6 md:mb-8">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 z-[9999] relative font-medium cursor-pointer text-sm hover:text-gray-600 transition-colors inline-flex items-center gap-1 py-2 px-1"
              >
                {!sidebarOpen ? "View invoice and payment details" : "Close invoice and payment details"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Invoice Details */}
            <div className="space-y-2 mb-6 md:mb-8">
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">Invoice number</span>
                <span className="text-gray-700 text-sm font-medium text-right">FAA90E8A-0002</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">Payment date</span>
                <span className="text-gray-700 text-sm font-medium text-right">November 28, 2022</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">Payment method</span>
                <span className="text-gray-700 text-sm font-medium text-right">MasterCard •••• 6985</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Download invoice
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Download receipt
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-10 md:mt-14 text-xs text-gray-500">
            <p className="mb-2">
              ASAPAY
               {/* <span className="font-semibold text-gray-500">MX</span> */}
            </p>
            <div className="flex justify-center gap-4">
              <button className="hover:text-gray-700 transition-colors py-1">Terms</button>
              <button className="hover:text-gray-700 transition-colors py-1">Privacy</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[400px] md:w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center mb-6 md:mb-8">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500 hidden sm:block">Close invoice and payment details</span>
          </div>

          {/* Payment Status */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-1">Paid on Nov 28, 2022</h2>
          </div>

          {/* Summary Section */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">SUMMARY</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">To</span>
                <span className="text-sm text-gray-900 text-right">Jill Romy</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">From</span>
                <span className="text-sm text-gray-900 text-right">CloudX Groupe LLC</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Invoice</span>
                <span className="text-sm text-gray-900 text-right">#FAA90E8A-0002</span>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">ITEMS</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">JULY 14, 2025 – JULY 14, 2023</p>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Inscription FANAF 2026</p>
                  <p className="text-sm text-gray-600">Qty 1</p>
                </div>
                <span className="text-sm font-medium text-gray-900 ml-4">350.000FCFA</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Total due</span>
                <span className="text-sm font-medium text-gray-900">350.000 FCFA</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Amount paid</span>
                <span className="text-sm font-medium text-gray-900">350.000FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Amount remaining</span>
                <span className="text-sm font-medium text-gray-900">$0.00</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6 md:pt-8">
            <p className="text-sm text-gray-600">
              Questions?{" "}
              <button className="text-blue-600 hover:text-blue-800 transition-colors">Contact CloudX Groupe LLC</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceInterface
