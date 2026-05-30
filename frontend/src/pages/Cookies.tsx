import PageMeta from "../components/layout/PageMeta";

const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-paper pt-32">
      <PageMeta
        title="Cookies | Chicken House"
        description="Cookie usage information for Chicken House website sessions, cart data, and preferences."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
          <h1 className="text-4xl font-display font-bold text-dark">Cookie Notice</h1>
          <div className="mt-8 space-y-5 text-sm leading-8 text-muted">
            <p>Chicken House uses basic browser storage and session cookies to support sign-in, cart persistence, and smoother customer navigation.</p>
            <p>These cookies help keep your session active, remember menu selections, and support customer actions like checkout and order tracking.</p>
            <p>If you clear browser storage or block cookies completely, parts of the website may not work as intended.</p>
            <p>You can manage cookie preferences from your browser settings at any time.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiesPage;
