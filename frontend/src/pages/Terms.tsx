import PageMeta from "../components/layout/PageMeta";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-paper pt-32">
      <PageMeta
        title="Terms | Chicken House"
        description="Terms of use for Chicken House website ordering, bookings, and customer account access."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-dark">Terms of Service</h1>
          <div className="mt-8 space-y-5 text-sm leading-8 text-muted">
            <p>By using the Chicken House website, you agree to provide accurate information for orders, bookings, and contact forms.</p>
            <p>Order prices, availability, and delivery timing may change based on menu availability, business hours, and restaurant operations.</p>
            <p>Bookings submitted through the site are treated as requests until the restaurant confirms them directly.</p>
            <p>Chicken House may update menu items, pricing, service areas, and policies as part of normal restaurant operations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
