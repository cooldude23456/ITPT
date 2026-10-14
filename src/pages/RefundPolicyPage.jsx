import React, { useEffect } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  FileText,
  CreditCard,
  Lock
} from 'lucide-react';

export default function RefundPolicyPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-10 px-4 font-sans text-udemy-dark">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <button
            onClick={() => onNavigate ? onNavigate('home') : window.history.back()}
            className="inline-flex items-center space-x-1.5 font-bold text-purple-700 hover:text-purple-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center space-x-2">
            <span>ITPracticeTests</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-700 font-semibold">Refund Policy</span>
          </div>
        </div>

        {/* Main Document Container */}
        <div className="bg-white rounded-2xl border border-udemy-border shadow-sm p-6 sm:p-10 md:p-12 space-y-8">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 space-y-3">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Consumer Protection &amp; Cancellation Policy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-udemy-dark tracking-tight">
              Refund Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Clear, transparent, and fair returns for all learners on <strong>www.ITPracticeTests.com</strong>
            </p>
          </div>

          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-4 flex flex-col items-start space-y-1.5">
              <div className="flex items-center space-x-2 text-purple-700 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>30-Day Window</span>
              </div>
              <p className="text-xs text-slate-600">
                Request a return or refund within 30 days of receiving your item or order confirmation.
              </p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col items-start space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                <CreditCard className="w-4 h-4" />
                <span>10 Business Days</span>
              </div>
              <p className="text-xs text-slate-600">
                Approved refunds are processed automatically back to your original payment method.
              </p>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col items-start space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>EU 14-Day Cooling Off</span>
              </div>
              <p className="text-xs text-slate-600">
                Unconditional right to cancel or return for EU customers within 14 days without justification.
              </p>
            </div>
          </div>

          {/* Section: Standard Return Policy */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-purple-600 pl-3">
              1. 30-Day Return Policy
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                We have a <strong>30-day return policy</strong>, which means you have <strong>30 days</strong> after receiving your item to request a return.
              </p>
              <p>
                To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>How to Start a Return</span>
                </h4>
                <p className="text-xs text-slate-600">
                  To start a return, you can contact us at{' '}
                  <a href="mailto:support@itpracticetests.com" className="text-purple-700 underline font-semibold">
                    support@itpracticetests.com
                  </a>
                  . Please note that returns will need to be sent to the following address:{' '}
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    support@itpracticetests.com
                  </span>
                </p>
                <p className="text-xs text-slate-600">
                  If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package. <strong>Items sent back to us without first requesting a return will not be accepted.</strong>
                </p>
                <p className="text-xs text-slate-600">
                  You can always contact us for any return question at{' '}
                  <a href="mailto:support@itpracticetests.com" className="text-purple-700 underline font-semibold">
                    support@itpracticetests.com
                  </a>.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Damages and Issues */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-purple-600 pl-3">
              2. Damages and Issues
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
              </p>
              <div className="flex items-start space-x-2 bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Immediate reporting allows our technical and customer satisfaction team to inspect system records or physical deliveries and issue expedited replacements or credit without delay.
                </span>
              </div>
            </div>
          </section>

          {/* Section: Exceptions / Non-Returnable Items */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-purple-600 pl-3">
              3. Exceptions / Non-Returnable Items
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
              </p>
              <div className="bg-red-50/70 border border-red-200 text-red-900 text-xs p-3.5 rounded-xl font-medium">
                <strong>Sale Items &amp; Gift Cards:</strong> Unfortunately, we cannot accept returns on sale items or gift cards.
              </div>
            </div>
          </section>

          {/* Section: Exchanges */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-purple-600 pl-3">
              4. Exchanges
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
              </p>
            </div>
          </section>

          {/* Section: European Union 14-day cooling off period */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-purple-600 pl-3">
              5. European Union 14-Day Cooling Off Period
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within <strong>14 days</strong>, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
              </p>
            </div>
          </section>

          {/* Section: Refunds */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-purple-600 pl-3">
              6. Refunds &amp; Processing Timelines
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within <strong>10 business days</strong>. Please remember it can take some time for your bank or credit card company to process and post the refund too.
              </p>
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-xs text-purple-950 font-medium">
                <strong>Need Help with a Delay?</strong> If more than <strong>15 business days</strong> have passed since we’ve approved your return, please contact us immediately at{' '}
                <a href="mailto:support@itpracticetests.com" className="underline font-bold text-purple-700">
                  support@itpracticetests.com
                </a>
                .
              </div>
            </div>
          </section>

          {/* Payment Security Badge & Methods */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure Checkout &amp; Payment Partners</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">Visa</span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">Mastercard</span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">American Express</span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">RuPay</span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">UPI / GPay / PhonePe</span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">Net Banking</span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">PayPal</span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">Razorpay / Cashfree</span>
            </div>
          </div>

          {/* Support and Registered Office Card */}
          <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span>Questions About Returns or Refunds?</span>
            </h3>
            <p className="text-xs text-slate-300">
              Our support team is available 24/7 to assist you with order verification, return authorizations, and dispute resolution.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="flex items-start space-x-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Email Inquiries</div>
                  <a href="mailto:support@itpracticetests.com" className="hover:text-purple-300 underline">
                    support@itpracticetests.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Call / WhatsApp Support</div>
                  <a href="tel:+919253330335" className="hover:text-purple-300">
                    +91-9253330335
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 text-slate-300 sm:col-span-2">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Registered Office:</div>
                  <div className="text-slate-300">
                    ITPracticeTests, Office No. 715, Seventh Floor, Block D&amp;E, Chandigarh Citi Center, VIP Road, Zirakpur, Punjab, India – 140603
                  </div>
                  <div className="text-slate-400 mt-0.5">GSTIN: 03AKXPD3010G1ZM • Mon–Sat 9:00 AM – 6:00 PM IST</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => onNavigate ? onNavigate('terms') : null}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold inline-flex items-center space-x-1"
            >
              <span>View Terms of Service</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('privacy') : null}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold inline-flex items-center space-x-1"
            >
              <span>View Privacy Policy</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('home') : window.history.back()}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
