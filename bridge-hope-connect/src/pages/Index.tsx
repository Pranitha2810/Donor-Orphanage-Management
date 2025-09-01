import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { AuthModal } from '@/components/auth/AuthModal';
import heroImage from '@/assets/hero-donation.jpg';
import communityImage from '@/assets/community-help.jpg';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showAuth onLogin={handleLogin} onSignup={handleSignup} />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={heroImage}
                alt="Helping hands supporting children"
                className="w-full rounded-lg shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Building Bridges of{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Hope & Trust
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                DonorBridge creates transparent connections between generous donors, trusted NGOs, and orphanages in need. 
                Every donation is tracked, every impact is measured, and every child's future is brightened through our 
                secure and accountable platform. Join thousands of compassionate individuals making a real difference 
                in vulnerable communities worldwide.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={handleSignup}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Donating
                </button>
                <button 
                  onClick={handleLogin}
                  className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Transparent Impact,{' '}
                <span className="text-secondary">Measurable Change</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our platform ensures complete transparency in the donation process. From the moment you contribute 
                to when your donation reaches those in need, you can track every step. NGOs are verified and 
                monitored, orphanages receive exactly what they need, and donors see the direct impact of their 
                generosity through real-time updates and detailed reports.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Verified NGOs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">1,200+</div>
                  <div className="text-sm text-muted-foreground">Children Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">$2.5M+</div>
                  <div className="text-sm text-muted-foreground">Donated</div>
                </div>
              </div>
            </div>
            <div>
              <img
                src={communityImage}
                alt="Community helping children"
                className="w-full rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community of donors, NGOs, and orphanages working together for a better tomorrow.
          </p>
          <button 
            onClick={handleSignup}
            className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
};

export default Index;
