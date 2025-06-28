import CountryProjects from "./_components/country-projects";
import CrmSectionCards from "./_components/crm-section-cards";
import TabTriggers from "./_components/tab-triggers";
import Transaction from "./_components/transaction";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <CrmSectionCards />
      <TabTriggers />
      <CountryProjects />
      <Transaction />
    </div>
  );
}
