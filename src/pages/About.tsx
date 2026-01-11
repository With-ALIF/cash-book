import Layout from '@/components/Layout';
import { Wallet, Target, PieChart, FileText, Shield, Smartphone, Github, Mail, Globe } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'বাজেট পরিকল্পনা',
    description: 'প্রতি মাসের জন্য নির্দিষ্ট বাজেট নির্ধারণ করুন এবং খরচের উপর নিয়ন্ত্রণ রাখুন।',
  },
  {
    icon: Target,
    title: 'ক্যাটাগরি ভিত্তিক খরচ',
    description: 'খাবার, যাতায়াত, বিল ও শপিংসহ বিভিন্ন ক্যাটাগরিতে খরচ ভাগ করুন।',
  },
  {
    icon: PieChart,
    title: 'ভিজ্যুয়াল বিশ্লেষণ',
    description: 'পাই চার্ট ও বার চার্টের মাধ্যমে খরচের প্রবণতা বুঝুন।',
  },
  {
    icon: FileText,
    title: 'PDF রিপোর্ট',
    description: 'যেকোনো মাসের বিস্তারিত রিপোর্ট PDF আকারে ডাউনলোড করুন।',
  },
  {
    icon: Shield,
    title: 'নিরাপদ ডেটা',
    description: 'আপনার আর্থিক তথ্য সম্পূর্ণ নিরাপদ ও ব্যক্তিগত রাখা হয়।',
  },
  {
    icon: Smartphone,
    title: 'মোবাইল ফ্রেন্ডলি',
    description: 'মোবাইল, ট্যাব ও ডেস্কটপ—সব ডিভাইসে সুন্দরভাবে কাজ করে।',
  },
];

export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Wallet className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">ক্যাশ বুক</h1>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            আপনার দৈনন্দিন খরচ ও বাজেট ব্যবস্থাপনার জন্য একটি স্মার্ট সমাধান
          </p>
        </div>

        <div className="stat-card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            অ্যাপ সম্পর্কে
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            ক্যাশ বুক একটি আধুনিক ও ব্যবহারবান্ধব পার্সোনাল ফাইন্যান্স অ্যাপ,
            যা দৈনন্দিন খরচ ও মাসিক বাজেট সহজভাবে ট্র্যাক করতে সহায়তা করে।
            বাংলাদেশি টাকায় হিসাব, ক্যাটাগরি ভিত্তিক বিশ্লেষণ এবং ভিজ্যুয়াল
            চার্টের মাধ্যমে আর্থিক সচেতনতা গড়ে তুলতে এটি কার্যকর ভূমিকা রাখে।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="stat-card p-4 animate-fade-in">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="stat-card p-6 sm:p-8">
            <div className="flex flex-col items-center gap-3">
              <img
                src="https://github.com/With-ALIF/logo_zone/blob/main/alif/logo.jpg?raw=true"
                alt="Abdullah Al Khalid Alif"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-semibold">
                  আব্দুল্লাহ আল খালিদ আলিফ
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  এই অ্যাপটির ডিজাইন, ডেভেলপমেন্ট ও নিয়মিত রক্ষণাবেক্ষণের দায়িত্বে রয়েছেন।
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com/With-ALIF" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5" />
                </a>
                <a href="mailto:alifbrur16@gmail.com">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://alif-protfolio.netlify.app/" target="_blank" rel="noopener noreferrer">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="stat-card p-6 sm:p-8">
            <div className="flex flex-col items-center gap-3">
              <img
                src="https://github.com/With-ALIF/logo_zone/blob/main/person/naimur.png?raw=true"
                alt="Naimur Rahman"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-semibold">
                  মো: নাইমুর রহমান
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  প্রজেক্টের সার্বিক তত্ত্বাবধান, পরিকল্পনা ও দিকনির্দেশনা প্রদান করেছেন।
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com/MNRfrom2020" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5" />
                </a>
                <a href="mailto:mail@mnr.world">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://naimur.mnr.world/" target="_blank" rel="noopener noreferrer">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-6 border-t">
          <p className="text-sm text-muted-foreground">
            ক্যাশ বুক   |  <span className="font-semibold">Version 1.0</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}