import React, { useEffect } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  Lock,
  Database,
  UserCheck,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function PrivacyPolicyPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
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
            <span className="text-gray-700 font-semibold">Privacy Policy</span>
          </div>
        </div>

        {/* Main Document Container */}
        <div className="bg-white rounded-2xl border border-udemy-border shadow-sm p-6 sm:p-10 md:p-12 space-y-8">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 space-y-3">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Data Protection &amp; Privacy Standards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-udemy-dark tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Last updated: <strong>April 12, 2026</strong> • Official privacy governance for <strong>www.ITPracticeTests.com</strong>
            </p>
          </div>

          {/* Table of Quick Links */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs space-y-2">
            <div className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
              Privacy Policy Contents
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-purple-700 font-medium">
              <a href="#overview" className="hover:underline flex items-center space-x-1">
                <span>• Overview &amp; Scope</span>
              </a>
              <a href="#info-collected" className="hover:underline flex items-center space-x-1">
                <span>• Information Collected</span>
              </a>
              <a href="#sources" className="hover:underline flex items-center space-x-1">
                <span>• Sources of Information</span>
              </a>
              <a href="#how-we-use" className="hover:underline flex items-center space-x-1">
                <span>• How We Use Personal Info</span>
              </a>
              <a href="#how-we-disclose" className="hover:underline flex items-center space-x-1">
                <span>• How We Disclose Data</span>
              </a>
              <a href="#shopify-relationship" className="hover:underline flex items-center space-x-1">
                <span>• Relationship with Shopify</span>
              </a>
              <a href="#third-party-links" className="hover:underline flex items-center space-x-1">
                <span>• Third Party Websites</span>
              </a>
              <a href="#childrens-data" className="hover:underline flex items-center space-x-1">
                <span>• Children's Data</span>
              </a>
              <a href="#security-retention" className="hover:underline flex items-center space-x-1">
                <span>• Security &amp; Retention</span>
              </a>
              <a href="#rights-choices" className="hover:underline flex items-center space-x-1">
                <span>• Your Rights &amp; Choices</span>
              </a>
              <a href="#eea-uk-rights" className="hover:underline flex items-center space-x-1">
                <span>• UK / EEA Rights</span>
              </a>
              <a href="#complaints-transfers" className="hover:underline flex items-center space-x-1">
                <span>• Complaints &amp; Transfers</span>
              </a>
            </div>
          </div>

          {/* Section: Overview */}
          <section id="overview" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Overview
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                <strong>ITPracticeTests</strong> operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the &ldquo;Services&rdquo;). ITPracticeTests is powered by Shopify, which enables us to provide the Services to you.
              </p>
              <p>
                This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.
              </p>
              <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900">
                Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.
              </div>
            </div>
          </section>

          {/* Section: Personal Information We Collect or Process */}
          <section id="info-collected" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Personal Information We Collect or Process
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                When we use the term &ldquo;personal information,&rdquo; we are referring to information that identifies or can reasonably be linked to you or another person. Personal information does not include information that is collected anonymously or that has been de-identified, so that it cannot identify or be reasonably linked to you. We may collect or process the following categories of personal information, including inferences drawn from this personal information, depending on how you interact with the Services, where you live, and as permitted or required by applicable law:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-700">
                <li>
                  <strong>Contact details:</strong> including your name, address, billing address, shipping address, phone number, and email address.
                </li>
                <li>
                  <strong>Financial information:</strong> including credit card, debit card, and financial account numbers, payment card information, financial account information, transaction details, form of payment, payment confirmation and other payment details.
                </li>
                <li>
                  <strong>Account information:</strong> including your username, password, security questions, preferences and settings.
                </li>
                <li>
                  <strong>Transaction information:</strong> including the items you view, put in your cart, add to your wishlist, or purchase, return, exchange or cancel and your past transactions.
                </li>
                <li>
                  <strong>Communications with us:</strong> including the information you include in communications with us, for example, when sending a customer support inquiry.
                </li>
                <li>
                  <strong>Device information:</strong> including information about your device, browser, or network connection, your IP address, and other unique identifiers.
                </li>
                <li>
                  <strong>Usage information:</strong> including information regarding your interaction with the Services, including how and when you interact with or navigate the Services.
                </li>
              </ul>
            </div>
          </section>

          {/* Section: Personal Information Sources */}
          <section id="sources" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Personal Information Sources
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>We may collect personal information from the following sources:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                  <span className="font-bold text-slate-900 block mb-1">Directly from you</span>
                  Including when you create an account, visit or use the Services, communicate with us, or otherwise provide us with your personal information.
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                  <span className="font-bold text-slate-900 block mb-1">Automatically through Services</span>
                  From your device when you use our products or services or visit our websites, and through the use of cookies and similar technologies.
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                  <span className="font-bold text-slate-900 block mb-1">From our service providers</span>
                  When we engage them to enable certain technology and when they collect or process your personal information on our behalf.
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                  <span className="font-bold text-slate-900 block mb-1">From partners or third parties</span>
                  Authorized educational partners, secure payment gateways, identity verification providers, and analytics services.
                </div>
              </div>
            </div>
          </section>

          {/* Section: How We Use Your Personal Information */}
          <section id="how-we-use" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              How We Use Your Personal Information
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>Depending on how you interact with us or which of the Services you use, we may use personal information for the following purposes:</p>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <p>
                  <strong>Provide, Tailor, and Improve the Services:</strong> We use your personal information to provide you with the Services, including to perform our contract with you, to process your payments, to fulfill your orders, to remember your preferences and items you are interested in, to send notifications to you related to your account, to process purchases, returns, exchanges or other transactions, to create, maintain and otherwise manage your account, to arrange for shipping, to facilitate any returns and exchanges, to enable you to post reviews, and to create a customized shopping experience for you, such as recommending products related to your purchases. This may include using your personal information to better tailor and improve the Services.
                </p>
                <p>
                  <strong>Marketing and Advertising:</strong> We use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you online advertisements for products or services on the Services or other websites, including based on items you previously have purchased or added to your cart and other activity on the Services.
                </p>
                <p>
                  <strong>Security and Fraud Prevention:</strong> We use your personal information to authenticate your account, to provide a secure payment and shopping experience, detect, investigate or take action regarding possible fraudulent, illegal, unsafe, or malicious activity, protect public safety, and to secure our services. If you choose to use the Services and register an account, you are responsible for keeping your account credentials safe. We highly recommend that you do not share your username, password or other access details with anyone else.
                </p>
                <p>
                  <strong>Communicating with You:</strong> We use your personal information to provide you with customer support, to be responsive to you, to provide effective services to you and to maintain our business relationship with you.
                </p>
                <p>
                  <strong>Legal Reasons:</strong> We use your personal information to comply with applicable law or respond to valid legal process, including requests from law enforcement or government agencies, to investigate or participate in civil discovery, potential or actual litigation, or other adversarial legal proceedings, and to enforce or investigate potential violations of our terms or policies.
                </p>
              </div>
            </div>
          </section>

          {/* Section: How We Disclose Personal Information */}
          <section id="how-we-disclose" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              How We Disclose Personal Information
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to this Privacy Policy. Such circumstances may include:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  With Shopify, vendors and other third parties who perform services on our behalf (e.g. IT management, payment processing, data analytics, customer support, cloud storage, fulfillment and shipping).
                </li>
                <li>
                  With business and marketing partners to provide marketing services and advertise to you. For example, we use Shopify to support personalized advertising with third-party services based on your online activity with different merchants and websites. Our business and marketing partners will use your information in accordance with their own privacy notices. Depending on where you reside, you may have a right to direct us not to share information about you to show you targeted advertisements and marketing based on your online activity with different merchants and websites.
                </li>
                <li>
                  When you direct, request us or otherwise consent to our disclosure of certain information to third parties, such as to ship you products or through your use of social media widgets or login integrations.
                </li>
                <li>
                  With our affiliates or otherwise within our corporate group.
                </li>
                <li>
                  In connection with a business transaction such as a merger or bankruptcy, to comply with any applicable legal obligations (including to respond to subpoenas, search warrants and similar requests), to enforce any applicable terms of service or policies, and to protect or defend the Services, our rights, and the rights of our users or others.
                </li>
              </ul>
            </div>
          </section>

          {/* Section: Relationship with Shopify */}
          <section id="shopify-relationship" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Relationship with Shopify
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                The Services are hosted by Shopify, which collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in countries other than where you reside, in order to provide and improve the Services for you.
              </p>
              <p>
                In addition, to help protect, grow, and improve our business, we use certain Shopify enhanced features that incorporate data and information obtained from your interactions with our Store, along with other merchants and with Shopify. To provide these enhanced features, Shopify may make use of personal information collected about your interactions with our store, along with other merchants, and with Shopify. In these circumstances, Shopify is responsible for the processing of your personal information, including for responding to your requests to exercise your rights over use of your personal information for these purposes.
              </p>
              <p className="text-xs text-slate-600">
                To learn more about how Shopify uses your personal information and any rights you may have, you can visit the{' '}
                <a
                  href="https://privacy.shopify.com/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-700 underline font-semibold inline-flex items-center space-x-1"
                >
                  <span>Shopify Consumer Privacy Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>
            </div>
          </section>

          {/* Section: Third Party Websites and Links */}
          <section id="third-party-links" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Third Party Websites and Links
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                The Services may provide links to websites or other online platforms operated by third parties. If you follow links to sites not affiliated or controlled by us, you should review their privacy and security policies and other terms and conditions. We do not guarantee and are not responsible for the privacy or security of such sites, including the accuracy, completeness, or reliability of information found on these sites. Information you provide on public or semi-public venues, including information you share on third-party social networking platforms may also be viewable by other users of the Services and/or users of those third-party platforms without limitation as to its use by us or by a third party. Our inclusion of such links does not, by itself, imply any endorsement of the content on such platforms or of their owners or operators, except as disclosed on the Services.
              </p>
            </div>
          </section>

          {/* Section: Children's Data */}
          <section id="childrens-data" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Children's Data
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                The Services are not intended to be used by children, and we do not knowingly collect any personal information about children under the age of majority in your jurisdiction. If you are the parent or guardian of a child who has provided us with their personal information, you may contact us using the contact details set out below to request that it be deleted.
              </p>
              <p>
                As of the Effective Date of this Privacy Policy, we do not have actual knowledge that we &ldquo;share&rdquo; or &ldquo;sell&rdquo; (as those terms are defined in applicable law) personal information of individuals under 16 years of age.
              </p>
            </div>
          </section>

          {/* Section: Security and Retention */}
          <section id="security-retention" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Security and Retention of Your Information
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee &ldquo;perfect security.&rdquo; In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us.
              </p>
              <p>
                How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, to provide you with Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies.
              </p>
            </div>
          </section>

          {/* Section: Your Rights and Choices */}
          <section id="rights-choices" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Your Rights and Choices
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                Depending on where you live, you may have some or all of the rights listed below in relation to your personal information. However, these rights are not absolute, may apply only in certain circumstances and, in certain cases, we may decline your request as permitted by law:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Right to Access / Know:</strong> You may have a right to request access to personal information that we hold about you.
                </li>
                <li>
                  <strong>Right to Delete:</strong> You may have a right to request that we delete personal information we maintain about you.
                </li>
                <li>
                  <strong>Right to Correct:</strong> You may have a right to request that we correct inaccurate personal information we maintain about you.
                </li>
                <li>
                  <strong>Right of Portability:</strong> You may have a right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, in certain circumstances and with certain exceptions.
                </li>
                <li>
                  <strong>Right to Opt out of Sale or Sharing for Targeted Advertising:</strong> Depending on where you reside, you may have a right to opt out of the &ldquo;sale&rdquo; or &ldquo;share&rdquo; of your personal information or to opt out of the processing of your personal information for purposes considered to be &ldquo;targeted advertising&rdquo;, as defined in applicable privacy laws.
                </li>
              </ul>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 mt-2">
                <span className="font-bold text-slate-800 block">Global Privacy Control (GPC)</span>
                <p className="text-slate-600">
                  Please note that if you visit our website with the Global Privacy Control opt-out preference signal enabled, depending on where you are, we will automatically treat this as a request to opt-out for the device and browser that you use to visit the website. If we are able to associate the device sending the signal to a Shopify account, we will apply the opt out request to the account as well. To learn more about Global Privacy Control, you can visit{' '}
                  <a href="https://globalprivacycontrol.org/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline font-semibold">
                    https://globalprivacycontrol.org/
                  </a>
                  . Other than the Global Privacy Control, we do not recognize other &ldquo;Do Not Track&rdquo; signals that may be sent from your web browser or device.
                </p>
                <span className="font-bold text-slate-800 block pt-1">Managing Communication Preferences</span>
                <p className="text-slate-600">
                  We may send you promotional emails, and you may opt out of receiving these at any time by using the unsubscribe option displayed in our emails to you. If you opt out, we may still send you non-promotional emails, such as those about your account or orders that you have made.
                </p>
              </div>
            </div>
          </section>

          {/* Section: UK / European Economic Area Rights */}
          <section id="eea-uk-rights" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              UK / European Economic Area (EEA) Specific Rights
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                If you reside in the UK or European Economic Area, and subject to exceptions and limitations provided by local law, you may exercise the following rights in addition to the rights outlined above:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Objection to Processing and Restriction of Processing:</strong> You may have the right to ask us to stop or restrict our processing of personal information for certain purposes.
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> Where we rely on consent to process your personal information, you have the right to withdraw this consent. If you withdraw your consent, this will not affect the lawfulness of any processing based on your consent before its withdrawal.
                </li>
              </ul>
              <p className="text-xs text-slate-600">
                You may exercise any of these rights where indicated on the Services or by contacting us using the contact details provided below. To learn more about how Shopify uses your personal information and any rights you may have, including rights related to data processed by Shopify, you can visit{' '}
                <a href="https://privacy.shopify.com/en" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline font-semibold">
                  https://privacy.shopify.com/en
                </a>.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
                <strong>Non-Discrimination &amp; Verification:</strong> We will not discriminate against you for exercising any of these rights. We may need to verify your identity before we can process your requests, as permitted or required under applicable law. In accordance with applicable laws, you may designate an authorized agent to make requests on your behalf to exercise your rights. Before accepting such a request from an agent, we will require that the agent provide proof you have authorized them to act on your behalf, and we may need you to verify your identity directly with us. We will respond to your request in a timely manner as required under applicable law.
              </div>
            </div>
          </section>

          {/* Section: Complaints & International Transfers */}
          <section id="complaints-transfers" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Complaints &amp; International Transfers
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pl-4">
              <p>
                <strong>Complaints:</strong> If you have complaints about how we process your personal information, please contact us using the contact details provided below. Depending on where you live, you may have the right to appeal our decision by contacting us using the contact details set out below, or lodge your complaint with your local data protection authority. For the EEA, you can find a list of the responsible data protection supervisory authorities.
              </p>
              <p>
                <strong>International Transfers:</strong> Please note that we may transfer, store and process your personal information outside the country you live in. If we transfer your personal information out of the European Economic Area or the United Kingdom, we will rely on recognized transfer mechanisms like the European Commission's Standard Contractual Clauses, or any equivalent contracts issued by the relevant competent authority of the UK, as relevant, unless the data transfer is to a country that has been determined to provide an adequate level of protection.
              </p>
              <p>
                <strong>Changes to This Privacy Policy:</strong> We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on this website, update the &ldquo;Last updated&rdquo; date and provide notice as required by applicable law.
              </p>
            </div>
          </section>

          {/* Registered Office & Contact Information */}
          <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <Mail className="w-5 h-5 text-purple-400" />
              <span>Contact Us Regarding Your Privacy</span>
            </h3>
            <p className="text-xs text-slate-300">
              To exercise your privacy rights, request data deletion, or submit questions regarding this policy, please reach out to our privacy compliance officer:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="flex items-start space-x-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Privacy Inquiries Email</div>
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
                  <div className="text-slate-400 mt-0.5">GSTIN: 03AKXPD3010G1ZM • Office Hours: Monday to Saturday, 9:00 AM to 6:00 PM IST</div>
                  <div className="text-purple-300 font-semibold mt-0.5">Customer Support: 24*7 days</div>
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
              onClick={() => onNavigate ? onNavigate('refund') : null}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold inline-flex items-center space-x-1"
            >
              <span>View Refund Policy</span>
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
