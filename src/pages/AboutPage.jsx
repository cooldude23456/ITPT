import React from 'react';
import {
  ShieldCheck,
  Award,
  ExternalLink,
  MapPin,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  BookOpen
} from 'lucide-react';

export default function AboutPage({ onExplore }) {
  return (
    <div className="min-h-screen bg-[#f7f9fa] py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-udemy-border p-8 shadow-sm space-y-4">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
            <span>About ITPracticeTests.com</span>
          </div>
          <h1 className="text-3xl font-extrabold text-udemy-dark leading-tight">
            Empowering Technology Professionals with Affordable, High-Yield Test Preparation
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            ITPracticeTests.com (formerly <strong className="text-udemy-dark">ExpertsTeachers</strong>) is an online IT education and exam-preparation platform offering affordable certification practice tests, IT interview-question practice tests, and online courses for technology professionals, students, and certification candidates.
          </p>
        </div>

        {/* Lead Instructor Profile */}
        <div className="bg-white rounded-2xl border border-udemy-border p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 text-white font-extrabold text-3xl flex items-center justify-center border-4 border-purple-500 shadow-lg shrink-0 tracking-wider select-none">
              YD
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Founder & Lead Instructor
              </span>
              <h2 className="text-xl font-extrabold text-udemy-dark">Yogesh Dhiman</h2>
              <p className="text-xs text-slate-500 font-medium">
                Senior Cloud Solutions Architect & Udemy Bestselling Instructor
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-700">
                <span>⭐ <strong>4.8</strong> Rating</span>
                <span>👥 <strong>48,000+</strong> Students</span>
                <span>🎓 <strong>160+</strong> Practice Tests</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Yogesh Dhiman is an acclaimed technical trainer and cloud architect. Having trained thousands of candidates globally through his bestselling courses on Udemy, Yogesh established ITPracticeTests to provide dedicated, distraction-free practice simulators, verified explanations, and comprehensive interview practice directly to students worldwide.
          </p>

          {onExplore && (
            <button
              onClick={onExplore}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              <span>Explore Practice Tests</span>
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Corporate & Registration Information */}
        <div className="bg-white rounded-2xl border border-udemy-border p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-udemy-dark border-b border-slate-100 pb-3">
            Company & Legal Registration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-udemy-dark block">Registered Business Office:</strong>
                  <span>
                    ITPracticeTests<br />
                    Office No. 715, Seventh Floor, Block D&E<br />
                    Chandigarh Citi Center, VIP Road<br />
                    Zirakpur, Punjab, India – 140603
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-udemy-dark">Goods & Services Tax (GSTIN):</strong>{' '}
                  <span className="font-mono font-semibold">03AKXPD3010G1ZM</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <strong className="text-udemy-dark">Customer Support:</strong>{' '}
                  <a href="mailto:support@itpracticetests.com" className="text-purple-700 hover:underline">
                    support@itpracticetests.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="text-udemy-dark">Direct Phone / WhatsApp:</strong>{' '}
                  <span>+91-9253330335</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <strong className="text-udemy-dark">Support Hours:</strong>{' '}
                  <span>Monday–Saturday, 9:00 AM – 6:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <button
            onClick={onExplore}
            className="bg-udemy-purple hover:bg-udemy-purple-hover text-white text-xs font-bold px-6 py-3 rounded-lg shadow-sm transition"
          >
            Explore All Practice Tests & Courses
          </button>
        </div>
      </div>
    </div>
  );
}
