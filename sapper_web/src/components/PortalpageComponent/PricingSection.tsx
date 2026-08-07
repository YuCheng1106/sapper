// import React, { useState } from 'react';
// import { Check, X } from 'lucide-react';
//
// const PricingToggle: React.FC<{
//   isAnnual: boolean;
//   setIsAnnual: (value: boolean) => void;
// }> = ({ isAnnual, setIsAnnual }) => {
//   return (
//     <div className="flex items-center justify-center mb-8 space-x-4">
//       <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
//         Monthly
//       </span>
//       <button
//         className="relative w-12 h-6 transition-colors duration-200 ease-in-out bg-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
//         onClick={() => setIsAnnual(!isAnnual)}
//       >
//         <span
//           className={`inline-block w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full ${isAnnual ? 'translate-x-7' : 'translate-x-1'}`}
//         />
//       </button>
//       <div className="flex items-center space-x-1">
//         <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
//           Annual
//         </span>
//         <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
//           Save 20%
//         </span>
//       </div>
//     </div>
//   );
// };
//
// const PricingCard: React.FC<{
//   title: string;
//   price: string;
//   monthlyPrice: string;
//   annualPrice: string;
//   description: string;
//   features: string[];
//   notIncluded?: string[];
//   isPopular?: boolean;
//   isAnnual: boolean;
//   ctaText: string;
//   ctaLink: string;
// }> = ({
//   title,
//   monthlyPrice,
//   annualPrice,
//   description,
//   features,
//   notIncluded = [],
//   isPopular = false,
//   isAnnual,
//   ctaText,
//   ctaLink
// }) => {
//   const currentPrice = isAnnual ? annualPrice : monthlyPrice;
//
//   return (
//     <div className={`relative bg-white rounded-xl ${isPopular ? 'border-2 border-indigo-600 shadow-lg' : 'border border-gray-100 shadow-sm'} overflow-hidden transition-all hover:shadow-md`}>
//       {isPopular && (
//         <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 transform translate-x-6 rotate-45">
//           Popular
//         </div>
//       )}
//
//       <div className="p-6 md:p-8">
//         <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
//         <p className="text-gray-600 mb-4">{description}</p>
//
//         <div className="mb-6">
//           <span className="text-4xl font-bold text-gray-900">{currentPrice}</span>
//           <span className="text-gray-500 ml-2">{isAnnual ? '/year' : '/month'}</span>
//         </div>
//
//         <a
//           href={ctaLink}
//           className={`block w-full py-2 px-4 rounded-full text-center font-medium ${isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} transition-colors mb-6`}
//         >
//           {ctaText}
//         </a>
//
//         <div className="space-y-3">
//           {features.map((feature, index) => (
//             <div key={index} className="flex items-start">
//               <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
//               <span className="text-gray-700">{feature}</span>
//             </div>
//           ))}
//
//           {notIncluded.map((feature, index) => (
//             <div key={index} className="flex items-start text-gray-400">
//               <X size={18} className="text-gray-300 mt-0.5 mr-2 flex-shrink-0" />
//               <span>{feature}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
//
// const PricingSection: React.FC = () => {
//   const [isAnnual, setIsAnnual] = useState(true);
//
//   return (
//     <section id="pricing" className="py-16 md:py-24 bg-gray-50">
//       <div className="container mx-auto px-4 md:px-6">
//         <div className="max-w-3xl mx-auto text-center mb-12">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Simple, transparent pricing
//           </h2>
//           <p className="text-lg text-gray-600">
//             Choose the plan that's right for your business, from startups to enterprise solutions
//           </p>
//         </div>
//
//         <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
//
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
//           <PricingCard
//             title="Free"
//             monthlyPrice="$0"
//             annualPrice="$0"
//             description="Perfect for trying out the platform"
//             isAnnual={isAnnual}
//             features={[
//               "1 bot",
//               "1,000 messages/month",
//               "Basic templates",
//               "Standard AI model",
//               "Community support"
//             ]}
//             notIncluded={[
//               "Custom branding",
//               "Advanced analytics",
//               "Priority support"
//             ]}
//             ctaText="Get started free"
//             ctaLink="#signup-free"
//           />
//
//           <PricingCard
//             title="Pro"
//             monthlyPrice="$29"
//             annualPrice="$279"
//             description="For growing teams and businesses"
//             isAnnual={isAnnual}
//             isPopular={true}
//             features={[
//               "5 bots",
//               "10,000 messages/month",
//               "All templates",
//               "Advanced AI model",
//               "Custom branding",
//               "Basic analytics",
//               "Email support"
//             ]}
//             notIncluded={[
//               "Enterprise integrations",
//               "Dedicated account manager"
//             ]}
//             ctaText="Start 14-day trial"
//             ctaLink="#signup-pro"
//           />
//
//           <PricingCard
//             title="Enterprise"
//             monthlyPrice="$99"
//             annualPrice="$949"
//             description="For organizations with advanced needs"
//             isAnnual={isAnnual}
//             features={[
//               "Unlimited bots",
//               "100,000 messages/month",
//               "All templates",
//               "Premium AI model",
//               "Custom branding",
//               "Advanced analytics",
//               "API access",
//               "Enterprise integrations",
//               "Priority support",
//               "Dedicated account manager"
//             ]}
//             ctaText="Contact sales"
//             ctaLink="#contact-sales"
//           />
//         </div>
//       </div>
//     </section>
//   );
// };
//
// export default PricingSection;