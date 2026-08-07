import Header from '../../components/PortalpageComponent/Header.tsx';
import HeroSection from '../../components/PortalpageComponent/HeroSection.tsx';
import FeaturesSection from '../../components/PortalpageComponent/FeaturesSection.tsx';
import TemplatesSection from '../../components/PortalpageComponent/TemplatesSection.tsx';
// import TestimonialsSection from '../../components/PortalpageComponent/TestimonialsSection.tsx';
import FaqSection from '../../components/PortalpageComponent/FaqSection.tsx';
import Footer from '../../components/PortalpageComponent/Footer';
import './index.css';

const PortalPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <HeroSection />
                <FeaturesSection />
                <TemplatesSection />
                {/*<PricingSection />*/}
                {/*<TestimonialsSection />*/}
                <FaqSection />
            </main>
            <Footer />
        </div>
    );
}

export default PortalPage;