import PageMeta from "../components/layout/PageMeta";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-paper pt-32">
      <PageMeta
        title="Privacy Policy | Chicken House"
        description="Read how Chicken House handles customer information for orders, bookings, and contact requests."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
          <h1 className="text-4xl font-display font-bold text-dark">Privacy Policy</h1>
          <div className="mt-8 space-y-5 text-sm leading-8 text-muted">
            <p>Chicken House collects only the information needed to process orders, table bookings, contact inquiries, and customer account activity.</p>
            <p>Basic details may include your name, email, phone number, delivery address, order history, and booking requests. This information is used only for customer service and restaurant operations.</p>
            <p>We do not intentionally publish or resell your personal information. Data is stored to support account access, order tracking, and communication related to your request.</p>
            <p>If you want profile information updated or removed, contact the restaurant team directly through the contact page or official phone number.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
