import { motion } from "motion/react";
import { ArrowLeft, Compass, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-paper pt-28">
      <PageMeta
        title="Page Not Found | Chicken House"
        description="The page you requested could not be found on the Chicken House website."
      />

      <section className="relative pb-24">
        <div className="absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_right,rgba(255,170,73,0.18),transparent_38%),radial-gradient(circle_at_top_left,rgba(210,74,21,0.1),transparent_30%)]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[3rem] border border-gray-100 bg-white p-10 text-center shadow-[0_34px_90px_rgba(27,18,14,0.08)] md:p-16"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Compass size={34} />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.32em] text-primary">404</p>
            <h1 className="mt-5 text-5xl font-display font-bold text-dark">This page is not available.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
              The link may be outdated, or the page may have moved. Use the quick routes below to continue browsing
              Chicken House without losing your place.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-dark"
              >
                <ArrowLeft size={18} />
                Go Home
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 font-bold text-dark transition hover:border-primary/30 hover:text-primary"
              >
                Browse Menu
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 font-bold text-dark transition hover:border-primary/30 hover:text-primary"
              >
                Contact Us
                <MapPin size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;
