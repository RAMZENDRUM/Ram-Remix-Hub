import Pricing from '@/components/home/Pricing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="pt-20">
                <Pricing />
            </div>
            <Footer />
        </div>
    );
}
